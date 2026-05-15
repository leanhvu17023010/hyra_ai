import { useState, useEffect } from 'react';
import { 
    FiUser, FiLock, FiClock, FiChevronRight, 
    FiImage, FiLogOut, FiDownload, FiEye, FiEyeOff, FiShield, FiCheck
} from 'react-icons/fi';
import userService from '../services/userService';
import swapService from '../services/swapService';

function Profile() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ imageSwapCount: 0, videoSwapCount: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('info');

    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
    const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

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
        try {
            await userService.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
            setPwMsg({ text: 'Đổi mật khẩu thành công!', type: 'success' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwMsg({ text: err?.response?.data?.message || 'Đổi mật khẩu thất bại.', type: 'error' });
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [uInfo, uStats, uHistory] = await Promise.all([
                    userService.getMyInfo(),
                    swapService.getStats(),
                    swapService.getSwapHistory ? swapService.getSwapHistory() : { result: [] }
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
    }, []);

    const menuItems = [
        { id: 'info', label: 'Thông tin tài khoản', icon: <FiUser /> },
        { id: 'password', label: 'Đổi mật khẩu', icon: <FiLock /> },
        { id: 'history', label: 'Lịch sử Swap', icon: <FiClock /> },
    ];

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-blue-100 p-4 md:p-10 dark:bg-gray-900 transition-colors duration-300">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-center pb-10">
                    <h2 className="text-5xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Hồ sơ của bạn</h2>
                </div>
                <div className="flex flex-col gap-8 lg:flex-row items-start ">
                    
                    {/* LEFT SIDEBAR MENU */}
                    <div className="w-full shrink-0 lg:w-72 sticky top-10">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-500/5 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">


                            <div className="p-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`group mb-1.5 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 ${
                                            activeSection === item.id 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{item.icon}</span>
                                            <span className="font-bold text-[15px]">{item.label}</span>
                                        </div>
                                        <FiChevronRight className={`transition-transform duration-300 ${activeSection === item.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))}
                                
                                <div className="my-3 border-t border-gray-50 dark:border-gray-700"></div>

                                <button className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-900/10 font-bold">
                                    <FiLogOut className="text-lg" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT AREA */}
                    <div className="flex-1 w-full">
                        <div className="min-h-[500px] rounded-[32px] bg-white p-8 md:p-10 shadow-xl shadow-blue-500/5 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            
                            {activeSection === 'info' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">


                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Họ và tên hiển thị</label>
                                            <div className="rounded-2xl bg-gray-50 p-5 font-bold text-gray-700 dark:bg-gray-700/50 dark:text-white border border-gray-100 dark:border-gray-600">
                                                {user?.userName}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Email đăng ký</label>
                                            <div className="rounded-2xl bg-gray-50 p-5 font-bold text-gray-700 dark:bg-gray-700/50 dark:text-white border border-gray-100 dark:border-gray-600">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'password' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                            <FiShield className="text-xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-800 dark:text-white">Đổi mật khẩu</h2>
                                            <p className="text-sm text-gray-400 mt-0.5">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-8 lg:grid-cols-5">
                                        {/* Form */}
                                        <form onSubmit={handlePasswordChange} className="lg:col-span-3 space-y-6">

                                            {/* Old password */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Mật khẩu hiện tại</label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type={showPw.old ? 'text' : 'password'}
                                                        placeholder="Nhập mật khẩu hiện tại"
                                                        value={passwords.oldPassword}
                                                        onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 pl-11 pr-12 py-4 font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
                                                    />
                                                    <button type="button" onClick={() => setShowPw(p => ({ ...p, old: !p.old }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                                        {showPw.old ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* New password */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Mật khẩu mới</label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type={showPw.new ? 'text' : 'password'}
                                                        placeholder="Nhập mật khẩu mới"
                                                        value={passwords.newPassword}
                                                        onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 pl-11 pr-12 py-4 font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600 dark:placeholder-gray-500"
                                                    />
                                                    <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                                        {showPw.new ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                                {/* Strength bar */}
                                                {passwords.newPassword && (
                                                    <div className="pt-1 space-y-1.5">
                                                        <div className="flex gap-1.5">
                                                            {[1,2,3,4].map(i => (
                                                                <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ background: i <= strength ? strengthColor[strength] : '#e5e7eb' }} />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs font-bold" style={{ color: strengthColor[strength] }}>
                                                            Độ mạnh: {strengthLabel[strength]}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Confirm password */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Xác nhận mật khẩu</label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type={showPw.confirm ? 'text' : 'password'}
                                                        placeholder="Nhập lại mật khẩu mới"
                                                        value={passwords.confirmPassword}
                                                        onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                                                        className={`w-full rounded-2xl border bg-gray-50 pl-11 pr-12 py-4 font-semibold text-gray-700 outline-none transition focus:ring-2 dark:bg-gray-700/60 dark:text-white dark:placeholder-gray-500 ${
                                                            passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword
                                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                                                                : passwords.confirmPassword && passwords.confirmPassword === passwords.newPassword
                                                                    ? 'border-green-300 focus:border-green-400 focus:ring-green-500/20'
                                                                    : 'border-gray-100 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-500/20'
                                                        }`}
                                                    />
                                                    <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                                        {showPw.confirm ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                    {passwords.confirmPassword && passwords.confirmPassword === passwords.newPassword && (
                                                        <FiCheck className="absolute right-11 top-1/2 -translate-y-1/2 text-green-500" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Feedback message */}
                                            {pwMsg.text && (
                                                <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${
                                                    pwMsg.type === 'success'
                                                        ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:border-green-800'
                                                        : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                                }`}>
                                                    {pwMsg.text}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-black text-white shadow-xl shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-[0.98] mt-2"
                                            >
                                                Cập nhật mật khẩu
                                            </button>
                                        </form>

                                        
                                    </div>
                                </div>
                            )}

                            {activeSection === 'history' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-1.5 bg-green-500 rounded-full"></div>
                                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Lịch sử Swap</h2>
                                        </div>
                                        <span className="rounded-full bg-gray-100 px-4 py-1.5 text-[10px] font-black uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                                            {history.length} mục đã lưu
                                        </span>
                                    </div>

                                    {history.length > 0 ? (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {history.map((item) => (
                                                <div key={item.id} className="group overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 transition-all hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-gray-700/50 dark:border-gray-600">
                                                    <div className="relative mb-4 aspect-video overflow-hidden rounded-[20px] bg-gray-100">
                                                        <video src={item.resultUrl} className="h-full w-full object-cover" />
                                                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <button className="rounded-xl bg-white p-3 text-gray-800 transition-all hover:scale-110 active:scale-90"><FiEye /></button>
                                                            <button className="rounded-xl bg-blue-600 p-3 text-white transition-all hover:scale-110 active:scale-90"><FiDownload /></button>
                                                        </div>
                                                    </div>
                                                    <div className="px-2 pb-2 flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-blue-500 text-sm"><FiImage /></span>
                                                                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Video Swap Result</span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Mới nhất • {new Date().toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 text-center">
                                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-4xl text-gray-200 dark:bg-gray-700">
                                                <FiClock />
                                            </div>
                                            <p className="font-bold text-gray-400">Bạn chưa có dữ liệu swap nào.</p>
                                            <p className="text-xs text-gray-300 mt-1">Hãy bắt đầu tạo những video đầu tiên của bạn!</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;