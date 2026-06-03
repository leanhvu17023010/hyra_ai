import { useState, useEffect } from 'react';
import { FiClock, FiVideo, FiImage, FiEye, FiDownload, FiX, FiVolume2, FiFileText } from 'react-icons/fi';
import swapService from '../../services/swapService';
import api from '../../services/api';
import { resolveMediaUrl, isVideoResultUrl } from '../../utils/mediaUrl';

function SwapHistory({ history }) {
    // Chỉ giữ lại các task chưa hết hạn và có thời gian tạo không quá 3 ngày
    const activeHistory = (history || []).filter((item) => {
        if (item.status === 'EXPIRED') return false;
        if (item.createdAt) {
            const created = new Date(item.createdAt);
            const diffTime = new Date() - created;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays > 3) return false;
        }
        return true;
    });

    const [previewItem, setPreviewItem] = useState(null);
    const [previewTextContent, setPreviewTextContent] = useState('');
    const [textLoading, setTextLoading] = useState(false);
    const [previewMediaUrl, setPreviewMediaUrl] = useState('');
    const [mediaLoading, setMediaLoading] = useState(false);

    // Tai nội dung xem trước khi chọn một mục lịch sử
    useEffect(() => {
        if (!previewItem) {
            setTimeout(() => {
                setPreviewTextContent('');
                setPreviewMediaUrl('');
            }, 0);
            return;
        }

        const isText =
            previewItem.mediaType === 'subtitle' ||
            previewItem.resultUrl?.endsWith('.srt') ||
            previewItem.resultUrl?.endsWith('.txt');

        if (isText) {
            setTimeout(() => {
                setTextLoading(true);
                setPreviewTextContent('');
                // Gọi API để lấy nội dung text từ URL kết quả, giúp xem trước mà không cần tải về máy
                api.get(previewItem.resultUrl, { responseType: 'text' })
                    .then((res) => {
                        setPreviewTextContent(res.data);
                    })
                    .catch((err) => {
                        console.error('Failed to load text preview:', err);
                        setPreviewTextContent('Không thể tải nội dung tệp phụ đề/kịch bản.');
                    })
                    .finally(() => {
                        setTextLoading(false);
                    });
            }, 0);
        } else {
            setTimeout(() => {
                setMediaLoading(true);
                setPreviewMediaUrl('');
                // Goii API để lấy URL Blob tạm thời cho media, giúp xem trước mà không cần tải về máy
                swapService.getResultBlobUrlFromPath(previewItem.resultUrl)
                    .then((blobUrl) => {
                        setPreviewMediaUrl(blobUrl);
                    })
                    .catch((err) => {
                        console.error('Failed to load media preview:', err);
                        // Fallback sang resolveMediaUrl nếu có lỗi
                        setPreviewMediaUrl(resolveMediaUrl(previewItem.resultUrl));
                    })
                    .finally(() => {
                        setMediaLoading(false);
                    });
            }, 0);
        }
    }, [previewItem]);

    // Giải phóng Object URL của Blob khi đổi preview hoặc unmount để tránh tràn bộ nhớ
    useEffect(() => {
        return () => {
            if (previewMediaUrl && previewMediaUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewMediaUrl);
            }
        };
    }, [previewMediaUrl]);

    const handleDownload = async (item) => {
        try {
            let ext = 'jpg';
            if (item.mediaType === 'video' || isVideoResultUrl(item.resultUrl)) {
                ext = 'mp4';
            } else if (item.mediaType === 'audio' || item.resultUrl?.endsWith('.wav') || item.resultUrl?.endsWith('.mp3')) {
                ext = 'wav';
            } else if (item.mediaType === 'subtitle' || item.resultUrl?.endsWith('.srt')) {
                ext = 'srt';
            } else if (item.resultUrl?.endsWith('.txt')) {
                ext = 'txt';
            }
            await swapService.downloadResult(item.resultUrl, `result-${item.id}.${ext}`);
        } catch (err) {
            console.error(err);
            alert('Không tải được file. Vui lòng thử lại.');
        }
    };

    return (
        <div>
            {previewItem && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewItem(null)}
                            className="absolute -top-14 right-0 rounded-full bg-slate-900/60 hover:bg-slate-800/80 p-2.5 text-white border border-slate-700/50 backdrop-blur-sm transition-all hover:scale-105"
                        >
                            <FiX className="text-2xl" />
                        </button>
                        
                        {mediaLoading ? (
                            <div className="bg-slate-900/80 rounded-3xl p-12 flex flex-col items-center justify-center gap-3 min-h-[250px] max-w-md mx-auto shadow-2xl border border-slate-800">
                                <div className="w-10 h-10 border-4 border-white/20 border-t-[#5b6ef7] rounded-full animate-spin" />
                                <span className="text-sm text-gray-300 font-medium">Đang tải tệp xem trước...</span>
                            </div>
                        ) : (
                            <>
                                {/* 1. Video Player */}
                                {(previewItem.mediaType === 'video' || isVideoResultUrl(previewItem.resultUrl)) ? (
                                    <video
                                        src={previewMediaUrl}
                                        controls
                                        autoPlay
                                        className="max-h-[80vh] mx-auto rounded-3xl bg-slate-950 border border-slate-850 shadow-2xl"
                                    />
                                ) : /* 2. Audio Player Dialog */
                                (previewItem.mediaType === 'audio' || previewItem.resultUrl?.endsWith('.wav') || previewItem.resultUrl?.endsWith('.mp3')) ? (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center gap-4 max-w-md mx-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] flex items-center justify-center text-white shadow-lg">
                                            <FiVolume2 size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nghe lại kết quả giọng nói</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2">Mã tệp: {previewItem.id}</p>
                                        <audio src={previewMediaUrl} controls autoPlay className="w-full" />
                                    </div>
                                ) : /* 3. Subtitle / Text Viewer */
                                (previewItem.mediaType === 'subtitle' || previewItem.resultUrl?.endsWith('.srt') || previewItem.resultUrl?.endsWith('.txt')) ? (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4 max-w-2xl mx-auto shadow-2xl h-[70vh]" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3">
                                            <div className="flex items-center gap-2">
                                                <FiFileText className="text-[#5b6ef7] dark:text-[#a78bfa] text-xl" />
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Xem nội dung phụ đề / kịch bản</h3>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap">
                                            {textLoading ? (
                                                <div className="flex flex-col items-center justify-center h-full gap-2">
                                                    <div className="w-8 h-8 border-4 border-[#5b6ef7]/20 border-t-[#5b6ef7] rounded-full animate-spin" />
                                                    <span className="text-xs text-gray-400">Đang tải nội dung...</span>
                                                </div>
                                            ) : (
                                                previewTextContent || 'Không có dữ liệu.'
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* 4. Default: Image Viewer */
                                    <img
                                        src={previewMediaUrl}
                                        alt="Kết quả"
                                        className="max-h-[80vh] mx-auto rounded-3xl object-contain bg-slate-950 border border-slate-850 shadow-2xl"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b6ef7] to-[#4a5ce6] text-white shadow-md shadow-[#5b6ef7]/15">
                        <FiClock className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lịch sử hoạt động</h2>
                        <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                            Các tệp kết quả sẽ tự động hết hạn và dọn dẹp sau 3 ngày lưu trữ để tối ưu hóa bộ nhớ
                        </p>
                    </div>
                </div>
                <span className="text-xs rounded-xl bg-slate-50 dark:bg-slate-950/60 dark:text-slate-400 dark:border-slate-800 border border-slate-200 px-4 py-2.5 font-bold text-slate-500 self-start md:self-auto shadow-sm">
                    {activeHistory.length} mục đã lưu
                </span> 
            </div>

            {activeHistory.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {activeHistory.map((item) => {
                        const isVideo =
                            item.mediaType === 'video' ||
                            isVideoResultUrl(item.resultUrl);
                        const isAudio =
                            item.mediaType === 'audio' ||
                            item.resultUrl?.endsWith('.wav') ||
                            item.resultUrl?.endsWith('.mp3');
                        const isSubtitle =
                            item.mediaType === 'subtitle' ||
                            item.resultUrl?.endsWith('.srt') ||
                            item.resultUrl?.endsWith('.txt');
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
                                    ) : isAudio ? (
                                        <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] shadow-sm mb-2">
                                                <FiVolume2 size={24} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tệp âm thanh XTTS</span>
                                        </div>
                                    ) : isSubtitle ? (
                                        <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm mb-2">
                                                <FiFileText size={24} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tệp phụ đề Whisper</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={mediaSrc}
                                            alt="Kết quả swap"
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-200 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewItem(item)}
                                            className="rounded-xl bg-white p-2.5 text-slate-800 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                                        >
                                            <FiEye size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(item)}
                                            className="rounded-xl bg-gradient-to-r from-[#5b6ef7] to-[#4a5ce6] p-2.5 text-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                                        >
                                            <FiDownload size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="px-1.5 pb-1 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {isVideo ? (
                                                <FiVideo className="text-slate-500 text-sm" />
                                            ) : isAudio ? (
                                                <FiVolume2 className="text-slate-500 text-sm" />
                                            ) : isSubtitle ? (
                                                <FiFileText className="text-slate-500 text-sm" />
                                            ) : (
                                                <FiImage className="text-slate-500 text-sm" />
                                            )}
                                            <span className="font-bold text-base text-slate-700 dark:text-slate-200">
                                                {isVideo ? 'Video Swap' : isAudio ? 'Giọng nói XTTS' : isSubtitle ? 'Phụ đề Whisper' : 'Ảnh Swap'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 mt-1">
                                            {dateLabel}
                                        </p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
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
                    <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">Bạn chưa có dữ liệu lịch sử nào.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Hoàn tất một lần xử lý để thấy lịch sử tại đây.
                    </p>
                </div>
            )}
        </div>
    );
}

export default SwapHistory;
