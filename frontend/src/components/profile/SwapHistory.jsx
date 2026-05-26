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
                <div className="flex items-center gap-3">
                    <div className="h-10 w-1.5 bg-green-500 rounded-full" />
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        Lịch sử Swap
                    </h2>
                </div>
                <span className="text-xl rounded-full bg-gray-100 px-4 py-1.5 font-black uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                    {history.length} mục đã lưu
                </span>
            </div>

            {history.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
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
                                className="group overflow-hidden rounded-[24px] border border-gray-300 bg-white p-3 shadow-md transition-all hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-gray-700/50 dark:border-gray-600"
                            >
                                <div className="relative mb-4 aspect-video overflow-hidden rounded-[20px] bg-gray-100">
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
                                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewItem(item)}
                                            className="rounded-xl bg-white p-3 text-gray-800 hover:scale-110"
                                        >
                                            <FiEye />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(item)}
                                            className="rounded-xl bg-blue-600 p-3 text-white hover:scale-110"
                                        >
                                            <FiDownload />
                                        </button>
                                    </div>
                                </div>
                                <div className="px-2 pb-2 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {isVideo ? (
                                                <FiVideo className="text-blue-500 text-sm" />
                                            ) : (
                                                <FiImage className="text-blue-500 text-sm" />
                                            )}
                                            <span className="font-bold text-xl text-gray-700 dark:text-gray-200">
                                                {isVideo ? 'Video Swap' : 'Ảnh Swap'}
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-400 mt-0.5">
                                            {dateLabel}
                                        </p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-4xl text-gray-200 dark:bg-gray-700">
                        <FiClock />
                    </div>
                    <p className="font-bold text-gray-400">Bạn chưa có dữ liệu swap nào.</p>
                    <p className="text-xs text-gray-300 mt-1">
                        Hoàn tất một lần swap để thấy lịch sử tại đây.
                    </p>
                </div>
            )}
        </div>
    );
}

export default SwapHistory;
