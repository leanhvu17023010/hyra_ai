import { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiTrash2, FiCpu, FiLogIn, FiVideo } from 'react-icons/fi';
import swapService from '../../services/swapService';

import SwapProcessingOverlay from './SwapProcessingOverlay';
import { useSwapTaskPolling } from '../../hooks/useSwapTaskPolling';
import videoAI from '../../assets/Images/voice.jpg';

const MAX_CHARS = 1000;



function VideoVoiceCloneLipSync() {
    // Inputs
    const [targetVideo, setTargetVideo] = useState(null);
    const [targetVideoUrl, setTargetVideoUrl] = useState(null);
    
    const [directAudioFile, setDirectAudioFile] = useState(null);
    const [directAudioFileName, setDirectAudioFileName] = useState('');
    const [directAudioUrl, setDirectAudioUrl] = useState(null);

    // Subtitle / Caption System
    const [subtitleText, setSubtitleText] = useState('');
    const [subtitleStyle] = useState('tiktok'); // 'tiktok' | 'karaoke' | 'pill'
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

    const renderSubtitles = () => {
        if (!subtitleText.trim() || duration === 0) return null;
        
        const words = subtitleText.trim().split(/\s+/);
        const totalWords = words.length;
        
        // Calculate the active word index based on playback time
        const activeWordIndex = Math.min(
            Math.floor((currentTime / duration) * totalWords),
            totalWords - 1
        );

        if (subtitleStyle === 'tiktok') {
            // Show a window of 3-4 words for dynamic reading feel
            const wordsToShow = 4;
            const start = Math.max(0, Math.min(activeWordIndex - Math.floor(wordsToShow / 2), totalWords - wordsToShow));
            const end = Math.min(totalWords, start + wordsToShow);

            return (
                <div className="absolute bottom-12 left-4 right-4 text-center pointer-events-none z-20 flex flex-wrap justify-center gap-x-3 gap-y-1 px-6">
                    {words.slice(start, end).map((word, idx) => {
                        const globalIdx = start + idx;
                        const isActive = globalIdx === activeWordIndex;
                        return (
                            <span
                                key={globalIdx}
                                className={`text-2xl md:text-3xl font-black uppercase tracking-wide transition-all duration-155 ${
                                    isActive
                                        ? 'text-yellow-400 scale-110'
                                        : 'text-white scale-100 opacity-90'
                                }`}
                                style={{
                                    textShadow: '3.5px 3.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 4px 6px rgba(0,0,0,0.6)',
                                    fontFamily: '"Impact", "Arial Black", sans-serif'
                                }}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
            );
        }

        if (subtitleStyle === 'karaoke') {
            return (
                <div className="absolute bottom-12 left-4 right-4 text-center pointer-events-none z-20 flex flex-wrap justify-center gap-x-2 gap-y-1 px-6 bg-black/30 py-2 rounded-xl backdrop-blur-[2px]">
                    {words.map((word, globalIdx) => {
                        const isSpoken = globalIdx <= activeWordIndex;
                        return (
                            <span
                                key={globalIdx}
                                className={`text-xl md:text-2xl font-extrabold transition-all duration-150 ${
                                    isSpoken ? 'text-[#00ffcc]' : 'text-white'
                                }`}
                                style={{
                                    textShadow: '2px 2px 2px #000'
                                }}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
            );
        }

        if (subtitleStyle === 'pill') {
            return (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-black/65 px-5 py-2.5 rounded-2xl text-white max-w-[85%] text-center backdrop-blur-md shadow-xl border border-white/10 flex flex-wrap justify-center gap-x-2 gap-y-1">
                    {words.map((word, globalIdx) => {
                        const isActive = globalIdx === activeWordIndex;
                        return (
                            <span
                                key={globalIdx}
                                className={`text-base md:text-lg font-bold transition-all duration-150 ${
                                    isActive ? 'text-yellow-350 scale-105 font-extrabold' : 'text-white/80'
                                }`}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
            );
        }

        return null;
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
        <div className="
    grid
    lg:grid-cols-[380px_1fr]
    gap-6
    w-full
">

            {/* ===== CỘT TRÁI: Điều khiển lồng tiếng ===== */}
            <div className="flex flex-col gap-4 w-80 shrink-0">
                
{/* 1. Chọn video gốc */}
<div className="rounded-2xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 shadow-md">
    <p className="mb-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
        1. Video gốc cần lồng tiếng & phụ đề
    </p>

    {!targetVideoUrl ? (
        <div
            onClick={() => videoInputRef.current?.click()}
            className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl bg-slate-50 dark:bg-slate-950/20 p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa] transition-colors"
        >
            <FiVideo size={22} className="text-gray-400 mb-1.5" />
            <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                Tải video lên
            </span>
            <span className="text-[10px] text-gray-450 dark:text-gray-400 mt-0.5">
                Hỗ trợ MP4, WebM (max 5s, 30MB)
            </span>

            <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        if (targetVideoUrl) {
                            URL.revokeObjectURL(targetVideoUrl);
                        }

                        setTargetVideo(file);
                        setTargetVideoUrl(URL.createObjectURL(file));
                    }
                }}
            />
        </div>
    ) : (
        <div className="p-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-550 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    {targetVideo?.name}
                </span>

                <button
                    type="button"
                    onClick={() => {
                        if (targetVideoUrl) {
                            URL.revokeObjectURL(targetVideoUrl);
                        }
                        setTargetVideo(null);
                        setTargetVideoUrl('');
                    }}
                    className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer"
                >
                    <FiTrash2 size={12} />
                </button>
            </div>

            <video
                src={targetVideoUrl}
                controls
                className="w-full rounded-lg max-h-40 object-cover animate-fade-in"
            />
        </div>
    )}
</div>

                {/* 2. Upload file giọng nói */}
                <div className="rounded-2xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 shadow-md">
                    <p className="mb-3 text-xs font-semibold text-gray-600 dark:text-gray-300">2. File giọng nói có sẵn</p>
                    <div>
                        {!directAudioFile ? (
                            <div
                                onClick={() => audioInputRef.current?.click()}
                                className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl bg-slate-50 dark:bg-slate-950/20 p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa] transition-colors"
                            >
                                <FiUploadCloud size={22} className="text-gray-400 mb-1.5" />
                                <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">Tải tệp giọng nói</span>
                                <span className="text-[10px] text-gray-450 dark:text-gray-400 mt-0.5">Hỗ trợ MP3, WAV, M4A</span>
                                <input
                                    type="file"
                                    ref={audioInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setDirectAudioFile(file);
                                            setDirectAudioFileName(file.name);
                                            setDirectAudioUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                    accept="audio/*"
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-550 rounded-xl">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                                        {directAudioFileName}
                                    </span>
                                    <button type="button" onClick={handleClearDirectAudio} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded cursor-pointer">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                                <audio src={directAudioUrl} controls className="w-full h-8 animate-fade-in" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Phụ đề text */}
                <div className="rounded-2xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">3. Văn bản muốn làm phụ đề</p>
                        <span className={`text-[10px] font-semibold ${subtitleText.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                            {subtitleText.length}/{MAX_CHARS}
                        </span>
                    </div>
                    <textarea
                        value={subtitleText}
                        onChange={(e) => e.target.value.length <= MAX_CHARS && setSubtitleText(e.target.value)}
                        placeholder="Nhập phụ đề chạy theo tiếng nói..."
                        className="w-full h-24 p-2 text-sm text-gray-700 dark:text-gray-200 bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl resize-none outline-none placeholder:text-gray-450 leading-relaxed mb-3"
                    />
                </div>

                {/* 4. Action Buttons */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-4 flex flex-col gap-3 shadow-md">
                    {error === 'login-required' ? (
                        <div className="p-3 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                            <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-semibold">Cần đăng nhập để Lip Sync</p>
                            <button
                                type="button"
                                onClick={handleOpenLogin}
                                className="w-full py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm animate-bounce"
                            >
                                <FiLogIn size={12} /> Đăng nhập ngay
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleExecute}
                            disabled={isLoading || !targetVideo || !directAudioFile}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] shadow-md shadow-[#5b6ef7]/20 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.02] transform duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <FiCpu size={15} />
                            {isLoading ? 'Đang xử lý...' : 'Bắt đầu lồng tiếng & phụ đề'}
                        </button>
                    )}

                    {resultVideoSrc && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => swapService.downloadResult(resultVideoSrc, 'lipsync-result.mp4')}
                                className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-[#5b6ef7] text-[#5b6ef7] hover:bg-[#5b6ef7]/10 dark:text-[#a78bfa] dark:border-[#a78bfa] dark:hover:bg-[#a78bfa]/10 transition-colors cursor-pointer"
                            >
                               
                               Tải xuống
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-slate-300 text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Làm mới
                            </button>
                        </div>
                    )}

                    {message && <p className={`text-xs text-center font-semibold leading-relaxed ${msgColor}`}>{message}</p>}
                    {error && error !== 'login-required' && <p className="text-xs text-center text-red-500 font-semibold">{error}</p>}
                </div>
            </div>

            {/* ===== CỘT PHẢI: Preview & Kết quả ===== */}
            <div className="flex-1 min-w-[320px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col shadow-md">
                <div className="relative flex-1 min-h-[480px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {resultVideoSrc || targetVideoUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                            <video
                                ref={resultVideoRef}
                                src={resultVideoSrc || targetVideoUrl}
                                controls
                                autoPlay={!!resultVideoSrc}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                className="max-w-full max-h-[540px] object-contain"
                            />
                            {renderSubtitles()}
                        </div>
                    ) : (
                        <>
                            <img
                                src={videoAI}
                                alt="Lip Sync demo"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isLoading ? 'opacity-45' : ''}`}
                            />
                            {isLoading ? (
                                <SwapProcessingOverlay progress={progress} label={message || "AI đang xử lý..."} />
                            ) : (
                                <span className="relative z-10 text-xs text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-md font-medium">
                                    Video kết quả sẽ hiển thị tại đây kèm phụ đề chạy đồng bộ
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoVoiceCloneLipSync;
