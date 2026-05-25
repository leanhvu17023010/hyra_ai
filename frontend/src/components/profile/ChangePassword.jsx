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
                <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                    <FiShield className="text-2xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">Đổi mật khẩu</h2>
                    <p className="text-xl text-gray-400 mt-0.5">
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                    </p>
                </div>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 py-10">
                    <label className="text-2xl font-black uppercase tracking-wider text-gray-400">
                        Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                        <FiLock className="text-xl absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPw.old ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu hiện tại"
                            value={passwords.oldPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, oldPassword: e.target.value }))
                            }
                            className="text-xl w-full rounded-2xl border border-gray-300 bg-gray-50 pl-11 pr-12 py-4 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, old: !p.old }))}
                            className="text-2xl absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPw.old ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2 py-10" >
                    <label className="text-2xl font-black uppercase tracking-wider text-gray-400">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <FiLock className="text-2xl absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPw.new ? 'text' : 'password'}
                            placeholder="Nhập mật khẩu mới"
                            value={passwords.newPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                            }
                            className="text-xl w-full rounded-2xl border border-gray-300 bg-gray-50 pl-11 pr-12 py-4 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                            className="text-2xl absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPw.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    {passwords.newPassword && (
                        <div className="pt-1 space-y-1.5">
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-1.5 flex-1 rounded-full transition-all"
                                        style={{
                                            background:
                                                i <= strength ? strengthColor[strength] : '#e5e7eb',
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-2xl font-bold" style={{ color: strengthColor[strength] }}>
                                Độ mạnh: {strengthLabel[strength]}
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-2 lg:col-span-2">
                    <label className="text-2xl font-black uppercase tracking-wider text-gray-400">
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                        <FiLock className="text-2xl absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPw.confirm ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu mới"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                                setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                            }
                            className="text-xl w-full rounded-2xl border border-gray-300 bg-gray-50 pl-11 pr-12 py-4 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                            className="text-2xl absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPw.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                        {passwords.confirmPassword &&
                            passwords.confirmPassword === passwords.newPassword && (
                                <FiCheck className="absolute right-11 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                    </div>
                </div>

                {pwMsg.text && (
                    <div
                        className={`rounded-2xl px-5 text-sm font-bold ${
                            pwMsg.type === 'success'
                                ? 'bg-green-50 text-green-600 '
                                : 'bg-red-50 text-red-600 '
                        }`}
                    >
                        {pwMsg.text}
                    </div>
                )}
                <div className="lg:col-span-2 pt-4">
                <button
                    type="submit"
                    disabled={pwSubmitting}
                    className="text-2xl w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-black text-white shadow-xl disabled:opacity-60"
                >
                    {pwSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;
