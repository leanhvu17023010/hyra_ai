import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser,
    FiLock,
    FiClock,
    FiChevronRight,
    FiLogOut,
} from 'react-icons/fi';
import userService from '../services/userService';
import swapService from '../services/swapService';
import authService from '../services/authService';

import ProfileInfo from './profile/ProfileInfo';
import ChangePassword from './profile/ChangePassword';
import SwapHistory from './profile/SwapHistory';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ imageSwapCount: 0, videoSwapCount: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('info');

    const handleLogout = () => {
        authService.logout();
        navigate('/');
        window.location.reload();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const loadAllData = async () => {
            try {
                const [uInfo, uStats, uHistory] = await Promise.all([
                    userService.getMyInfo(),
                    swapService.getStats(),
                    swapService.getSwapHistory(),
                ]);
                if (uInfo.result) setUser(uInfo.result);
                if (uStats.result) setStats(uStats.result);
                if (uHistory.result) setHistory(uHistory.result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [navigate]);

    const menuItems = [
        { id: 'info', label: 'Thông tin tài khoản', icon: <FiUser /> },
        { id: 'password', label: 'Đổi mật khẩu', icon: <FiLock /> },
        { id: 'history', label: 'Lịch sử Swap', icon: <FiClock /> },
    ];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-10 transition-colors duration-300">
            <div className="mx-auto w-full">
                <div className="flex items-center justify-center pb-10">
                    <h2 className="text-5xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        Hồ sơ của bạn
                    </h2>
                </div>
                <div className="flex flex-col gap-9 lg:flex-row items-start">
                    <div className="w-full shrink-0 lg:w-120 sticky top-30">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-md border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`group mb-1.5 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 ${
                                            activeSection === item.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-bold text-2xl">{item.label}</span>
                                        </div>
                                        <FiChevronRight
                                            className={`transition-transform duration-300 ${activeSection === item.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`}
                                        />
                                    </button>
                                ))}

                                <div className="my-3 border-t border-gray-50 dark:border-gray-700" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-900/10 font-bold"
                                >
                                    <FiLogOut className="text-2xl" />
                                    <span className="text-2xl ">Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="min-h-[500px] rounded-[32px] bg-white p-8 md:p-10 shadow-md border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
                            {activeSection === 'info' && <ProfileInfo user={user} stats={stats} />}
                            {activeSection === 'password' && <ChangePassword />}
                            {activeSection === 'history' && <SwapHistory history={history} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
