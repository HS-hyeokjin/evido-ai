import { useEffect, useState } from "react";
import api from "../api/client";

export interface AuthUser {
    authenticated: boolean;
    principal?: string;
    role?: string;
}

export default function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        let mounted = true;

        async function checkAuth() {
            try {
                const res = await api.get<AuthUser>("/api/auth/session");
                if (!res.data.authenticated) {
                    await api.post("/api/auth/guest/token");
                    const guestRes = await api.get<AuthUser>("/api/auth/session");
                    if (mounted) {
                        setUser(guestRes.data);
                    }
                } else {
                    if (mounted) {
                        setUser(res.data);
                    }
                }
            } catch (err) {
                console.error("인증 에러", err);
                if (mounted) {
                    setUser({ authenticated: false });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }
        checkAuth();
        return () => {
            mounted = false;
        };

    }, []);

    return { user, loading };
}