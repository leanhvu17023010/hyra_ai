import { FiImage, FiVideo } from 'react-icons/fi';

function ProfileInfo({ user, stats }) {
    return (
        <div className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                    <label className="text-xl font-black uppercase text-gray-400 tracking-wider">
                        Họ và tên hiển thị
                    </label>
                    <div className="text-2xl rounded-2xl font-bold py-5 px-4 text-gray-700 dark:bg-gray-700/50 dark:text-white border border-gray-300 dark:border-gray-600">
                        {user?.userName}
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-xl font-black uppercase text-gray-400 tracking-wider">
                        Email đăng ký
                    </label>
                    <div className="text-2xl rounded-2xl font-bold py-5 px-4 text-gray-700 dark:bg-gray-700/50 dark:text-white border border-gray-300 dark:border-gray-600">
                        {user?.email}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 py-5">
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
    );
}

export default ProfileInfo;
