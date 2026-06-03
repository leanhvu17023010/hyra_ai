import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Profile from "../components/Profile";
import AdminDashboard from "../pages/AdminDashboard";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <></>
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'admin',
                element: <AdminDashboard />
            }
        ]
    }
])
