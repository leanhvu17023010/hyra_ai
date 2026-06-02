import { useState, useEffect } from 'react';
import { FiImage, FiVideo, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import userService from '../../services/userService';
import useAuthStore from '../../store/authStore';

function ProfileInfo({ user, stats }) {
    const { fetchUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState(user?.userName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        let active = true;
        if (user) {
            setTimeout(() => {
                if (active) {
                    setUserName(user.userName || '');
                }
            }, 0);
        }
        return () => {
            active = false;
        };
    }, [user]);

    // Automatically clear status message after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!userName.trim()) {
            setMessage({ text: 'Tên hiển thị không được để trống!', type: 'error' });
            return;
        }
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await userService.updateUser(user.id, {
                userName: userName,
                roleName: user.role?.name || 'USER',
                active: user.active !== false
            });
            await fetchUser();
            setMessage({ text: 'Cập nhật thông tin tài khoản thành công!', type: 'success' });
            setIsEditing(false);
        } catch (err) {
            setMessage({
                text: err?.response?.data?.message || 'Không thể cập nhật thông tin.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="grid gap-10 md:grid-cols-2">
                {/* Username Input / Text */}
                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Họ và tên hiển thị
                    </label>

                    {isEditing ? (
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 py-5 px-6 font-semibold outline-none focus:border-[#5b6ef7] dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                            placeholder="Nhập họ và tên hiển thị mới"
                            disabled={loading}
                        />
                    ) : (
                        <div className="text-xl rounded-2xl font-bold py-5 px-6 text-slate-800 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-800">
                            {user?.userName || 'Chưa thiết lập'}
                        </div>
                    )}
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Email đăng ký
                    </label>
                    <div className="text-xl rounded-2xl font-bold py-5 px-6 text-slate-450 bg-slate-50/50 border border-slate-200/80 dark:bg-slate-900/40 dark:text-slate-500 dark:border-slate-800/80 cursor-not-allowed">
                        {user?.email}
                    </div>
                </div>
            </div>

            {/* Notification message */}
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-semibold border animate-fade-in flex items-center justify-between ${
                    message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                    <span>{message.text}</span>
                    <button 
                        type="button"
                        onClick={() => setMessage({ text: '', type: '' })}
                        className="text-lg font-bold leading-none hover:opacity-75 cursor-pointer ml-3 px-1.5 py-0.5 rounded hover:bg-slate-500/10"
                    >
                        ×
                    </button>
                </div>
            )}


            {/* Hide stats block for ADMIN users to keep it clean */}
            {user?.role?.name !== 'ADMIN' && (
                <div className="grid gap-8 sm:grid-cols-2 pt-8">
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/20 p-8 dark:border-blue-950 dark:bg-blue-950/20">
                        <div className="flex items-center gap-3.5 text-blue-600 dark:text-blue-400">
                            <FiImage className="text-2xl" />
                            <span className="text-xl font-bold uppercase tracking-wider">Swap ảnh</span>
                        </div>
                        <p className="mt-4 text-4xl font-black text-slate-800 dark:text-white">
                            {stats.imageSwapCount}
                        </p>
                    </div>
                    <div className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-8 dark:border-indigo-950 dark:bg-indigo-950/20">
                        <div className="flex items-center gap-3.5 text-indigo-600 dark:text-indigo-400">
                            <FiVideo className="text-2xl" />
                            <span className="text-xl font-bold uppercase tracking-wider">Swap video</span>
                        </div>
                        <p className="mt-4 text-4xl font-black text-slate-800 dark:text-white">
                            {stats.videoSwapCount}
                        </p>
                    </div>
                </div>
                
            )}
                        {/* Action Buttons Row - Positioned at the bottom-right */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                {isEditing ? (
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setUserName(user?.userName || '');
                                setIsEditing(false);
                                setMessage({ text: '', type: '' });
                            }}
                            disabled={loading}
                            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-200 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <FiX /> Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-3.5 bg-gradient-to-r from-[#5b6ef7] to-[#8b5cf6] text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <FiCheck /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3.5 bg-[#5b6ef7]/10 hover:bg-[#5b6ef7]/20 dark:bg-[#a78bfa]/10 dark:hover:bg-[#a78bfa]/20 text-[#5b6ef7] dark:text-[#a78bfa] rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <FiEdit2 size={15} /> Chỉnh sửa thông tin
                    </button>
                )}
            </div>

        </div>
    );
}

export default ProfileInfo;
