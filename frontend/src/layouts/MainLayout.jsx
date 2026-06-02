import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react";
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"

import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import ForgotModal from "../components/auth/ForgotModal";
import VerifyModal from "../components/auth/VerifyModal";
import ResetPasswordModal from "../components/auth/ResetPasswordModal";
import useUIStore from "../store/uiStore";
import useAuthStore from "../store/authStore";
import { AnimatePresence } from "framer-motion";

function MainLayout(){
    const navigate = useNavigate();
    const location = useLocation();
    const { activeModal, modalData, setActiveModal, closeModal, switchModal, darkMode } = useUIStore();
    const { user, isInitialized } = useAuthStore();

    useEffect(() => {
        const handleOpenAuth = (e) => {
            if (e.detail) {
                setActiveModal(e.detail);
            }
        };
        window.addEventListener('open-auth-modal', handleOpenAuth);
        return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
    }, [setActiveModal]);
    
    // Initialize dark mode class on mount based on initial state
    useEffect(() => {
        if(darkMode){
            document.documentElement.classList.add("dark");
        }else{
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    // Auto-redirect admin users to admin panel upon landing on the homepage
    useEffect(() => {
        if (isInitialized && user && user.role && user.role.name === 'ADMIN') {
            if (location.pathname === '/') {
                navigate('/admin');
            }
        }
    }, [isInitialized, user, location.pathname, navigate]);

    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col overflow-hidden">
                <Navbar />
                <div className="flex-1 flex overflow-hidden">
                    <Outlet />
                </div>
            </div>
        );
    }

    return(
        <div className="
        min-h-screen 
        bg-slate-100
        dark:bg-slate-950
        text-slate-900
        dark:text-slate-50
        flex flex-col font-sans
        transition-colors
        duration-300
        ">
            <Navbar />
            
            <AnimatePresence>
                {activeModal === 'login' && (
                    <LoginModal 
                        key="login-modal"
                        onClose={closeModal} 
                        onSwitch={switchModal} 
                    />
                )}
                
                {activeModal === 'register' && (
                    <RegisterModal 
                        key="register-modal"
                        onClose={closeModal} 
                        onSwitch={switchModal} 
                    />
                )}

                {activeModal === 'forgot' && (
                    <ForgotModal 
                        key="forgot-modal"
                        onClose={closeModal} 
                        onSwitch={switchModal} 
                    />
                )}

                {activeModal === 'verify' && (
                    <VerifyModal 
                        key="verify-modal"
                        email={modalData.email}
                        otpMode={modalData.mode}
                        userName={modalData.userName}
                        password={modalData.password}
                        onClose={closeModal} 
                        onSwitch={switchModal} 
                    />
                )}

                {activeModal === 'reset-password' && (
                    <ResetPasswordModal 
                        key="reset-password-modal"
                        email={modalData.email}
                        otp={modalData.otp}
                        onClose={closeModal} 
                        onSwitch={switchModal} 
                    />
                )}
            </AnimatePresence>
            <main className="flex-1 flex justify-center pt-10 pb-20">
                <Outlet/> 
            </main>
            <Footer />
        </div>
    )
}
export default MainLayout;