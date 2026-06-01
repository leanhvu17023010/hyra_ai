import { useState } from 'react';
import { FiClock, FiVideo, FiImage, FiEye, FiDownload, FiX } from 'react-icons/fi';
import swapService from '../../services/swapService';
import { resolveMediaUrl, isVideoResultUrl } from '../../utils/mediaUrl';

function SwapHistory({ history }) {
    const [previewItem, setPreviewItem] = useState(null);

    const handleDownload = async (item) => {
        try {
            const ext = isVideoResultUrl(item.resultUrl) ? 'mp4' : 'jpg';
            await swapService.downloadResult(item.resultUrl, `swap-${item.id}.${ext}`);
        } catch (err) {
            console.error(err);
            alert('Không tải được file. Vui lòng thử lại.');
        }
    };

    return (
        <div>
            {previewItem && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewItem(null)}
                            className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        >
                            <FiX className="text-2xl" />
                        </button>
                        {isVideoResultUrl(previewItem.resultUrl) ? (
                            <video
                                src={resolveMediaUrl(previewItem.resultUrl)}
                                controls
                                autoPlay
                                className="max-h-[85vh] w-full rounded-2xl bg-black"
                            />
                        ) : (
                            <img
                                src={resolveMediaUrl(previewItem.resultUrl)}
                                alt="Kết quả swap"
                                className="max-h-[85vh] w-full rounded-2xl object-contain bg-black"
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-2 bg-green-500 rounded-full" />
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Lịch sử Swap
                    </h2>
                </div>
                <span className="text-sm rounded-full bg-slate-150/60 dark:bg-slate-800 px-4 py-1.5 font-bold text-slate-500 dark:text-slate-400">
                    {history.length} mục đã lưu
                </span> 
            </div>

            {history.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2">
                    {history.map((item) => {
                        const isVideo =
                            item.mediaType === 'video' ||
                            isVideoResultUrl(item.resultUrl);
                        const mediaSrc = resolveMediaUrl(item.resultUrl);
                        const dateLabel = item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                            : new Date().toLocaleDateString('vi-VN');

                        return (
                            <div
                                key={item.id}
                                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-350 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700"
                            >
                                <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950">
                                    {isVideo ? (
                                        <video
                                            src={mediaSrc}
                                            className="h-full w-full object-cover"
                                            muted
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={mediaSrc}
                                            alt="Kết quả swap"
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewItem(item)}
                                            className="rounded-xl bg-white p-2.5 text-slate-800 hover:scale-105 transition-transform"
                                        >
                                            <FiEye size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(item)}
                                            className="rounded-xl bg-[#5b6ef7] p-2.5 text-white hover:scale-105 transition-transform"
                                        >
                                            <FiDownload size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="px-1.5 pb-1 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {isVideo ? (
                                                <FiVideo className="text-slate-500 text-base" />
                                            ) : (
                                                <FiImage className="text-slate-500 text-base" />
                                            )}
                                            <span className="font-bold text-xl text-slate-700 dark:text-slate-200">
                                                {isVideo ? 'Video Swap' : 'Ảnh Swap'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400 mt-1">
                                            {dateLabel}
                                        </p>
                                    </div>
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-400 dark:bg-slate-800/80">
                        <FiClock />
                    </div>
                    <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">Bạn chưa có dữ liệu swap nào.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Hoàn tất một lần swap để thấy lịch sử tại đây.
                    </p>
                </div>
            )}
        </div>
    );
}

export default SwapHistory;
