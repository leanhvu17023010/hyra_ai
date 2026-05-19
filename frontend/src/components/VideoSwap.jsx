import { useState, useRef } from 'react';
import videoAI from '../assets/Images/videoAI.webp';
import { FiCamera, FiVideo } from 'react-icons/fi';
import swapService from '../services/swapService';
import SwapProcessingOverlay from './SwapProcessingOverlay';
import { useSwapTaskPolling } from '../hooks/useSwapTaskPolling';

function UploadBox({ label, icon, preview, isVideo, onClick, inputRef, onChange, accept, hint }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700">
            <p className="mb-3 text-2sx py-2 font-semibold text-gray-600 dark:text-gray-300">{label}</p>
            <div
                className="mx-3 mb-3 h-40 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 dark:bg-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                onClick={onClick}
            >
                <input type="file" accept={accept} className="hidden" ref={inputRef} onChange={onChange} />
                {preview ? (
                    isVideo
                        ? <video src={preview} className="w-full h-full object-contain" muted playsInline />
                        : <img src={preview} alt={label} className="w-full h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                        {icon}
                        <span className="text-xs">Nhấn để tải lên</span>
                        <span className="text-[11px] text-gray-300">{hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function VideoSwap() {
    const [sourceImage, setSourceImage] = useState(null);
    const [targetVideo, setTargetVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [resultVideoSrc, setResultVideoSrc] = useState(null);

    const imageRef = useRef(null);
    const videoRef = useRef(null);

    const { startPolling, stopPolling } = useSwapTaskPolling({
        onProgress: (pct) => { setProgress(pct); setMessage(`AI đang xử lý... ${pct}%`); },
        onComplete: async (_taskId, task) => {
            if (!task?.resultUrl) { setMessage('Chưa có file kết quả. Vui lòng thử lại.'); setIsLoading(false); return; }
            const blobUrl = await swapService.getResultBlobUrlFromPath(task.resultUrl);
            swapService.saveCompletedTaskToHistory(_taskId, task.resultUrl, 'video');
            setResultVideoSrc(blobUrl);
            setProgress(100);
            setMessage('Xử lý thành công!');
            setIsLoading(false);
        },
        onFailed: () => { setMessage('AI xử lý thất bại. Vui lòng thử lại.'); setIsLoading(false); },
        onTimeout: () => { setMessage('Quá thời gian chờ. Vui lòng thử lại sau.'); setIsLoading(false); },
    });

    const handleSwap = async () => {
        if (!sourceImage || !targetVideo) return setMessage('Vui lòng chọn đủ ảnh và video.');
        if (!localStorage.getItem('token')) return setMessage('Vui lòng đăng nhập.');
        try {
            setIsLoading(true); setResultVideoSrc(null); setProgress(0); setMessage('Đang khởi tạo...');
            const { result: taskId } = await swapService.createSwapTask();
            if (!taskId) throw new Error();
            setMessage('Đang tải ảnh lên...');
            await swapService.uploadMediaToTask(sourceImage, taskId);
            setMessage('Đang tải video lên...');
            await swapService.uploadMediaToTask(targetVideo, taskId);
            setMessage('Đang xử lý bằng AI... 0%');
            startPolling(taskId);
        } catch (err) {
            stopPolling();
            setMessage(err.response?.data?.message || 'Có lỗi xảy ra.');
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResultVideoSrc(null); setSourceImage(null); setTargetVideo(null);
        setMessage(''); setProgress(0);
        if (imageRef.current) imageRef.current.value = '';
        if (videoRef.current) videoRef.current.value = '';
    };

    const handleDownload = () => {
        if (!resultVideoSrc) return;
        Object.assign(document.createElement('a'), { href: resultVideoSrc, download: 'swap-result.mp4' }).click();
    };

    const msgColor = message.includes('thành công') ? 'text-green-600'
        : (message.includes('thất bại') || message.includes('lỗi') || message.includes('Có lỗi')) ? 'text-red-500'
        : 'text-blue-600';

    return (
        <div className="flex gap-6 items-start w-full flex-wrap">
            {/* Cột trái */}
            <div className="flex flex-col gap-4 w-72 shrink-0">
                <UploadBox
                    label="1. Ảnh khuôn mặt muốn ghép vào"
                    icon={<FiCamera size={22} />}
                    preview={sourceImage ? URL.createObjectURL(sourceImage) : null}
                    onClick={() => imageRef.current?.click()}
                    inputRef={imageRef}
                    onChange={(e) => e.target.files?.[0] && setSourceImage(e.target.files[0])}
                    accept="image/*"
                    hint="jpg, jpeg, png, webp"
                />
                <UploadBox
                    label="2. Video gốc cần thay khuôn mặt"
                    icon={<FiVideo size={22} />}
                    preview={targetVideo ? URL.createObjectURL(targetVideo) : null}
                    isVideo
                    onClick={() => videoRef.current?.click()}
                    inputRef={videoRef}
                    onChange={(e) => e.target.files?.[0] && setTargetVideo(e.target.files[0])}
                    accept="video/*"
                    hint="Tối đa 5 giây và 30MB"
                />

                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
                    <button
                        onClick={handleSwap}
                        disabled={isLoading || !sourceImage || !targetVideo}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Bắt đầu Swap'}
                    </button>

                    {resultVideoSrc && (
                        <div className="flex gap-2">
                            <button onClick={handleDownload} className="flex-1 py-2 rounded-lg text-xs font-medium border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors">⬇ Tải xuống</button>
                            <button onClick={handleReset} className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">🔄 Làm mới</button>
                        </div>
                    )}

                    {message && <p className={`text-xs text-center ${msgColor}`}>{message}</p>}
                </div>
            </div>

            {/* Cột phải – kết quả */}
            <div className="flex-1 min-w-0 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 overflow-hidden flex flex-col">

                <div className="relative flex-1 min-h-[480px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {resultVideoSrc ? (
                        <video src={resultVideoSrc} controls autoPlay className="max-w-full max-h-[540px] object-contain" />
                    ) : (
                        <>
                            <img src={videoAI} alt="Video mẫu" className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isLoading ? 'opacity-40' : ''}`} />
                            {isLoading
                                ? <SwapProcessingOverlay progress={progress} label="AI đang xử lý video..." />
                                : <span className="relative z-10 text-xs text-white bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Kết quả video sẽ hiện ở đây sau khi swap</span>
                            }
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoSwap;
