import { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiCpu, FiLogIn, FiVideo } from 'react-icons/fi';
import swapService from '../../services/swapService';

import SwapProcessingOverlay from './SwapProcessingOverlay';
import { useSwapTaskPolling } from '../../hooks/useSwapTaskPolling';
import videoAI from '../../assets/Images/voice.jpg';

const MAX_CHARS = 1000;

function UploadBox({ label, icon, preview, isVideo, isAudio, audioName, onClick, inputRef, onChange, accept, hint }) {
    return (
        <div className="rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-lg flex flex-col flex-1">
            <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
            <div
                className="flex-1 min-h-[180px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa] hover:bg-slate-100/50 dark:hover:bg-slate-950/60 transition-all duration-300 overflow-hidden"
                onClick={onClick}
            >
                <input type="file" accept={accept} className="hidden" ref={inputRef} onChange={onChange} />
                {preview ? (
                    isVideo ? (
                        <video src={preview} className="w-full h-full object-contain animate-fade-in" muted playsInline />
                    ) : isAudio ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-4 w-full h-full text-slate-700 dark:text-slate-200" onClick={(e) => e.stopPropagation()}>
                            <div className="w-12 h-12 rounded-full bg-[#5b6ef7]/5 dark:bg-[#a78bfa]/5 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-1">
                                {icon}
                            </div>
                            <span className="text-xs font-semibold truncate max-w-[200px]">{audioName}</span>
                            <audio src={preview} controls className="w-full max-w-[240px] h-8" />
                        </div>
                    ) : (
                        <img src={preview} alt={label} className="w-full h-full object-contain animate-fade-in" />
                    )
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

function VideoVoiceCloneLipSync() {
    // Inputs
    const [targetVideo, setTargetVideo] = useState(null);
    const [targetVideoUrl, setTargetVideoUrl] = useState(null);
    
    const [directAudioFile, setDirectAudioFile] = useState(null);
    const [directAudioFileName, setDirectAudioFileName] = useState('');
    const [directAudioUrl, setDirectAudioUrl] = useState(null);

    // Subtitle / Caption System
    const [subtitleText, setSubtitleText] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Processing UI States
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resultVideoSrc, setResultVideoSrc] = useState(null);

    // Refs
    const videoInputRef = useRef(null);
    const audioInputRef = useRef(null);
    const resultVideoRef = useRef(null);

    // Clean up temporary object URLs on unmount/reset
    const revokeUrls = () => {
        if (targetVideoUrl) URL.revokeObjectURL(targetVideoUrl);
        if (directAudioUrl) URL.revokeObjectURL(directAudioUrl);
    };

    // Auto cleanup of urls on unmount
    useEffect(() => {
        return () => {
            revokeUrls();
        };
    }, [targetVideoUrl, directAudioUrl]);

    const handleTimeUpdate = () => {
        if (resultVideoRef.current) {
            setCurrentTime(resultVideoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (resultVideoRef.current) {
            setDuration(resultVideoRef.current.duration || 5);
        }
    };


    const handleClearDirectAudio = () => {
        setDirectAudioFile(null);
        setDirectAudioFileName('');
        if (directAudioUrl) URL.revokeObjectURL(directAudioUrl);
        setDirectAudioUrl(null);
        if (audioInputRef.current) audioInputRef.current.value = '';
    };

    // Poll SwapTask
    const { startPolling, stopPolling } = useSwapTaskPolling({
        onProgress: (pct) => {
            setProgress(pct);
            setMessage(`Đang lồng tiếng & khớp chuyển động môi... ${pct}%`);
        },
        onComplete: async (_taskId, task) => {
            if (!task?.resultUrl) {
                setMessage('Không tìm thấy tệp kết quả sau khi hoàn tất.');
                setIsLoading(false);
                return;
            }
            try {
                const blobUrl = await swapService.getResultBlobUrlFromPath(task.resultUrl);
                swapService.saveCompletedTaskToHistory(_taskId, task.resultUrl, 'video');
                setResultVideoSrc(blobUrl);
                setProgress(100);
                setMessage('Hoàn thành lồng tiếng & đồng bộ khẩu hình môi!');
                setIsLoading(false);
            } catch (err) {
                setMessage('Tải tệp kết quả thất bại.');
                setIsLoading(false);
            }
        },
        onFailed: () => {
            setMessage('Đồng bộ chuyển động môi thất bại. Vui lòng kiểm tra lại tệp video/audio.');
            setIsLoading(false);
        },
        onTimeout: () => {
            setMessage('Quá thời gian xử lý. Tác vụ vẫn đang tiếp tục trên server.');
            setIsLoading(false);
        }
    });

    // Execute Handler
    const handleExecute = async () => {
        if (!targetVideo) {
            return setError('Vui lòng chọn video cần lồng tiếng.');
        }
        if (!directAudioFile) {
            return setError('Vui lòng cung cấp file giọng nói.');
        }
        if (!localStorage.getItem('token')) {
            return setError('login-required');
        }

        setError('');
        setIsLoading(true);
        setProgress(0);
        setResultVideoSrc(null);

        try {
            // Khởi tạo SwapTask
            setMessage('1/3 Đang khởi tạo tác vụ...');
            const { result: swapTaskId } = await swapService.createSwapTask();

            // Tải video gốc lên làm target
            setMessage('2/3 Đang tải video gốc lên...');
            await swapService.uploadMediaToTask(targetVideo, swapTaskId, 'target');

            // Tải file audio lên làm source audio
            setMessage('3/3 Đang tải tệp giọng nói lên...');
            await swapService.uploadMediaToTask(directAudioFile, swapTaskId, 'audio');

            // Bắt đầu polling kết quả video
            setMessage('Đang xử lý lồng tiếng và khớp khẩu hình khuôn mặt... 0%');
            startPolling(swapTaskId);

        } catch (err) {
            stopPolling();
            setIsLoading(false);
            setError(err?.response?.data?.message || err?.message || 'Đã xảy ra lỗi trong quá trình xử lý AI.');
        }
    };

    const handleReset = () => {
        stopPolling();
        revokeUrls();
        setTargetVideo(null);
        setTargetVideoUrl(null);
        setSubtitleText('');
        handleClearDirectAudio();
        setIsLoading(false);
        setProgress(0);
        setMessage('');
        setError('');
        setResultVideoSrc(null);
    };

    const handleOpenLogin = () => {
        window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' }));
    };

    const msgColor = message.includes('Hoàn thành') ? 'text-green-600 dark:text-green-400'
        : (message.includes('thất bại') || message.includes('lỗi') || error) ? 'text-red-500'
        : 'text-[#5b6ef7] dark:text-[#a78bfa]';

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
            {/* Cột trái: Nhập liệu (Workspace) */}
            <div className="flex-1 flex flex-col gap-6">
                {/* 2 Upload Boxes bên cạnh nhau */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <UploadBox
                        label="1. Video gốc cần lồng tiếng & phụ đề"
                        icon={<FiVideo size={22} />}
                        preview={targetVideoUrl}
                        isVideo
                        onClick={() => videoInputRef.current?.click()}
                        inputRef={videoInputRef}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                const file = e.target.files[0];
                                if (targetVideoUrl) URL.revokeObjectURL(targetVideoUrl);
                                setTargetVideo(file);
                                setTargetVideoUrl(URL.createObjectURL(file));
                            }
                        }}
                        accept="video/*"
                        hint="Hỗ trợ MP4, WebM (max 5s, 30MB)"
                    />
                    <UploadBox
                        label="2. File giọng nói có sẵn"
                        icon={<FiUploadCloud size={22} />}
                        preview={directAudioUrl}
                        isAudio
                        audioName={directAudioFileName}
                        onClick={() => audioInputRef.current?.click()}
                        inputRef={audioInputRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setDirectAudioFile(file);
                                setDirectAudioFileName(file.name);
                                setDirectAudioUrl(URL.createObjectURL(file));
                            }
                        }}
                        accept="audio/*"
                        hint="Hỗ trợ MP3, WAV, M4A"
                    />
                </div>

                {/* Panel điều khiển */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">3. Văn bản muốn làm phụ đề</h3>
                            <span className={`text-[10px] font-semibold ${subtitleText.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                                {subtitleText.length}/{MAX_CHARS}
                            </span>
                        </div>
                        <textarea
                            value={subtitleText}
                            onChange={(e) => e.target.value.length <= MAX_CHARS && setSubtitleText(e.target.value)}
                            placeholder="Nhập phụ đề chạy theo tiếng nói..."
                            className="w-full h-24 p-3 text-xs text-slate-700 dark:text-slate-250 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-750 rounded-xl resize-none outline-none focus:border-[#5b6ef7] dark:focus:border-[#a78bfa] transition-colors placeholder:text-slate-450 leading-relaxed"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                        <div className="text-left flex-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">Cấu hình Lip Sync & Lồng tiếng</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">AI tự động lồng tiếng, đồng bộ chuyển động khuôn môi của nhân vật và chạy phụ đề đồng bộ.</p>
                        </div>
                        {error === 'login-required' ? (
                            <button
                                type="button"
                                onClick={handleOpenLogin}
                                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-red-500 to-red-650 hover:from-red-650 hover:to-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.03] animate-bounce shadow-md"
                            >
                                <FiLogIn size={15} /> Đăng nhập ngay
                            </button>
                        ) : (
                            <button
                                onClick={handleExecute}
                                disabled={isLoading || !targetVideo || !directAudioFile}
                                className="w-full md:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] shadow-lg shadow-[#5b6ef7]/20 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.03] transform duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                
                                {isLoading ? 'Đang xử lý...' : 'Bắt đầu Lip Sync'}
                            </button>
                        )}
                    </div>

                    {message && <p className={`text-xs text-center font-medium ${msgColor}`}>{message}</p>}
                    {error && error !== 'login-required' && <p className="text-xs text-center text-red-500 font-semibold">{error}</p>}
                </div>
            </div>

            {/* Cột phải: Preview & Kết quả */}
            <div className="w-full lg:w-[400px] w-500 xl:w-[700px] shrink-0 flex flex-col gap-6">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col shadow-xl rounded-3xl min-h-[480px]">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Kết quả Lip Sync</span>
                        {resultVideoSrc && (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Hoàn thành</span>
                        )}
                    </div>

                    <div className="relative flex-1 min-h-[380px] bg-slate-50 dark:bg-slate-950/30 flex items-center justify-center overflow-hidden">
                        {resultVideoSrc || targetVideoUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <video
                                    ref={resultVideoRef}
                                    src={resultVideoSrc || targetVideoUrl}
                                    controls
                                    autoPlay={!!resultVideoSrc}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    className="max-w-full max-h-[500px] object-contain animate-fade-in"
                                />
                                {renderSubtitles()}
                            </div>
                        ) : (
                            <>
                                <img
                                    src={videoAI}
                                    alt="Lip Sync demo"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-65'}`}
                                />
                                {isLoading ? (
                                    <SwapProcessingOverlay progress={progress} label={message || "AI đang xử lý..."} />
                                ) : (
                                    <span className="relative z-10 text-xs text-slate-750 dark:text-white bg-white/70 dark:bg-slate-900/60 px-4 py-2.5 rounded-full backdrop-blur-md font-medium border border-slate-200 dark:border-white/10 text-center max-w-[80%]">
                                        Video kết quả sẽ hiển thị tại đây kèm phụ đề chạy đồng bộ
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {resultVideoSrc && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex gap-3">
                            <button
                                onClick={() => swapService.downloadResult(resultVideoSrc, 'lipsync-result.mp4')}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[#5b6ef7] text-[#5b6ef7] hover:bg-[#5b6ef7]/10 dark:text-[#a78bfa] dark:border-[#a78bfa] dark:hover:bg-[#a78bfa]/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                Tải xuống
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                Làm mới
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoVoiceCloneLipSync;
