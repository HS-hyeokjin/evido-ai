import {
    createContext,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../api/client";

export interface AuthUser {
    authenticated: boolean;
    principal?: string;
    role?: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

let initialAuthPromise: Promise<AuthUser> | null = null;

async function fetchAuthUser(): Promise<AuthUser> {
    const res = await api.get<AuthUser>("/api/auth/session");

    if (res.data.authenticated) {
        return res.data;
    }

    await api.post("/api/auth/guest/token");

    const guestRes = await api.get<AuthUser>("/api/auth/session");
    return guestRes.data;
}

function getInitialAuthUser(): Promise<AuthUser> {
    if (!initialAuthPromise) {
        initialAuthPromise = fetchAuthUser().catch((error) => {
            initialAuthPromise = null;
            throw error;
        });
    }

    return initialAuthPromise;
}

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshAuth = useCallback(async () => {
        setLoading(true);

        try {
            const authUser = await fetchAuthUser();
            setUser(authUser);
        } catch (error) {
            console.error("인증 에러", error);
            setUser({ authenticated: false });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        async function checkAuth() {
            try {
                const authUser = await getInitialAuthUser();

                if (mounted) {
                    setUser(authUser);
                }
            } catch (error) {
                console.error("인증 에러", error);

                if (mounted) {
                    setUser({ authenticated: false });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void checkAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            refreshAuth,
        }),
        [user, loading, refreshAuth]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}