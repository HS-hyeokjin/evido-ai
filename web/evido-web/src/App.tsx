import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import DocumentsUploadPage from "./pages/documents/DocumentsUploadPage";
import AskPage from "./pages/chat/AskPage";
import SettingsPage from "./pages/setting/SettingsPage";
import HelpPage from "./pages/help/HelpPage";


import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <DashboardPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/documents/upload", element: <DocumentsUploadPage /> },
            { path: "/ask", element: <AskPage /> },
            { path: "/settings", element: <SettingsPage /> },
            { path: "/help", element: <HelpPage /> },
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}
