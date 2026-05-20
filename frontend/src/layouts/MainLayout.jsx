import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useState, useEffect } from "react";

import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import ForgotModal from "../components/ForgotModal";
import VerifyModal from "../components/VerifyModal";
import ResetPasswordModal from "../components/ResetPasswordModal";

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
        bg-[#def1ff] 
        flex flex-col font-sans
        dark:bg-gray-900
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