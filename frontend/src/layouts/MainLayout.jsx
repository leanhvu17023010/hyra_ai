import { Outlet } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import { useState, useEffect } from "react";

import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import ForgotModal from "../components/auth/ForgotModal";
import VerifyModal from "../components/auth/VerifyModal";
import ResetPasswordModal from "../components/auth/ResetPasswordModal";

function MainLayout(){
    const [darkMode, setDarkMode] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState({ email: '', mode: '', otp: '' });

    const handleSwitchModal = (modal, data = {}) => {
        setModalData(prev => ({ ...prev, ...data }));
        setActiveModal(modal);
    };

    useEffect(()=>{
        if(darkMode){
            document.documentElement.classList.add("dark");
        }else{
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        const handleOpenAuth = (e) => {
            if (e.detail) {
                setActiveModal(e.detail);
            }
        };
        window.addEventListener('open-auth-modal', handleOpenAuth);
        return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
    }, []);
    return(
        <div className="
        min-h-screen 
        bg-slate-50
        dark:bg-slate-950
        text-slate-900
        dark:text-slate-50
        flex flex-col font-sans
        transition-colors
        duration-300
        ">
            <Navbar 
                setActiveModal={setActiveModal} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
            />
            
            {activeModal === 'login' && (
                <LoginModal 
                    onClose={() => setActiveModal(null)} 
                    onSwitch={handleSwitchModal} 
                />
            )}
            
            {activeModal === 'register' && (
                <RegisterModal 
                    onClose={() => setActiveModal(null)} 
                    onSwitch={handleSwitchModal} 
                />
            )}

            {activeModal === 'forgot' && (
                <ForgotModal 
                    onClose={() => setActiveModal(null)} 
                    onSwitch={handleSwitchModal} 
                />
            )}

            {activeModal === 'verify' && (
                <VerifyModal 
                    email={modalData.email}
                    otpMode={modalData.mode}
                    userName={modalData.userName}
                    password={modalData.password}
                    onClose={() => setActiveModal(null)} 
                    onSwitch={handleSwitchModal} 
                />
            )}

            {activeModal === 'reset-password' && (
                <ResetPasswordModal 
                    email={modalData.email}
                    otp={modalData.otp}
                    onClose={() => setActiveModal(null)} 
                    onSwitch={handleSwitchModal} 
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