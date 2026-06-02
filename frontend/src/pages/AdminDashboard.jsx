import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import useAuthStore from '../store/authStore';
import userService from '../services/userService';

// Modular Subcomponents
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import UsersTable from '../components/admin/UsersTable';
import EditUserModal from '../components/admin/EditUserModal';
import DeleteUserModal from '../components/admin/DeleteUserModal';
import TasksPanel from '../components/admin/TasksPanel';
import QueuesPanel from '../components/admin/QueuesPanel';

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, isInitialized, fetchUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Active Tab State - Defaults to Dashboard
    const [activeTab, setActiveTab] = useState('dashboard');

    // Swap Time Configuration State
    const [swapTimeConfig] = useState({
        maxVideoDuration: 30,
        executionTimeout: 300,
        retentionPeriod: 24,
        priorityProcessing: false,
        rateLimiting: true
    });

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        userName: '',
        roleName: 'USER',
        active: true
    });

    // Delete Confirmation State
    const [deletingUser, setDeletingUser] = useState(null);

    // Initial Auth State Load (Required since Navbar is bypassed on admin route)
    useEffect(() => {
        if (!isInitialized) {
            fetchUser();
        }
    }, [isInitialized, fetchUser]);

    // Auth Check once initialized
    useEffect(() => {
        if (isInitialized) {
            if (!user || !user.role || user.role.name !== 'ADMIN') {
                navigate('/');
            }
        }
    }, [user, isInitialized, navigate]);

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await userService.getAllUsers();
            if (data && Array.isArray(data.result)) {
                setUsers(data.result);
            } else if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lấy danh sách người dùng.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        if (user && user.role && user.role.name === 'ADMIN') {
            setTimeout(() => {
                if (active) {
                    fetchUsers();
                }
            }, 0);
        }
        return () => {
            active = false;
        };
    }, [user]);

    const handleOpenEdit = (u) => {
        setEditingUser(u);
        setEditForm({
            userName: u.userName || '',
            roleName: u.role?.name || 'USER',
            active: u.isActive
        });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setActionLoading(true);
        setError('');
        setMessage('');
        try {
            // Cập nhật người dùng qua api PUT /users/{userId}
            await userService.updateUser(editingUser.id, {
                userName: editForm.userName,
                role: editForm.roleName,
                isActive: editForm.active
            });
            setMessage(`Cập nhật thông tin của ${editingUser.email} thành công!`);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        setActionLoading(true);
        setError('');
        setMessage('');
        try {
            await userService.deleteUser(deletingUser.id);
            setMessage(`Đã xóa người dùng ${deletingUser.email} khỏi hệ thống.`);
            setDeletingUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa người dùng thất bại.');
        } finally {
            setActionLoading(false);
        }
    };


    // Filtered users list
    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        if (!u) return false;
        const query = searchQuery.toLowerCase();
        return (
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.userName && u.userName.toLowerCase().includes(query)) ||
            (u.id && u.id.toLowerCase().includes(query))
        );
    }) : [];

    // Stats calculations
    const totalUsers = Array.isArray(users) ? users.length : 0;
    const activeUsers = Array.isArray(users) ? users.filter(u => u && u.isActive).length : 0;
    const adminUsers = Array.isArray(users) ? users.filter(u => u && u.role?.name === 'ADMIN').length : 0;

    const activeRatio = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0;
    const adminRatio = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(0) : 0;

    // Show loading page ONLY during authentication validation, NOT while fetching lists
    if (!isInitialized) {
        return (
            <div className="flex h-screen w-full items-center justify-center dark:bg-slate-955">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đang xác thực tài khoản...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans transition-colors duration-300">
            {/* Left Sidebar - Rukada Dark Teal/Slate Gradient stretching top-to-bottom */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Right Area Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Right Scrollable Content Pane */}
                <main className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-6 md:p-8 space-y-8 animate-fade-in">
                    {/* Header Breadcrumb / Title */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                {activeTab === 'dashboard' && 'Tổng quan hệ thống'}
                                {activeTab === 'users' && 'Quản lý người dùng'}
                                {activeTab === 'tasks' && 'Theo dõi tác vụ AI'}
                                {activeTab === 'queues' && 'Điều phối hàng đợi'}
                                {activeTab === 'gpus' && 'Giám sát hạ tầng GPU'}
                                {activeTab === 'payments' && 'Lịch sử thanh toán & Credits'}
                                {activeTab === 'logs' && 'Nhật ký hệ thống (System Logs)'}
                            </h2>
                            <p className="text-sm text-slate-455 dark:text-slate-500 font-semibold mt-1">
                                {activeTab === 'dashboard' && 'Bảng số liệu thống kê hoạt động, lưu lượng truy cập và tài khoản.'}
                                {activeTab === 'users' && 'Danh sách tài khoản, trạng thái hoạt động và vai trò thành viên.'}
                                {activeTab === 'tasks' && 'Quản lý tiến trình xử lý, kiểm tra trạng thái và điều phối tác vụ.'}
                                {activeTab === 'queues' && 'Quản lý luồng công việc AI, điều phối độ ưu tiên và thời gian chờ.'}
                                {activeTab === 'gpus' && 'Theo dõi tải trọng, nhiệt độ, dung lượng VRAM và trạng thái các node GPU.'}
                                {activeTab === 'payments' && 'Quản lý doanh thu, phê duyệt nạp credits thủ công và xem lịch sử giao dịch.'}
                                {activeTab === 'logs' && 'Theo dõi log thời gian thực của máy chủ API và GPU worker.'}
                            </p>
                        </div>
                    </div>

                    {/* Alert & Messages */}
                    {message && (
                        <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl text-sm font-semibold text-green-600 dark:text-green-400 flex items-center justify-between animate-fade-in">
                            <span>{message}</span>
                            <button onClick={() => setMessage('')} className="p-1 hover:bg-green-500/20 rounded-lg cursor-pointer">
                                <span className="text-lg">×</span>
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm font-semibold text-red-500 dark:text-red-400 flex items-center justify-between animate-fade-in">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="p-1 hover:bg-red-500/20 rounded-lg cursor-pointer">
                                <span className="text-lg">×</span>
                            </button>
                        </div>
                    )}

                    {/* Show spinner inside content panel only when data is actively fetching */}
                    {loading ? (
                        <div className="flex h-96 w-full items-center justify-center">
                            <div className="flex flex-col items-center gap-3 animate-pulse">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {activeTab === 'dashboard' && (
                                <DashboardOverview 
                                    totalUsers={totalUsers}
                                    activeUsers={activeUsers}
                                    adminUsers={adminUsers}
                                    cooldown={swapTimeConfig.cooldown}
                                    activeRatio={activeRatio}
                                    adminRatio={adminRatio}
                                />
                            )}
                            {activeTab === 'users' && (
                                <UsersTable 
                                    filteredUsers={filteredUsers}
                                    currentUser={user}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    handleOpenEdit={handleOpenEdit}
                                    setDeletingUser={setDeletingUser}
                                />
                            )}
                            {activeTab === 'tasks' && <TasksPanel />}
                            {activeTab === 'queues' && <QueuesPanel />}
                        </div>
                    )}
                </main>
            </div>

            {/* EDIT USER MODAL */}
            <EditUserModal 
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSaveEdit={handleSaveEdit}
                actionLoading={actionLoading}
            />

            {/* DELETE USER CONFIRMATION MODAL */}
            <DeleteUserModal 
                deletingUser={deletingUser}
                setDeletingUser={setDeletingUser}
                handleDeleteUser={handleDeleteUser}
                actionLoading={actionLoading}
            />
        </div>
    );
}

export default AdminDashboard;
