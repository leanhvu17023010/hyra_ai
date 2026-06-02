import { useState } from 'react';
import { FiUser, FiLock, FiShield, FiMail, FiEye, FiEyeOff, FiActivity, FiKey } from 'react-icons/fi';
import userService from '../../services/userService';

function AdminProfilePanel({ user }) {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
    const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
    const [pwSubmitting, setPwSubmitting] = useState(false);

    // Password strength evaluator
    const getStrength = (pw) => {
        if (!pw) return 0;
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const strengthLabel = ['', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh'];
    const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
    const strength = getStrength(passwords.newPassword);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPwMsg({ text: 'Mật khẩu xác nhận không khớp!', type: 'error' });
            return;
        }
        setPwSubmitting(true);
        setPwMsg({ text: '', type: '' });
        try {
            await userService.changePassword(passwords.oldPassword, passwords.newPassword);
            setPwMsg({ text: 'Đổi mật khẩu thành công!', type: 'success' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwMsg({
                text: err?.response?.data?.message || 'Đổi mật khẩu thất bại.',
                type: 'error',
            });
        } finally {
            setPwSubmitting(false);
        }
    };

    const getFirstLetter = () => {
        if (user?.userName) return user.userName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'A';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Admin Profile Overview Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-6">
                {/* Avatar Badge */}
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#5b6ef7] to-[#8b5cf6] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#5b6ef7]/25 relative">
                    {getFirstLetter()}
                    <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 animate-pulse" />
                </div>

                {/* Identity Info */}
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-850 dark:text-white">{user?.userName || 'Quản trị viên'}</h3>
                    <p className="text-sm font-semibold text-slate-450 dark:text-slate-500 flex items-center justify-center gap-1.5">
                        <FiMail className="shrink-0" /> {user?.email}
                    </p>
                </div>

                {/* Admin Badge */}
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    <FiShield size={12} /> {user?.role?.name || 'ADMIN'}
                </span>

                {/* Info List */}
                <div className="w-full border-t border-slate-100 dark:border-slate-850 pt-6 space-y-4 text-left text-sm font-semibold">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Trạng thái</span>
                        <span className="text-emerald-500 font-bold">Đang hoạt động</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Số Credits sở hữu</span>
                        <span className="text-slate-850 dark:text-white font-mono font-bold">
                            {user?.balance !== undefined ? user.balance.toLocaleString('vi-VN') : '0'} cr
                        </span>
                    </div>
                </div>
            </div>

            {/* Right side: Change Password form (taking 2 cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-[#5b6ef7]/10 text-[#5b6ef7] dark:text-[#a78bfa] rounded-xl flex items-center justify-center text-lg">
                            <FiKey />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-850 dark:text-white">Cập Nhật Mật Khẩu Admin</h3>
                            <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                                Thay đổi định kỳ mật khẩu để bảo vệ quyền tối cao của hệ thống.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        {/* Old Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                                <input
                                    type={showPw.old ? 'text' : 'password'}
                                    value={passwords.oldPassword}
                                    onChange={(e) => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-850 dark:text-white focus:border-[#5b6ef7] font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => ({ ...p, old: !p.old }))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPw.old ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mật khẩu mới</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                                <input
                                    type={showPw.new ? 'text' : 'password'}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-850 dark:text-white focus:border-[#5b6ef7] font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPw.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>

                            {/* Password strength bar indicator */}
                            {passwords.newPassword && (
                                <div className="space-y-1 pt-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-400">Độ mạnh mật khẩu:</span>
                                        <span style={{ color: strength === 4 ? '#10b981' : strength >= 2 ? '#f59e0b' : '#ef4444' }}>
                                            {strengthLabel[strength]}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div 
                                                key={step} 
                                                className={`h-full flex-1 transition-all rounded-full ${step <= strength ? strengthColor[strength] : 'bg-transparent'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                                <input
                                    type={showPw.confirm ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-850 dark:text-white focus:border-[#5b6ef7] font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPw.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Feedback message */}
                        {pwMsg.text && (
                            <div className={`p-4 rounded-xl text-xs font-bold border ${
                                pwMsg.type === 'success' 
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                                {pwMsg.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={pwSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-[#5b6ef7] to-[#8b5cf6] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#5b6ef7]/10"
                            >
                                {pwSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminProfilePanel;
