import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";
import useWorkspaceInit from "../../hooks/useWorkspaceInit";
import AppLoadingScreen from "./AppLoadingScreen";

export default function AppLayout() {
    const { loading: authLoading } = useAuth();
    const { loading: workspaceLoading } = useWorkspaceInit();

    if (authLoading || workspaceLoading) {
        return <AppLoadingScreen />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                <div className="mx-auto w-full max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}