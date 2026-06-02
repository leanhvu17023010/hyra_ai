import { FiUser, FiUserCheck, FiShield, FiClock } from 'react-icons/fi';

function StatsCards({ totalUsers, activeUsers, adminUsers, cooldown, activeRatio, adminRatio }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - Blue/Indigo Gradient */}
            <div className="bg-gradient-to-r from-[#5b6ef7] to-[#8b5cf6] rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-3xl font-black">{totalUsers}</h4>
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">Tổng thành viên</p>
                    </div>
                    <FiUser className="text-white/30 text-2xl" />
                </div>
                <div className="w-full bg-white/20 h-1 rounded-full my-4 overflow-hidden">
                    <div className="bg-white h-full" style={{ width: '80%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>Đăng ký hệ thống</span>
                    <span>+100%</span>
                </div>
            </div>

            {/* Card 2 - Emerald/Teal Gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-3xl font-black">{activeUsers}</h4>
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">Đang hoạt động</p>
                    </div>
                    <FiUserCheck className="text-white/30 text-2xl" />
                </div>
                <div className="w-full bg-white/20 h-1 rounded-full my-4 overflow-hidden">
                    <div className="bg-white h-full" style={{ width: `${activeRatio}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>Tỷ lệ hoạt động</span>
                    <span>+{activeRatio}%</span>
                </div>
            </div>

            {/* Card 3 - Violet/Pink Gradient */}
            <div className="bg-gradient-to-r from-[#8b5cf6] to-pink-500 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-3xl font-black">{adminUsers}</h4>
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">Quản trị viên</p>
                    </div>
                    <FiShield className="text-white/30 text-2xl" />
                </div>
                <div className="w-full bg-white/20 h-1 rounded-full my-4 overflow-hidden">
                    <div className="bg-white h-full" style={{ width: `${adminRatio}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>Tài khoản cấp cao</span>
                    <span>{adminRatio}%</span>
                </div>
            </div>

            {/* Card 4 - Amber/Orange Gradient */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-3xl font-black">{cooldown}s</h4>
                        <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-1">Chờ Cooldown</p>
                    </div>
                    <FiClock className="text-white/30 text-2xl" />
                </div>
                <div className="w-full bg-white/20 h-1 rounded-full my-4 overflow-hidden">
                    <div className="bg-white h-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>Thời gian cooldown</span>
                    <span>Giới hạn</span>
                </div>
            </div>
        </div>
    );
}

export default StatsCards;
