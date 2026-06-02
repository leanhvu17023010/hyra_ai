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
        <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 transition-colors duration-300">
            {/* 1. HERO BANNER - BẢNG THÔNG TIN TỔNG QUAN */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 mb-8 text-white shadow-xl">
                {/* Decorative background mesh */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#5b6ef7] to-[#a78bfa] rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500 rounded-full blur-3xl opacity-10 -ml-20 -mb-20 pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Thông tin User */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#5b6ef7] to-[#a78bfa] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[#5b6ef7]/20 border-2 border-slate-800">
                                {user?.userName ? user.userName.substring(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full" />
                        </div>
                        
                        <div className="text-center sm:text-left space-y-2">
                            <div className="flex items-center flex-wrap gap-3 justify-center sm:justify-start">
                                <h1 className="text-2xl md:text-3xl font-black tracking-wide text-white">
                                    {user?.userName || 'Người dùng Hyra'}
                                </h1>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#5b6ef7]/20 text-[#a78bfa] border border-[#a78bfa]/20 uppercase tracking-widest shadow-md">
                                    {user?.role?.name || 'USER'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-semibold">{user?.email}</p>
                        </div>
                    </div>

                    {/* Thống kê nhanh */}
                    {user?.role?.name !== 'ADMIN' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
                                <span className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Ảnh Swap</span>
                                <span className="block text-2xl font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-1">{stats.imageSwapCount || 0}</span>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
                                <span className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Video Swap</span>
                                <span className="block text-2xl font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-1">{stats.videoSwapCount || 0}</span>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
                                <span className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Giọng nói</span>
                                <span className="block text-2xl font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-1">{stats.audioCount || 0}</span>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
                                <span className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider">Phụ đề</span>
                                <span className="block text-2xl font-black text-[#5b6ef7] dark:text-[#a78bfa] mt-1">{stats.subtitleCount || 0}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. THANH DIỀU HƯỚNG TABS NGANG */}
            <div className="flex border-b py-5 border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto gap-2 scrollbar-none">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        className={`pb-4 px-6 text-xl font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeSection === item.id
                                ? 'border-[#5b6ef7] text-[#5b6ef7] dark:border-[#a78bfa] dark:text-[#a78bfa]'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200'
                        }`}
                    >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
                
                <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-auto pb-4 px-6 text-xl font-bold flex items-center gap-2 text-red-500 hover:text-red-650 transition-all cursor-pointer whitespace-nowrap"
                >
                    <FiLogOut className="text-xl" />
                    <span>Đăng xuất</span>
                </button>
            </div>

            {/* 3. KHU VỰC HIỂN THỊ NỘI DUNG TABS CHỌN */}
            <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-all">
                {activeSection === 'info' && <ProfileInfo user={user} />}
                {activeSection === 'password' && <ChangePassword />}
                {activeSection === 'history' && <SwapHistory history={history} />}
            </div>
        </div>
    );
}

export default Profile;
