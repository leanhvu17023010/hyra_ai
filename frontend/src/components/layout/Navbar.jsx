import { useState, useEffect } from "react";

import {
    FiUser,
    FiLogOut,
    FiSun,
    FiMoon,
    FiShield
} from "react-icons/fi";

import authService from "../../services/authService";
import { Link } from "react-router-dom";
import useUIStore from "../../store/uiStore";
import useAuthStore from "../../store/authStore";

function Navbar() {
    const { setActiveModal, darkMode, toggleDarkMode } = useUIStore();
    const { user, isInitialized, fetchUser, logout } = useAuthStore();

    // DROPDOWN
    const [openDropdown, setOpenDropdown] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            fetchUser();
        }
    }, [isInitialized, fetchUser]);

    const handleLogout = () => {
        authService.logout();
        logout();
    };

    return (

        <nav
            className="
                sticky
                top-0
                z-50
                flex
                justify-between
                items-center
                px-8
                py-4
                backdrop-blur-md
                bg-white/80
                dark:bg-slate-950/80
                text-slate-900
                dark:text-slate-50
                shadow-sm
                border-b
                border-slate-200/80
                dark:border-slate-900
            "
        >

            {/* LEFT: LOGO + DARK MODE */}
            <div className="flex items-center gap-3">
            <Link to={user && user.role && user.role.name === 'ADMIN' ? "/admin" : "/"} >

                {/* LOGO */}
                <h1
                    className="text-3xl font-bold"
                >
                    Hyra AI
                </h1>
            </Link>
                {/* DARK MODE TOGGLE */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer text-2xl"
                >
                    {darkMode ? <FiSun /> : <FiMoon />}
                </button>
                </div>



            {/* RIGHT */}
            <div
                className="
                    flex
                    items-center
                    gap-4
                "
            >


                {user ? (

                    <div
                        className="relative"

                        onMouseEnter={() =>
                            setOpenDropdown(true)
                        }

                        onMouseLeave={() =>
                            setOpenDropdown(false)
                        }
                    >

                        {/* USER BUTTON */}
                        <button

                            className="
                                flex
                                items-center
                                gap-3
                                
                                px-4
                                py-2
                                rounded-xl

                                hover:bg-gray-100
                                dark:hover:bg-gray-800
                                transition-all
                            "
                        >

                            {/* NAME */}
                            <span className="font-medium text-xl cursor-pointer">
                                {user.userName || user.email}
                            </span>

                        </button>

                        {/* DROPDOWN */}
                        {openDropdown && (

                            <div
                                className="
                                    absolute
                                    right-0
                                    mt-3
                                    w-72
                                    bg-white
                                    dark:bg-gray-900
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    dark:border-gray-700
                                    shadow-xl
                                    overflow-hidden
                                    z-50
                                "
                            >

                                {/* USER INFO */}
                                <div
                                    className="
                                        px-5
                                        py-4
                                        border-b
                                        border-gray-200
                                        dark:border-gray-700
                                    "
                                >
                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                            break-all
                                        "
                                    >
                                        {user.email}
                                    </p>

                                </div>

                                {/* ACCOUNT */}


                                <Link to="/profile"
                                    className="
                                        w-full

                                        flex
                                        items-center
                                        gap-3
                                        text-left
                                        px-5
                                        py-3

                                        hover:bg-gray-100
                                        dark:hover:bg-gray-800
                                        cursor-pointer
                                        transition-all
                                    "
                                >


                                    <FiUser className="text-lg" />
                                    Thông tin tài khoản</Link>

                                {user.role && user.role.name === 'ADMIN' && (
                                    <Link to="/admin"
                                        className="
                                            w-full
                                            flex
                                            items-center
                                            gap-3
                                            text-left
                                            px-5
                                            py-3
                                            hover:bg-gray-100
                                            dark:hover:bg-gray-800
                                            cursor-pointer
                                            transition-all
                                        "
                                    >
                                        <FiShield className="text-lg text-purple-650 dark:text-purple-400" />
                                        Trang quản trị
                                    </Link>
                                )}

                                {/* LOGOUT */}
                                <button

                                    onClick={handleLogout}

                                    className="
                                        w-full

                                        flex
                                        items-center
                                        gap-3

                                        text-left

                                        px-5
                                        py-3

                                        text-red-500

                                        hover:bg-red-50
                                        dark:hover:bg-red-500/10
                                        cursor-pointer
                                        transition-all
                                    "
                                >

                                    <FiLogOut className="text-lg" />

                                    Đăng xuất

                                </button>

                            </div>

                        )}

                    </div>

                ) : (

                    <button
                        className="bg-[#5b6ef7] hover:bg-[#4a5ce6] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors dark:bg-[#11229c] dark:hover:bg-[#1128b9] cursor-pointer"
                        onClick={() => setActiveModal("login")}
                    >
                        Đăng nhập
                    </button>

                )}

            </div>

        </nav>

    );

}

export default Navbar;