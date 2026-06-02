import { FiGrid, FiUsers, FiLayers, FiList,  FiLogOut } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

function AdminSidebar({ activeTab, setActiveTab }) {
    const { logout } = useAuthStore();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
        { id: 'users', label: 'Users', icon: FiUsers },
        { id: 'tasks', label: 'Tasks', icon: FiLayers },
        { id: 'queues', label: 'Queues', icon: FiList }
    ];

    return (
        <aside className="w-72 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-350 flex flex-col h-full shrink-0 z-20 shadow-sm border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
            {/* Header / Brand (Compact) */}

            {/* Navigation Menu */}
            <div className="flex-1 py-6 overflow-y-auto">
                <div className="px-6 py-5 mb-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    SYSTEM CORE
                </div>
                
                <nav className="space-y-1 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-sm cursor-pointer ${
                                    isActive
                                        ? 'bg-slate-200/80 dark:bg-slate-800 text-[#5b6ef7] dark:text-white shadow-sm'
                                        : 'bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-slate-800/30'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon className="text-base shrink-0" />
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80"></div>

                    <div className="px-3 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        ACTIONS
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 dark:text-red-400 hover:text-red-650 dark:hover:text-red-300 hover:bg-red-500/10 transition-all text-sm cursor-pointer"
                    >
                        <FiLogOut className="text-base shrink-0" />
                        Đăng xuất tài khoản
                    </button>
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 font-semibold space-y-0.5 shrink-0">
                <div>© 2026 Hyra AI Panel</div>
                <div>System Kernel v2.0</div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
