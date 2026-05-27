import { FiImage, FiVideo } from 'react-icons/fi';

function ProfileInfo({ user, stats }) {
    return (
        <div className="space-y-16">
            <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Họ và tên hiển thị
                    </label>
                    <div className="text-xl rounded-2xl font-bold py-5 px-6 text-slate-800 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-800">
                        {user?.userName}
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Email đăng ký
                    </label>
                    <div className="text-xl rounded-2xl font-bold py-5 px-6 text-slate-800 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-800">
                        {user?.email}
                    </div>
                </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 pt-12 border-t border-slate-100 dark:border-slate-800/80">
                <div className="rounded-3xl border border-blue-100 bg-blue-50/20 p-8 dark:border-blue-950 dark:bg-blue-950/20">
                    <div className="flex items-center gap-3.5 text-blue-600 dark:text-blue-400">
                        <FiImage className="text-2xl" />
                        <span className="text-xl font-bold uppercase tracking-wider">Swap ảnh</span>
                    </div>
                    <p className="mt-4 text-4xl font-black text-slate-800 dark:text-white">
                        {stats.imageSwapCount}
                    </p>
                </div>
                <div className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-8 dark:border-indigo-950 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-3.5 text-indigo-600 dark:text-indigo-400">
                        <FiVideo className="text-2xl" />
                        <span className="text-xl font-bold uppercase tracking-wider">Swap video</span>
                    </div>
                    <p className="mt-4 text-4xl font-black text-slate-800 dark:text-white">
                        {stats.videoSwapCount}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo;
