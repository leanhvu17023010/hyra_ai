import { useState } from 'react';
import { FiUsers, FiTrendingUp, FiActivity} from 'react-icons/fi';
import StatsCards from './StatsCards';

function DashboardOverview({ totalUsers, activeUsers, adminUsers, cooldown, activeRatio, adminRatio }) {
    // 1. Mock Data: Chỉ số hoạt động 6 ngày gần nhất
    const [dailyData] = useState([
        { date: '23-05', newUsers: 25, activeUsers: 195, tasks: 590 },
        { date: '24-05', newUsers: 11, activeUsers: 125, tasks: 380 },
        { date: '25-05', newUsers: 9, activeUsers: 110, tasks: 310 },
        { date: '26-05', newUsers: 22, activeUsers: 180, tasks: 530 },
        { date: '27-05', newUsers: 18, activeUsers: 162, tasks: 490 },
        { date: 'Hôm nay', newUsers: 14, activeUsers: 145, tasks: 420 }
    ]);

    return (
        <div className="space-y-8 py-5">
            {/* Top Stats Cards Row */}
            <StatsCards 
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                adminUsers={adminUsers}
                cooldown={cooldown}
                activeRatio={activeRatio}
                adminRatio={adminRatio}
            />

            {/* Simplified Chart + Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Sleek, Minimalist CSS Bar Chart comparing Active Users */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FiTrendingUp className="text-[#5b6ef7] dark:text-[#a78bfa] text-lg" />
                                <h3 className="text-base font-bold text-slate-850 dark:text-white">Lượt Truy Cập Hệ Thống (Active Users)</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-400">6 ngày gần nhất</span>
                        </div>
                    </div>

                    {/* Bar Chart container using standard Flexbox layout */}
                    <div className="h-44 flex items-end justify-between px-4 pt-6 border-b border-slate-100 dark:border-slate-800 relative">
                        {dailyData.map((d, index) => {
                            // Calculate height relative to max active users scale
                            const heightPct = Math.min(100, (d.activeUsers / 220) * 100);
                            return (
                                <div key={index} className="h-full flex flex-col justify-end items-center gap-1.5 w-12 group relative pb-6">
                                    {/* Tooltip on Hover */}
                                    <div className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 transition-all bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                                        {d.activeUsers} hoạt động
                                    </div>
                                    {/* Bar */}
                                    <div 
                                        style={{ height: `${heightPct}%` }}
                                        className="w-7 bg-gradient-to-t from-[#5b6ef7] to-[#8b5cf6] dark:from-[#6366f1] dark:to-[#8b5cf6] rounded-t-md transition-all duration-500 hover:opacity-85"
                                    />
                                    {/* Label */}
                                    <span className="absolute bottom-0 text-[10px] text-slate-400 dark:text-slate-500 font-bold">{d.date}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Simplified AI Performance Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FiActivity className="text-emerald-500 text-lg" />
                            <h3 className="text-base font-bold text-slate-850 dark:text-white">Hiệu Suất Vận Hành AI</h3>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mb-4">
                            Thông số đo lường hiệu năng tổng thể.
                        </p>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850">
                            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Tỷ lệ Task thành công</span>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">98.5%</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850">
                            <span className="text-xs text-slate-455 dark:text-slate-400 font-semibold">Thời gian phản hồi TB</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">4.2 giây</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                            <span className="text-xs text-slate-455 dark:text-slate-400 font-semibold">GPU Nodes kích hoạt</span>
                            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">3 / 4 Nodes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. BẢNG THEO DÕI SỐ NGƯỜI SỬ DỤNG HÀNG NGÀY */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiUsers className="text-[#5b6ef7] dark:text-[#a78bfa] text-lg" />
                        <h3 className="text-base font-bold text-slate-850 dark:text-white">Bảng Theo Dõi Số Người Sử Dụng Hàng Ngày</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs font-semibold">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50/40 dark:bg-slate-950/20">
                                <th className="py-3.5 px-6">Ngày</th>
                                <th className="py-3.5 px-6">Đăng ký mới</th>
                                <th className="py-3.5 px-6">Số người hoạt động</th>
                                <th className="py-3.5 px-6 text-right">Tổng số Task xử lý</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                            {dailyData.map((d, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/25 transition-colors">
                                    <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-white">{d.date}</td>
                                    <td className="py-3.5 px-6">
                                        <span className="text-emerald-500 font-bold">+{d.newUsers}</span>
                                    </td>
                                    <td className="py-3.5 px-6 font-mono">{d.activeUsers}</td>
                                    <td className="py-3.5 px-6 text-right font-mono text-slate-800 dark:text-white">{d.tasks} tác vụ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DashboardOverview;
