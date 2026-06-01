import { FiSearch, FiShield, FiCheck, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

function UsersTable({
    filteredUsers,
    currentUser,
    searchQuery,
    setSearchQuery,
    handleOpenEdit,
    setDeletingUser,
}) {
    return (
        <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm thành viên theo Email, Tên tài khoản, hoặc ID..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-base text-slate-800 dark:text-white focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 transition-all placeholder:text-slate-450 font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-medium">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-5">Tên tài khoản / Email</th>
                                <th className="px-6 py-5">Vai trò (Role)</th>
                                <th className="px-6 py-5">Trạng thái</th>
                                <th className="px-6 py-5">Ngày tham gia</th>
                                <th className="px-6 py-5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-base text-slate-660 dark:text-slate-350">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 text-slate-400 font-semibold">
                                        Không tìm thấy tài khoản nào khớp với bộ lọc.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 dark:text-white text-lg">
                                                    {u.userName || 'Không có tên'}
                                                </span>
                                                <span className="text-sm text-slate-450 dark:text-slate-500 mt-1 font-semibold break-all">
                                                    {u.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                u.role?.name === 'ADMIN' 
                                                    ? 'bg-purple-500/10 text-purple-650 dark:bg-purple-950/30 dark:text-purple-400' 
                                                    : 'bg-blue-500/10 text-blue-655 dark:bg-blue-950/30 dark:text-blue-400'
                                            }`}>
                                                <FiShield size={12} /> {u.role?.name || 'USER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                u.isActive 
                                                    ? 'bg-green-500/10 text-green-655 dark:bg-green-950/30 dark:text-green-400' 
                                                    : 'bg-red-500/10 text-red-655 dark:bg-red-950/30 dark:text-red-400'
                                            }`}>
                                                {u.isActive ? (
                                                    <>
                                                        <FiCheck size={12} /> Hoạt động
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiX size={12} /> Bị khóa
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-slate-450 dark:text-slate-500">
                                            {u.createAt ? new Date(u.createAt).toLocaleDateString('vi-VN') : '---'}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(u)}
                                                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl transition-all cursor-pointer"
                                                    title="Chỉnh sửa tài khoản"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                {/* Ngăn tự xóa bản thân */}
                                                {currentUser?.id !== u.id && (
                                                    <button
                                                        onClick={() => setDeletingUser(u)}
                                                        className="p-2.5 hover:bg-red-500/10 text-red-550 rounded-xl transition-all cursor-pointer"
                                                        title="Xóa tài khoản"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UsersTable;
