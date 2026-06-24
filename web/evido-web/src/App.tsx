import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";

import DashboardPage from "./pages/dashboard/DashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import DocumentsUploadPage from "./pages/documents/DocumentsUploadPage";
import ConversationPage from "./pages/conversation/ConversationPage.tsx";
import SettingsPage from "./pages/setting/SettingsPage";
import HelpPage from "./pages/help/HelpPage";
import ConversationListPage from "./pages/conversation/ConversationListPage";
import IntroPage from "./pages/landing/IntroPage";

import NotFoundPage from "./pages/error/NotFoundPage";
import ForbiddenPage from "./pages/error/ForbiddenPage";
import ServerErrorPage from "./pages/error/ServerErrorPage";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const router = createBrowserRouter([
    {
        path: "/intro",
        element: <IntroPage />,
        errorElement: <ServerErrorPage />,
    },

    {
        element: <AppLayout />,
        errorElement: <ServerErrorPage />,
        children: [
            { path: "/", element: <DashboardPage /> },

            {
                path: "/workspace/:workspaceId",
                children: [
                    { index: true, element: <ConversationListPage /> },
                    { path: "conversation/:conversationId", element: <ConversationPage /> },
                    { path: "documents/upload", element: <DocumentsUploadPage /> },
                    { path: "settings", element: <SettingsPage /> },
                ],
            },

            { path: "/settings", element: <SettingsPage /> },
            { path: "/help", element: <HelpPage /> },
            { path: "/login", element: <LoginPage /> },

            { path: "/403", element: <ForbiddenPage /> },
            { path: "/500", element: <ServerErrorPage /> },

            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export default function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}