import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export type { AuthUser } from "../contexts/AuthContext";

export default function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
    }

    return context;
}