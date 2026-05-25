import { Outlet } from "react-router-dom"
import { useEffect } from "react";
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"

import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import ForgotModal from "../components/auth/ForgotModal";
import VerifyModal from "../components/auth/VerifyModal";
import ResetPasswordModal from "../components/auth/ResetPasswordModal";
import useUIStore from "../store/uiStore";

function MainLayout(){
    const { activeModal, modalData, setActiveModal, closeModal, switchModal, darkMode } = useUIStore();

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
            
            {activeModal === 'login' && (
                <LoginModal 
                    onClose={closeModal} 
                    onSwitch={switchModal} 
                />
            )}
            
            {activeModal === 'register' && (
                <RegisterModal 
                    onClose={closeModal} 
                    onSwitch={switchModal} 
                />
            )}

            {activeModal === 'forgot' && (
                <ForgotModal 
                    onClose={closeModal} 
                    onSwitch={switchModal} 
                />
            )}

            {activeModal === 'verify' && (
                <VerifyModal 
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
                    email={modalData.email}
                    otp={modalData.otp}
                    onClose={closeModal} 
                    onSwitch={switchModal} 
                />
            )}
            <main className="flex-1 flex justify-center pt-10 pb-20">
                <Outlet/> 
            </main>
            <Footer />
        </div>
    )
}
export default MainLayout