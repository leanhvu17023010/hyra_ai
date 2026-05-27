import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser,
    FiLock,
    FiClock,
    FiChevronRight,
    FiLogOut,
} from 'react-icons/fi';

import swapService from '../services/swapService';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

import ProfileInfo from './profile/ProfileInfo';
import ChangePassword from './profile/ChangePassword';
import SwapHistory from './profile/SwapHistory';

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [stats, setStats] = useState({ imageSwapCount: 0, videoSwapCount: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('info');

    const handleLogout = () => {
        authService.logout();
        logout();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const loadAllData = async () => {
            try {
                const [uStats, uHistory] = await Promise.all([
                    swapService.getStats(),
                    swapService.getSwapHistory(),
                ]);
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
        <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16 transition-colors duration-300">
            <div className="mx-auto w-full">
                <div className="flex items-center justify-center pb-12">
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Hồ sơ cá nhân
                    </h2>
                </div>
                <div className="flex flex-col gap-10 lg:flex-row lg:gap-16 items-start">
                    <div className="w-full shrink-0 lg:w-[350px] xl:w-[380px] sticky top-24">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <div className="p-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`group mb-1.5 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 cursor-pointer ${
                                            activeSection === item.id
                                                ? 'bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] text-white shadow-lg shadow-[#5b6ef7]/15'
                                                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="font-bold text-xl">{item.label}</span>
                                        </div>
                                        <FiChevronRight
                                            className={`transition-transform duration-300 ${activeSection === item.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`}
                                            size={20}
                                        />
                                    </button>
                                ))}

                                <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold text-xl cursor-pointer"
                                >
                                    <FiLogOut className="text-xl" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="min-h-[520px] rounded-3xl bg-white p-10 md:p-14 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
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
