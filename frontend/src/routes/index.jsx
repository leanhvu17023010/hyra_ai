// src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import Profile from "../components/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import GithubCallback from "../components/auth/GithubCallback";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'admin',
                element: <AdminDashboard />
            },
            {
                path: 'oauth/callback/github',
                element: <GithubCallback />
            }
        ]
    }
])
