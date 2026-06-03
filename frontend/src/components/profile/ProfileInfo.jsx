import { useState, useEffect } from 'react';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import userService from '../../services/userService';
import useAuthStore from '../../store/authStore';

function ProfileInfo({ user }) {
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
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Username Input / Text */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Họ và tên hiển thị
                    </label>

                    {isEditing ? (
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="text-sm w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 font-semibold outline-none focus:border-[#5b6ef7] dark:bg-slate-950/40 dark:text-white dark:border-slate-800/80"
                            placeholder="Nhập họ và tên hiển thị mới"
                            disabled={loading}
                        />
                    ) : (
                        <div className="text-sm rounded-xl font-bold py-2.5 px-4 text-slate-800 bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:text-slate-200 dark:border-slate-800/80">
                            {user?.userName || 'Chưa thiết lập'}
                        </div>
                    )}
                </div>

                {/* Email (Read-Only) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Email đăng ký
                    </label>
                    <div className="text-sm rounded-xl font-bold py-2.5 px-4 text-slate-450 bg-slate-50/50 border border-slate-200/80 dark:bg-slate-950/20 dark:text-slate-500 dark:border-slate-800/85 cursor-not-allowed">
                        {user?.email}
                    </div>
                </div>
            </div>

            {/* Notification message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-xs font-semibold border animate-fade-in flex items-center justify-between ${
                    message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                    <span>{message.text}</span>
                    <button 
                        type="button"
                        onClick={() => setMessage({ text: '', type: '' })}
                        className="text-sm font-bold leading-none hover:opacity-75 cursor-pointer ml-3 px-1 py-0.5 rounded hover:bg-slate-500/10"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Action Buttons Row - Positioned at the bottom-right */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60">
                {isEditing ? (
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setUserName(user?.userName || '');
                                setIsEditing(false);
                                setMessage({ text: '', type: '' });
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <FiX /> Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-[#5b6ef7] to-[#8b5cf6] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <FiCheck /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#5b6ef7]/10 hover:bg-[#5b6ef7]/20 dark:bg-[#a78bfa]/10 dark:hover:bg-[#a78bfa]/20 text-[#5b6ef7] dark:text-[#a78bfa] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <FiEdit2 size={13} /> Chỉnh sửa thông tin
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProfileInfo;
