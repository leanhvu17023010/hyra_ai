import { useState, useEffect } from "react";

import {
    FiUser,
    FiLogOut,
    FiSun,
    FiMoon
} from "react-icons/fi";

import userService from "../services/userService";
import authService from "../services/authService";
import { Link } from "react-router-dom";

function Navbar({ setActiveModal, darkMode, setDarkMode }) {

    const [user, setUser] = useState(null);

    // DROPDOWN
    const [openDropdown, setOpenDropdown]
        = useState(false);

    useEffect(() => {

        const fetchUser = async () => {

            const token =
                localStorage.getItem("token");

            if (token) {

                try {

                    const response =
                        await userService.getMyInfo();

                    if (response.result) {
                        setUser(response.result);
                    }

                }

                catch (error) {

                    console.error(
                        "Error fetching user info:",
                        error
                    );

                    localStorage.removeItem(
                        "token"
                    );

                }

            }

        };

        fetchUser();

    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        window.location.reload();
    };

    return (

        <nav
            className="
                flex
                justify-between
                items-center

                px-8
                py-4

                bg-white
                text-black

                shadow-sm

                dark:bg-gray-900
                dark:text-white

                border
                border-gray-300
                dark:border-gray-700
            "
        >

            {/* LEFT: LOGO + DARK MODE */}
            <div className="flex items-center gap-3">

                {/* LOGO */}
                <h1
                    className="
                        text-2xl
                        font-bold
                    "
                >
                    Example AI
                </h1>

                {/* DARK MODE TOGGLE */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="
                        p-2
                        rounded-xl
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                        transition-all
                        cursor-pointer
                        text-xl
                    "
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
                            <span
                                className="
                                    font-semibold
                                    text-lg
                                    cursor-pointer
                                "
                            >
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

                        className="
                            bg-[#5b6ef7]
                            hover:bg-[#4a5ce6]

                            text-white

                            px-6
                            py-2

                            rounded-lg

                            transition-colors

                            dark:bg-[#11229c]
                            dark:hover:bg-[#1128b9]

                            cursor-pointer
                        "

                        onClick={() =>
                            setActiveModal("login")
                        }

                    >
                        Đăng nhập
                    </button>

                )}

            </div>

        </nav>

    );

}

export default Navbar;