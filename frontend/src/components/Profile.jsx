import { useState, useEffect } from 'react';
import {
    FiUser, FiLock, FiClock, FiChevronRight,
    FiImage, FiLogOut, FiDownload, FiEye
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
                                        className={`group mb-1.5 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 ${activeSection === item.id
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
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="h-10 w-1.5 bg-red-500 rounded-full"></div>
                                        <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Đổi mật khẩu</h2>
                                    </div>

                                    <form className="max-w-md space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 ml-2">Mật khẩu cũ</label>
                                            <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 ml-2">Mật khẩu mới</label>
                                            <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                        </div>
                                        <div className="space-y-2 ">
                                            <label className="text-xs font-bold text-gray-400 ml-2">Xác nhận lại</label>
                                            <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                        </div>
                                        <button className="w-full rounded-2xl bg-gray-900 py-5 font-black text-white shadow-xl transition-all hover:bg-black active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700 mt-4 ">
                                            CẬP NHẬT MẬT KHẨU
                                        </button>
                                    </form>
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