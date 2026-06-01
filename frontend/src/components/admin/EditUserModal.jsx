import { FiX } from 'react-icons/fi';

function EditUserModal({
    editingUser,
    setEditingUser,
    editForm,
    setEditForm,
    handleSaveEdit,
    actionLoading,
}) {
    if (!editingUser) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl relative">
                <button
                    onClick={() => setEditingUser(null)}
                    className="absolute top-4 right-4 text-xl text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                    <FiX />
                </button>
                
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
                    Chỉnh sửa tài khoản
                </h3>

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-450 uppercase mb-2">Email</label>
                        <input
                            type="text"
                            value={editingUser.email}
                            disabled
                            className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-base text-slate-500 cursor-not-allowed outline-none font-semibold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-455 uppercase mb-2">Tên tài khoản</label>
                        <input
                            type="text"
                            value={editForm.userName}
                            onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                            className="w-full px-4 py-3.5 bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-base text-slate-800 dark:text-white outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 font-semibold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-455 uppercase mb-2">Vai trò</label>
                        <select
                            value={editForm.roleName}
                            onChange={(e) => setEditForm({ ...editForm, roleName: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-base text-slate-800 dark:text-white outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 font-bold cursor-pointer"
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <span className="text-base font-bold text-slate-700 dark:text-slate-350 font-semibold">Trạng thái hoạt động</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.active}
                                onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-655 peer-checked:bg-blue-600 font-semibold"></div>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => setEditingUser(null)}
                        className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-[#5b6ef7]/15"
                    >
                        {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditUserModal;
