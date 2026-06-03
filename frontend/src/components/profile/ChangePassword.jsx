import { useState } from 'react';
import { FiShield, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import userService from '../../services/userService';

function ChangePassword() {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
    const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
    const [pwSubmitting, setPwSubmitting] = useState(false);

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
    const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
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

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b6ef7] to-[#4a5ce6] text-white shadow-md shadow-[#5b6ef7]/15">
                    <FiShield className="text-xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Đổi mật khẩu</h2>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                    </p>
                </div>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mật khẩu hiện tại */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">
                        Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                        <FiLock className="text-base absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw.old ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu hiện tại"
                            value={passwords.oldPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, oldPassword: e.target.value }))
                            }
                            className="text-sm w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950/40 dark:text-white dark:border-slate-800/80 pl-11 pr-11 py-3 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/10 transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, old: !p.old }))}
                            className="text-base absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                        >
                            {showPw.old ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <FiLock className="text-base absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw.new ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu mới"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                            }
                            className="text-sm w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950/40 dark:text-white dark:border-slate-800/80 pl-11 pr-11 py-3 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/10 transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                            className="text-base absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                        >
                            {showPw.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    {passwords.newPassword && (
                        <div className="pt-1.5 space-y-1.5">
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full transition-all ${
                                            i <= strength ? '' : 'bg-slate-200 dark:bg-slate-800'
                                        }`}
                                        style={i <= strength ? { backgroundColor: strengthColor[strength] } : {}}
                                    />
                                ))}
                            </div>
                            <p className="text-[11px] font-bold" style={{ color: strengthColor[strength] }}>
                                Độ mạnh: {strengthLabel[strength]}
                            </p>
                        </div>
                    )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                        <FiLock className="text-base absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw.confirm ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu mới"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                            }
                            className="text-sm w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950/40 dark:text-white dark:border-slate-800/80 pl-11 pr-11 py-3 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/10 transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                            className="text-base absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                        >
                            {showPw.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                        {passwords.confirmPassword &&
                            passwords.confirmPassword === passwords.newPassword && (
                                <FiCheck className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500 text-base" />
                            )}
                    </div>
                </div>

                {pwMsg.text && (
                    <div
                        className={`md:col-span-3 rounded-xl py-3 px-4 text-xs font-semibold border ${
                            pwMsg.type === 'success'
                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                    >
                        {pwMsg.text}
                    </div>
                )}
                
                <div className="md:col-span-3 flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                        type="submit"
                        disabled={pwSubmitting}
                        className="text-sm px-8 py-3 rounded-xl bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] font-bold text-white shadow-md shadow-[#5b6ef7]/10 disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
                    >
                        {pwSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;
