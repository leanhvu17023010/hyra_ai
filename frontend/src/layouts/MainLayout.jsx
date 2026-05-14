import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import ForgotModal from "../components/ForgotModal";
import VerifyModal from "../components/VerifyModal";

function MainLayout(){
    const [darkMode, setDarkMode] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState({ email: '', mode: '' });

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
    return(
        <div className="
        min-h-screen 
        bg-[#def1ff] 
        flex flex-col font-sans
        dark:bg-gray-900
        transition-colors
        duration-300
        ">
                <button onClick={()=> setDarkMode(!darkMode)}
                    className="fixed 
                    top-5 
                    right-50 
                    p-2 
                    rounded-full 
                    bg-gray-200 
                    dark:bg-gray-700 
                    text-gray-800 
                    dark:text-gray-200 
                    shadow-md 
                    hover:bg-gray-300 
                    dark:hover:bg-gray-600 
                    transition-colors z-50
                    cursor-pointer">
                    {darkMode ? <FiSun /> : <FiMoon />}
                </button>

            <Navbar setActiveModal={setActiveModal} />
            
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
                    username={modalData.username}
                    password={modalData.password}
                    onClose={() => setActiveModal(null)} 
                    onSwitch={handleSwitchModal} 
                />
            )}
+            <main className="flex-1 flex justify-center pt-10">
                <Outlet/> 
            </main>
        </div>
    )
}
export default MainLayout