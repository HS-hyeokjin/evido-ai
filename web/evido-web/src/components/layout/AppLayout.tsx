import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-white">
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 bg-white p-5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
