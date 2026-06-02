import { FiAlertTriangle } from 'react-icons/fi';

function DeleteUserModal({
    deletingUser,
    setDeletingUser,
    handleDeleteUser,
    actionLoading,
}) {
    if (!deletingUser) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl relative text-center font-semibold animate-duration-200">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/20">
                    <FiAlertTriangle />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-855 dark:text-white mb-2">
                    Xác nhận xóa tài khoản
                </h3>
                <p className="text-base text-slate-450 dark:text-slate-400 mb-6 font-medium">
                    Bạn có chắc chắn muốn xóa tài khoản <span className="font-bold text-slate-700 dark:text-white break-all">{deletingUser.email}</span>? Hành động này không thể hoàn tác.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setDeletingUser(null)}
                        className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleDeleteUser}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-red-500 hover:bg-red-655 text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-red-500/15"
                    >
                        {actionLoading ? 'Đang xóa...' : 'Đồng ý xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteUserModal;
