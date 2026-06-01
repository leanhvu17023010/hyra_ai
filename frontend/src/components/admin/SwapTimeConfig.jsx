import { FiClock } from 'react-icons/fi';

function SwapTimeConfig({
    swapTimeConfig,
    setSwapTimeConfig,
    handleSaveSwapTimeConfig,
    actionLoading,
}) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b6ef7] to-[#4a5ce6] text-white shadow-lg shadow-[#5b6ef7]/20">
                    <FiClock className="text-2xl" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Cấu hình thời gian Swap</h3>
                    <p className="text-sm text-slate-450 dark:text-slate-500 mt-1">
                        Thiết lập thời gian chờ, thời lượng video tối đa và các giới hạn hệ thống.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSaveSwapTimeConfig} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 pt-4">
                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Thời gian chờ giữa các lần swap (s)
                    </label>
                    <input
                        type="number"
                        value={swapTimeConfig.cooldown}
                        onChange={(e) => setSwapTimeConfig({ ...swapTimeConfig, cooldown: parseInt(e.target.value) || 0 })}
                        className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        placeholder="Ví dụ: 60"
                        min="0"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Thời gian (giây) người dùng tiêu chuẩn phải chờ trước lần swap tiếp theo.</p>
                </div>

                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Thời lượng video tối đa (s)
                    </label>
                    <input
                        type="number"
                        value={swapTimeConfig.maxVideoDuration}
                        onChange={(e) => setSwapTimeConfig({ ...swapTimeConfig, maxVideoDuration: parseInt(e.target.value) || 0 })}
                        className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        placeholder="Ví dụ: 30"
                        min="1"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Giới hạn thời lượng (giây) của video đầu vào hoặc video kết quả.</p>
                </div>

                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Thời gian chờ xử lý tối đa (s)
                    </label>
                    <input
                        type="number"
                        value={swapTimeConfig.executionTimeout}
                        onChange={(e) => setSwapTimeConfig({ ...swapTimeConfig, executionTimeout: parseInt(e.target.value) || 0 })}
                        className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        placeholder="Ví dụ: 300"
                        min="1"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Hệ thống sẽ tự động hủy tác vụ nếu thời gian xử lý vượt quá giới hạn này.</p>
                </div>

                <div className="space-y-4">
                    <label className="text-xl font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Thời gian lưu kết quả (giờ)
                    </label>
                    <input
                        type="number"
                        value={swapTimeConfig.retentionPeriod}
                        onChange={(e) => setSwapTimeConfig({ ...swapTimeConfig, retentionPeriod: parseInt(e.target.value) || 0 })}
                        className="text-xl w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 font-semibold outline-none focus:border-[#5b6ef7] focus:ring-2 focus:ring-[#5b6ef7]/15 dark:bg-slate-900/60 dark:text-white dark:border-slate-800"
                        placeholder="Ví dụ: 24"
                        min="1"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Thời gian file kết quả swap được lưu trữ trên server trước khi bị xóa tự động.</p>
                </div>

                <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800/80 my-2 pt-6 flex flex-col sm:flex-row justify-between gap-6 font-semibold">
                    <div className="flex items-center justify-between flex-1 py-1">
                        <div>
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-350 block">Xử lý ưu tiên (Priority)</span>
                            <span className="text-xs text-slate-450 dark:text-slate-500">Ưu tiên hàng đợi xử lý cho Admin hoặc gói VIP.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                checked={swapTimeConfig.priorityProcessing}
                                onChange={(e) => setSwapTimeConfig({ ...swapTimeConfig, priorityProcessing: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-655 peer-checked:bg-blue-600 font-semibold"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between flex-1 py-1">
                        <div>
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-350 block">Giới hạn tần suất</span>
                            <span className="text-xs text-slate-450 dark:text-slate-500">Áp dụng cơ chế rate limit chặn spam tác vụ swap.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                checked={swapTimeConfig.rateLimiting}
                                onChange={(e) => setSwapTimeConfig({ ...swapTimeConfig, rateLimiting: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-655 peer-checked:bg-blue-600 font-semibold"></div>
                        </label>
                    </div>
                </div>

                <div className="md:col-span-2 pt-6">
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="text-xl w-full rounded-2xl bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] py-4.5 font-bold text-white shadow-md shadow-[#5b6ef7]/15 disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
                    >
                        {actionLoading ? 'Đang lưu cấu hình...' : 'Lưu cấu hình thời gian swap'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SwapTimeConfig;
