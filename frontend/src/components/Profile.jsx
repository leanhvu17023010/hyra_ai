import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser,
    FiLock,
    FiClock,
    FiChevronRight,
    FiImage,
    FiVideo,
    FiLogOut,
    FiDownload,
    FiEye,
    FiEyeOff,
    FiShield,
    FiCheck,
    FiX,
} from 'react-icons/fi';
import userService from '../services/userService';
import swapService from '../services/swapService';
import authService from '../services/authService';
import { resolveMediaUrl, isVideoResultUrl } from '../utils/mediaUrl';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ imageSwapCount: 0, videoSwapCount: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('info');
    const [previewItem, setPreviewItem] = useState(null);

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

    const handleLogout = () => {
        authService.logout();
        navigate('/');
        window.location.reload();
    };

    const handleDownload = async (item) => {
        try {
            const ext = isVideoResultUrl(item.resultUrl) ? 'mp4' : 'jpg';
            await swapService.downloadResult(item.resultUrl, `swap-${item.id}.${ext}`);
        } catch (err) {
            console.error(err);
            alert('Không tải được file. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const loadAllData = async () => {
            try {
                const [uInfo, uStats, uHistory] = await Promise.all([
                    userService.getMyInfo(),
                    swapService.getStats(),
                    swapService.getSwapHistory(),
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
    }, [navigate]);

    const menuItems = [
        { id: 'info', label: 'Thông tin tài khoản', icon: <FiUser /> },
        { id: 'password', label: 'Đổi mật khẩu', icon: <FiLock /> },
        { id: 'history', label: 'Lịch sử Swap', icon: <FiClock /> },
    ];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-blue-100 p-4 md:p-10 dark:bg-gray-900 transition-colors duration-300">
            {previewItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewItem(null)}
                            className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        >
                            <FiX className="text-2xl" />
                        </button>
                        {isVideoResultUrl(previewItem.resultUrl) ? (
                            <video
                                src={resolveMediaUrl(previewItem.resultUrl)}
                                controls
                                autoPlay
                                className="max-h-[85vh] w-full rounded-2xl bg-black"
                            />
                        ) : (
                            <img
                                src={resolveMediaUrl(previewItem.resultUrl)}
                                alt="Kết quả swap"
                                className="max-h-[85vh] w-full rounded-2xl object-contain bg-black"
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="mx-auto w-full">
                <div className="flex items-center justify-center pb-10">
                    <h2 className="text-5xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        Hồ sơ của bạn
                    </h2>
                </div>
                <div className="flex flex-col gap-9 lg:flex-row items-start">
                    <div className="w-full shrink-0 lg:w-120 sticky top-30">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-blue-500/5 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        fullName                          
                                        className={`group mb-1.5 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 ${
                                            activeSection === item.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <span className="text-2xl">{item.icon}</span>
                                            <span className="font-bold text-2xl">{item.label}</span>
                                        </div>
                                        <FiChevronRight
                                            className={`transition-transform duration-300 ${activeSection === item.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`}
                                        />
                                    </button>
                                ))}

                                <div className="my-3 border-t border-gray-50 dark:border-gray-700" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-900/10 font-bold"
                                >
                                    <FiLogOut className="text-2xl" />
                                    <span className="text-2xl ">Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="min-h-[500px] rounded-[32px] bg-white p-8 md:p-10 shadow-xl shadow-blue-500/5 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                            {activeSection === 'info' && (
                                <div className="space-y-8">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <label className="text-xl font-black uppercase text-gray-400 tracking-wider">
                                                Họ và tên hiển thị
                                            </label>
                                            <div className="text-2xl rounded-2xl font-bold py-5 text-gray-700 dark:bg-gray-700/50 dark:text-white border border-gray-100 dark:border-gray-600">
                                                {user?.userName}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xl font-black uppercase text-gray-400 tracking-wider">
                                                Email đăng ký
                                            </label>
                                            <div className="text-2xl rounded-2xl font-bold py-5 text-gray-700 dark:bg-gray-700/50 dark:text-white border border-gray-100 dark:border-gray-600">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-6 dark:border-blue-900 dark:bg-blue-950/40">
                                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                                <FiImage className="text-2xl" />
                                                <span className="text-2xl font-bold uppercase tracking-wide">Swap ảnh</span>
                                            </div>
                                            <p className="mt-3 text-4xl font-black text-gray-800 dark:text-white">
                                                {stats.imageSwapCount}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-6 dark:border-indigo-900 dark:bg-indigo-950/40">
                                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                                                <FiVideo className="text-2xl" />
                                                <span className="text-2xl font-bold uppercase tracking-wide">Swap video</span>
                                            </div>
                                            <p className="mt-3 text-4xl font-black text-gray-800 dark:text-white">
                                                {stats.videoSwapCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'password' && (
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
                                                    className="text-xl w-full rounded-2xl border border-gray-100 bg-gray-50 pl-11 pr-12 py-4 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600"
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
                                                    className="text-xl w-full rounded-2xl border border-gray-100 bg-gray-50 pl-11 pr-12 py-4 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600"
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
                                                    className="text-xl w-full rounded-2xl border border-gray-100 bg-gray-50 pl-11 pr-12 py-4 font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/60 dark:text-white dark:border-gray-600"
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
                            )}

                            {activeSection === 'history' && (
                                <div>
                                    <div className="mb-10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-1.5 bg-green-500 rounded-full" />
                                            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                                Lịch sử Swap
                                            </h2>
                                        </div>
                                        <span className="text-xl rounded-full bg-gray-100 px-4 py-1.5 font-black uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                                            {history.length} mục đã lưu
                                        </span>
                                    </div>

                                    {history.length > 0 ? (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {history.map((item) => {
                                                const isVideo =
                                                    item.mediaType === 'video' ||
                                                    isVideoResultUrl(item.resultUrl);
                                                const mediaSrc = resolveMediaUrl(item.resultUrl);
                                                const dateLabel = item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                                                    : new Date().toLocaleDateString('vi-VN');

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="group overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 transition-all hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-gray-700/50 dark:border-gray-600"
                                                    >
                                                        <div className="relative mb-4 aspect-video overflow-hidden rounded-[20px] bg-gray-100">
                                                            {isVideo ? (
                                                                <video
                                                                    src={mediaSrc}
                                                                    className="h-full w-full object-cover"
                                                                    muted
                                                                    playsInline
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={mediaSrc}
                                                                    alt="Kết quả swap"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            )}
                                                            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewItem(item)}
                                                                    className="rounded-xl bg-white p-3 text-gray-800 hover:scale-110"
                                                                >
                                                                    <FiEye />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDownload(item)}
                                                                    className="rounded-xl bg-blue-600 p-3 text-white hover:scale-110"
                                                                >
                                                                    <FiDownload />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="px-2 pb-2 flex items-center justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    {isVideo ? (
                                                                        <FiVideo className="text-blue-500 text-sm" />
                                                                    ) : (
                                                                        <FiImage className="text-blue-500 text-sm" />
                                                                    )}
                                                                    <span className="font-bold text-xl text-gray-700 dark:text-gray-200">
                                                                        {isVideo ? 'Video Swap' : 'Ảnh Swap'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xl font-bold text-gray-400 mt-0.5">
                                                                    {dateLabel}
                                                                </p>
                                                            </div>
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 text-center">
                                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-4xl text-gray-200 dark:bg-gray-700">
                                                <FiClock />
                                            </div>
                                            <p className="font-bold text-gray-400">Bạn chưa có dữ liệu swap nào.</p>
                                            <p className="text-xs text-gray-300 mt-1">
                                                Hoàn tất một lần swap để thấy lịch sử tại đây.
                                            </p>
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
