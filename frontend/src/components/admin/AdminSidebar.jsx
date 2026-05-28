import { FiGrid, FiUser, FiClock, FiLogOut } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

function AdminSidebar({ activeTab, setActiveTab }) {

    const { logout } = useAuthStore();

    return (
        <aside className="w-72 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-350 flex flex-col h-full shrink-0 z-20 shadow-sm border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
            {/* Redundant Brand Header removed since Logo is already visible in the top public Navbar */}

            {/* Navigation Menu */}
            <div className="flex-1 py-6 overflow-y-auto">
                <div className="px-6 mb-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    MAIN NAVIGATION
                </div>
                
                <nav className="space-y-1 px-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-base cursor-pointer ${
                            activeTab === 'overview'
                                ? 'bg-slate-200/80 dark:bg-slate-800 text-[#5b6ef7] dark:text-white shadow-sm'
                                : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                        }`}
                    >
                        <span className="flex items-center gap-3.5">
                            <FiGrid className="text-lg" />
                            Tổng quan hệ thống
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-base cursor-pointer ${
                            activeTab === 'users'
                                ? 'bg-slate-200/80 dark:bg-slate-800 text-[#5b6ef7] dark:text-white shadow-sm'
                                : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                        }`}
                    >
                        <span className="flex items-center gap-3.5">
                            <FiUser className="text-lg" />
                            Quản lý người dùng
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('swap-time')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-base cursor-pointer ${
                            activeTab === 'swap-time'
                                ? 'bg-slate-200/80 dark:bg-slate-800 text-[#5b6ef7] dark:text-white shadow-sm'
                                : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                        }`}
                    >
                        <span className="flex items-center gap-3.5">
                            <FiClock className="text-lg" />
                            Quản lý thời gian swap
                        </span>
                    </button>

                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80"></div>

                    <div className="px-3 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        OTHER ACTIONS
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-red-500 dark:text-red-400 hover:text-red-650 dark:hover:text-red-300 hover:bg-red-500/10 transition-all text-base cursor-pointer"
                    >
                        <FiLogOut className="text-lg" />
                        Đăng xuất tài khoản
                    </button>
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 font-semibold space-y-1 shrink-0">
                <div>© 2026 Hyra AI Panel</div>
                <div>Version: Rukada v1.2</div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
