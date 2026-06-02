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
        <div>
            <div className="flex items-center gap-4 mb-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b6ef7] to-[#4a5ce6] text-white shadow-lg shadow-[#5b6ef7]/20">
                    <FiShield className="text-2xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Đổi mật khẩu</h2>
                    <p className="text-sm text-slate-450 dark:text-slate-500 mt-1">
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                    </p>
                </div>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-4 py-5">
                    <label className="text-xl font-bold py-5 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                        <FiLock className="text-xl absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw.old ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu hiện tại"
                            value={passwords.oldPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, oldPassword: e.target.value }))
                            }
                            className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, old: !p.old }))}
                            className="text-xl absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showPw.old ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 py-5">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <FiLock className="text-xl absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw.new ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu mới"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                            }
                            className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                            className="text-xl absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                                        className="h-1.5 flex-1 rounded-full transition-all"
                                        style={{
                                            background:
                                                i <= strength ? strengthColor[strength] : '#e2e8f0',
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-semibold" style={{ color: strengthColor[strength] }}>
                                Độ mạnh: {strengthLabel[strength]}
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-4 md:col-span-2">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                        <FiLock className="text-xl absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPw.confirm ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu mới"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                            }
                            className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                            className="text-xl absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showPw.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                        {passwords.confirmPassword &&
                            passwords.confirmPassword === passwords.newPassword && (
                                <FiCheck className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500 text-xl" />
                            )}
                    </div>
                </div>

                {pwMsg.text && (
                    <div
                        className={`md:col-span-2 rounded-2xl py-3 px-5 text-sm font-semibold border ${
                            pwMsg.type === 'success'
                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                    >
                        {pwMsg.text}
                    </div>
                )}
                <div className="md:col-span-2 pt-6">
                    <button
                        type="submit"
                        disabled={pwSubmitting}
                        className="text-xl w-full rounded-2xl bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] py-4.5 font-bold text-white shadow-md shadow-[#5b6ef7]/10 disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
                    >
                        {pwSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;
