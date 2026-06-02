import { useRef, useState } from 'react';
import ImageAI from '../../assets/Images/ImageAI.jpg';
import { FiCamera } from 'react-icons/fi';
import swapService from '../../services/swapService';
import SwapProcessingOverlay from './SwapProcessingOverlay';
import { useSwapTaskPolling } from '../../hooks/useSwapTaskPolling';

function UploadBox({ label, icon, preview, onClick, inputRef, onChange, accept, hint }) {
    return (
        <div className="rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-lg flex flex-col flex-1">
            <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
            <div
                className="flex-1 min-h-[180px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa] hover:bg-slate-100/50 dark:hover:bg-slate-950/60 transition-all duration-300 overflow-hidden"
                onClick={onClick}
            >
                <input type="file" accept={accept} className="hidden" ref={inputRef} onChange={onChange} />
                {preview ? (
                    <img src={preview} alt={label} className="w-full h-full object-contain animate-fade-in" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
                        <div className="w-12 h-12 rounded-full bg-[#5b6ef7]/5 dark:bg-[#a78bfa]/5 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-1">
                            {icon}
                        </div>
                        <span className="text-xs font-semibold text-slate-650 dark:text-slate-300">Nhấn để tải lên</span>
                        <span className="text-[10px] text-slate-400">{hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ImageSwap() {
    const [sourceImage, setSourceImage] = useState(null);
    const [targetImage, setTargetImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [resultImageSrc, setResultImageSrc] = useState(null);

    const sourceRef = useRef(null);
    const targetRef = useRef(null);

    const { startPolling, stopPolling } = useSwapTaskPolling({
        onProgress: (pct) => { setProgress(pct); setMessage(`AI đang xử lý... ${pct}%`); },
        onComplete: async (_taskId, task) => {
            if (!task?.resultUrl) { setMessage('Chưa có file kết quả. Vui lòng thử lại.'); setIsLoading(false); return; }
            const blobUrl = await swapService.getResultBlobUrlFromPath(task.resultUrl);
            swapService.saveCompletedTaskToHistory(_taskId, task.resultUrl, 'image');
            setResultImageSrc(blobUrl);
            setProgress(100);
            setMessage('Xử lý thành công!');
            setIsLoading(false);
        },
        onFailed: () => { setMessage('AI xử lý thất bại. Vui lòng thử lại.'); setIsLoading(false); },
        onTimeout: () => { setMessage('Quá thời gian chờ. Vui lòng thử lại sau.'); setIsLoading(false); },
    });

    const handleSwap = async () => {
        if (!sourceImage || !targetImage) return setMessage('Vui lòng chọn đủ 2 ảnh.');
        if (!localStorage.getItem('token')) return setMessage('Vui lòng đăng nhập.');
        try {
            setIsLoading(true); setResultImageSrc(null); setProgress(0); setMessage('Đang khởi tạo...');
            const { result: taskId } = await swapService.createSwapTask();
            if (!taskId) throw new Error();
            setMessage('Đang tải ảnh lên...');
            await swapService.uploadMediaToTask(sourceImage, taskId, 'target');
            await swapService.uploadMediaToTask(targetImage, taskId, 'source');
            setMessage('Đang xử lý bằng AI... 0%');
            startPolling(taskId);
        } catch (err) {
            stopPolling();
            setMessage(err.response?.data?.message || 'Có lỗi xảy ra.');
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResultImageSrc(null); setSourceImage(null); setTargetImage(null);
        setMessage(''); setProgress(0);
        if (sourceRef.current) sourceRef.current.value = '';
        if (targetRef.current) targetRef.current.value = '';
    };

    const handleDownload = () => {
        if (!resultImageSrc) return;
        Object.assign(document.createElement('a'), { href: resultImageSrc, download: 'swap-result.jpg' }).click();
    };

    const msgColor = message.includes('thành công') ? 'text-green-600'
        : (message.includes('thất bại') || message.includes('lỗi') || message.includes('Có lỗi')) ? 'text-red-500'
        : 'text-[#5b6ef7] dark:text-[#a78bfa]';

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
            {/* Cột trái: Nhập liệu (Workspace) */}
            <div className="flex-1 flex flex-col gap-6">
                {/* 2 Upload Boxes bên cạnh nhau */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <UploadBox
                        label="1. Ảnh gốc cần thay khuôn mặt"
                        icon={<FiCamera size={22} />}
                        preview={sourceImage ? URL.createObjectURL(sourceImage) : null}
                        onClick={() => sourceRef.current?.click()}
                        inputRef={sourceRef}
                        onChange={(e) => e.target.files?.[0] && setSourceImage(e.target.files[0])}
                        accept="image/*"
                        hint="jpg, jpeg, png, webp"
                    />
                    <UploadBox
                        label="2. Ảnh khuôn mặt ghép vào"
                        icon={<FiCamera size={22} />}
                        preview={targetImage ? URL.createObjectURL(targetImage) : null}
                        onClick={() => targetRef.current?.click()}
                        inputRef={targetRef}
                        onChange={(e) => e.target.files?.[0] && setTargetImage(e.target.files[0])}
                        accept="image/*"
                        hint="jpg, jpeg, png, webp"
                    />
                </div>

                {/* Panel điều khiển */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-left flex-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">Cấu hình Swap</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">AI tự động nhận dạng, căn chỉnh và thay đổi khuôn mặt chất lượng cao.</p>
                        </div>
                        <button
                            onClick={handleSwap}
                            disabled={isLoading || !sourceImage || !targetImage}
                            className="w-full md:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] shadow-lg shadow-[#5b6ef7]/20 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.03] transform duration-200 cursor-pointer"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Bắt đầu Swap'}
                        </button>
                    </div>

                    {message && <p className={`text-xs text-center font-medium ${msgColor}`}>{message}</p>}
                </div>
            </div>

            {/* Cột phải: Kết quả */}
            <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col gap-6">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col shadow-xl rounded-3xl min-h-[480px]">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Kết quả Swap</span>
                        {resultImageSrc && (
                            <span className="text-xs font-semibold text-green-650 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Hoàn thành</span>
                        )}
                    </div>
                    
                    <div className="relative flex-1 min-h-[380px] bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center overflow-hidden">
                        {resultImageSrc ? (
                            <img src={resultImageSrc} alt="Kết quả" className="max-w-full max-h-[500px] object-contain animate-fade-in" />
                        ) : (
                            <>
                                <img src={ImageAI} alt="Ảnh mẫu" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-60'}`} />
                                {isLoading
                                    ? <SwapProcessingOverlay progress={progress} label="AI đang xử lý ảnh..." />
                                    : <span className="relative z-10 text-xs text-white bg-slate-900/60 px-4 py-2.5 rounded-full backdrop-blur-md font-medium border border-white/10">Kết quả sẽ hiện ở đây sau khi swap</span>
                                }
                            </>
                        )}
                    </div>

                    {resultImageSrc && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex gap-3">
                            <button onClick={handleDownload} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[#5b6ef7] text-[#5b6ef7] hover:bg-[#5b6ef7]/10 dark:text-[#a78bfa] dark:border-[#a78bfa] dark:hover:bg-[#a78bfa]/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                                Tải xuống
                            </button>
                            <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                                Làm mới
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ImageSwap;
