import { useState } from 'react';
import { FiSearch, FiRefreshCw, FiXCircle, FiPlay, FiEye, FiDownload, FiCheckCircle, FiAlertCircle, FiClock, FiPlayCircle } from 'react-icons/fi';

function TasksPanel() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null);

    // Mock initial tasks
    const [tasks, setTasks] = useState([
        { id: 't-129a0', type: 'Video Swap', user: 'hoang_viet@gmail.com', status: 'SUCCESS', progress: 100, duration: '4.2s', size: '12.4MB', time: '5 phút trước', input: 'video_sample.mp4', output: 'result_lipsync.mp4' },
        { id: 't-78b19', type: 'Lip Sync', user: 'le_dung@yahoo.com', status: 'PROCESSING', progress: 65, duration: '8.0s', size: '28.1MB', time: 'Vừa xong', input: 'intro.mp4', output: null },
        { id: 't-54c22', type: 'Image Swap', user: 'thanh_truc@gmail.com', status: 'SUCCESS', progress: 100, duration: '5.1s', size: '1.2MB', time: '12 phút trước', input: 'face.jpg', output: 'swapped_face.jpg' },
        { id: 't-92d33', type: 'TTS + Lipsync', user: 'minh_long@gmail.com', status: 'QUEUED', progress: 0, duration: '15.0s', size: '42.0MB', time: '2 phút trước', input: 'voice.wav', output: null },
        { id: 't-11e04', type: 'Video Swap', user: 'nguyen_a@gmail.com', status: 'FAILED', progress: 40, duration: '10s', size: '15.2MB', time: '1 giờ trước', input: 'vlog.mp4', output: null, error: 'CUDA Out Of Memory on RTX 4090 Node-01' },
        { id: 't-45f88', type: 'Lip Sync', user: 'tran_b@gmail.com', status: 'CANCELLED', progress: 20, duration: '5s', size: '8.4MB', time: '2 giờ trước', input: 'clip.mp4', output: null }
    ]);

    // Handle cancel task
    const handleCancel = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'CANCELLED', progress: 0 } : t));
    };

    // Handle retry task
    const handleRetry = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'PROCESSING', progress: 10, error: null } : t));
    };

    // Filters
    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.id.includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'PROCESSING':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse';
            case 'QUEUED':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'FAILED':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            case 'CANCELLED':
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS': return <FiCheckCircle />;
            case 'PROCESSING': return <FiPlayCircle className="animate-spin" />;
            case 'QUEUED': return <FiClock />;
            case 'FAILED': return <FiAlertCircle />;
            case 'CANCELLED': return <FiXCircle />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter and Search Action Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm ID, User email, loại task..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm outline-none focus:ring-2 focus:ring-[#5b6ef7]/15 transition-all text-slate-700 dark:text-slate-200"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {['ALL', 'QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                statusFilter === st
                                    ? 'bg-[#5b6ef7] text-white border-[#5b6ef7]'
                                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area: List and Details Side-by-Side if selected */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* List Pane */}
                <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${selectedTask ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50/40 dark:bg-slate-950/20">
                                    <th className="py-4 px-5">Task ID</th>
                                    <th className="py-4 px-5">Loại Tác vụ</th>
                                    <th className="py-4 px-5">Khách hàng</th>
                                    <th className="py-4 px-5">Trạng thái</th>
                                    <th className="py-4 px-5">Thời lượng / Size</th>
                                    <th className="py-4 px-5">Thời gian</th>
                                    <th className="py-4 px-5 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {filteredTasks.map((t) => (
                                    <tr 
                                        key={t.id} 
                                        onClick={() => setSelectedTask(t)}
                                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors cursor-pointer text-sm font-semibold ${selectedTask?.id === t.id ? 'bg-slate-50 dark:bg-slate-850/50' : ''}`}
                                    >
                                        <td className="py-4 px-5 text-[#5b6ef7] dark:text-[#a78bfa] font-mono">{t.id}</td>
                                        <td className="py-4 px-5 text-slate-800 dark:text-white">{t.type}</td>
                                        <td className="py-4 px-5 text-slate-500 dark:text-slate-405 truncate max-w-[150px]">{t.user}</td>
                                        <td className="py-4 px-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(t.status)}`}>
                                                {getStatusIcon(t.status)}
                                                {t.status}
                                            </span>
                                            {t.status === 'PROCESSING' && (
                                                <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                    <div className="bg-blue-500 h-full" style={{ width: `${t.progress}%` }}></div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-5 text-slate-500 dark:text-slate-450 text-xs">
                                            <div>{t.duration}</div>
                                            <div className="text-[10px] text-slate-400">{t.size}</div>
                                        </td>
                                        <td className="py-4 px-5 text-slate-400 text-xs">{t.time}</td>
                                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedTask(t)}
                                                    className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <FiEye size={15} />
                                                </button>
                                                {t.status === 'PROCESSING' || t.status === 'QUEUED' ? (
                                                    <button
                                                        onClick={() => handleCancel(t.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                                        title="Hủy tác vụ"
                                                    >
                                                        <FiXCircle size={15} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRetry(t.id)}
                                                        className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-55/20 rounded-lg transition-colors"
                                                        title="Tải lại tác vụ"
                                                    >
                                                        <FiRefreshCw size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inspect Details Pane */}
                {selectedTask && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 animate-fade-in self-start">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">Chi tiết Tác vụ</h3>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 text-xs font-semibold">
                            <div className="flex justify-between">
                                <span className="text-slate-400">ID Tác vụ:</span>
                                <span className="font-mono text-slate-850 dark:text-white">{selectedTask.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Người thực hiện:</span>
                                <span className="text-slate-800 dark:text-white">{selectedTask.user}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Loại:</span>
                                <span className="text-slate-850 dark:text-white">{selectedTask.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Độ dài dự đoán:</span>
                                <span className="text-slate-850 dark:text-white">{selectedTask.duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Tệp đầu vào:</span>
                                <span className="text-slate-850 dark:text-white">{selectedTask.input}</span>
                            </div>
                            {selectedTask.output && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Kết quả đầu ra:</span>
                                    <span className="text-[#5b6ef7] hover:underline cursor-pointer flex items-center gap-1 font-mono">
                                        {selectedTask.output} <FiDownload size={10} />
                                    </span>
                                </div>
                            )}
                        </div>

                        {selectedTask.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <FiAlertCircle /> Lỗi hệ thống:
                                </div>
                                <p className="font-mono break-all leading-normal">{selectedTask.error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            {selectedTask.status === 'SUCCESS' && (
                                <button className="flex-1 py-2 bg-[#5b6ef7] text-white rounded-xl font-bold text-xs hover:bg-[#4b5ee7] transition-all cursor-pointer flex items-center justify-center gap-1">
                                    <FiPlay size={12} /> Play Output
                                </button>
                            )}
                            {(selectedTask.status === 'FAILED' || selectedTask.status === 'CANCELLED') && (
                                <button
                                    onClick={() => handleRetry(selectedTask.id)}
                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <FiRefreshCw size={12} /> Retry Task
                                </button>
                            )}
                            {(selectedTask.status === 'PROCESSING' || selectedTask.status === 'QUEUED') && (
                                <button
                                    onClick={() => handleCancel(selectedTask.id)}
                                    className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <FiXCircle size={12} /> Force Stop
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TasksPanel;
