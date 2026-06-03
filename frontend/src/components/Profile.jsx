import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser,
    FiLock,
    FiClock,
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
    const [stats, setStats] = useState({ imageSwapCount: 0, videoSwapCount: 0, audioCount: 0, subtitleCount: 0 });
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
        ...(user?.role?.name === 'ADMIN' ? [] : [
            { id: 'history', label: 'Lịch sử hoạt động', icon: <FiClock /> }
        ])
    ];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 transition-colors duration-300">
            {/* 1. HERO BANNER - BẢNG THÔNG TIN TỔNG QUAN */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 md:p-6 mb-6 text-white shadow-xl">
                {/* Decorative background mesh */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#5b6ef7] to-[#a78bfa] rounded-full blur-3xl opacity-15 -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-10 -ml-16 -mb-16 pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Thông tin User */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#5b6ef7] to-[#a78bfa] flex items-center justify-center text-xl font-black text-white shadow-xl shadow-[#5b6ef7]/20 border-2 border-slate-800">
                                {user?.userName ? user.userName.substring(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                        </div>
                        
                        <div className="text-center sm:text-left space-y-1.5">
                            <div className="flex items-center flex-wrap gap-2 justify-center sm:justify-start">
                                <h1 className="text-lg md:text-xl font-bold tracking-wide text-white">
                                    {user?.userName || 'Người dùng Hyra'}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#5b6ef7]/20 text-[#a78bfa] border border-[#a78bfa]/20 uppercase tracking-widest shadow-md">
                                    {user?.role?.name || 'USER'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
                        </div>
                    </div>

                    {/* Thống kê nhanh */}
                    {user?.role?.name !== 'ADMIN' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-xl p-3 text-center min-w-[90px]">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ảnh Swap</span>
                                <span className="block text-lg font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-0.5">{stats.imageSwapCount || 0}</span>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-xl p-3 text-center min-w-[90px]">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Swap</span>
                                <span className="block text-lg font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-0.5">{stats.videoSwapCount || 0}</span>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-xl p-3 text-center min-w-[90px]">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giọng nói</span>
                                <span className="block text-lg font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-0.5">{stats.audioCount || 0}</span>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-xl p-3 text-center min-w-[90px]">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phụ đề</span>
                                <span className="block text-lg font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-0.5">{stats.subtitleCount || 0}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. THANH DIỀU HƯỚNG TABS NGANG */}
            <div className="flex border-b py-2 border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto gap-1 scrollbar-none">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        className={`pb-2.5 px-4 text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeSection === item.id
                                ? 'border-[#5b6ef7] text-[#5b6ef7] dark:border-[#a78bfa] dark:text-[#a78bfa]'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200'
                        }`}
                    >
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
                
                <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-auto pb-2.5 px-4 text-sm font-bold flex items-center gap-1.5 text-red-500 hover:text-red-650 transition-all cursor-pointer whitespace-nowrap"
                >
                    <FiLogOut className="text-sm" />
                    <span>Đăng xuất</span>
                </button>
            </div>

            {/* 3. KHU VỰC HIỂN THỊ NỘI DUNG TABS CHỌN */}
            <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-all">
                {activeSection === 'info' && <ProfileInfo user={user} />}
                {activeSection === 'password' && <ChangePassword />}
                {activeSection === 'history' && <SwapHistory history={history} />}
            </div>
        </div>
    );
}

export default Profile;
