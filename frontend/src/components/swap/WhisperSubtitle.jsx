import { useState, useRef, useEffect, useCallback } from 'react';
import { FiLogIn, FiVolume2, FiCopy, FiFileText, FiDownload, FiCheck } from 'react-icons/fi';
import whisperService from '../../services/whisperService';
import api from '../../services/api';
import swapService from '../../services/swapService';

import SwapProcessingOverlay from './SwapProcessingOverlay';
import { useWhisperTaskPolling } from '../../hooks/useWhisperTaskPolling';

function UploadBox({ label, icon, preview, audioName, onClick, inputRef, onChange, accept, hint }) {
    return (
        <div className="rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-lg flex flex-col flex-1">
            <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
            <div
                className="flex-1 min-h-[220px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa] hover:bg-slate-100/50 dark:hover:bg-slate-950/60 transition-all duration-300 overflow-hidden"
                onClick={onClick}
            >
                <input type="file" accept={accept} className="hidden" ref={inputRef} onChange={onChange} />
                {preview ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-4 w-full h-full text-slate-700 dark:text-slate-200" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-[#5b6ef7]/5 dark:bg-[#a78bfa]/5 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-1">
                            {icon}
                        </div>
                        <span className="text-xs font-semibold truncate max-w-[240px]">{audioName}</span>
                        <audio src={preview} controls className="w-full max-w-[280px] h-8" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
                        <div className="w-12 h-12 rounded-full bg-[#5b6ef7]/5 dark:bg-[#a78bfa]/5 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-1">
                            {icon}
                        </div>
                        <span className="text-xs font-semibold text-slate-650 dark:text-slate-300">Nhấn để tải lên file âm thanh</span>
                        <span className="text-[10px] text-slate-400">{hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function WhisperSubtitle() {
    const [audioFile, setAudioFile] = useState(null);
    const [audioFileName, setAudioFileName] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);

    // States xử lý
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resultText, setResultText] = useState('');
    const [copied, setCopied] = useState(false);

    // Lưu các đường dẫn kết quả
    const [downloadUrls, setDownloadUrls] = useState({
        txtUrl: '',
        srtUrl: ''
    });



    const audioInputRef = useRef(null);

    // Dọn dẹp URL tạm thời
    const revokeUrls = useCallback(() => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
    }, [audioUrl]);

    useEffect(() => {
        return () => revokeUrls();
    }, [revokeUrls]);



    // Copy kịch bản
    const handleCopy = () => {
        if (!resultText) return;
        navigator.clipboard.writeText(resultText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Polling WhisperTask
    const { startPolling, stopPolling } = useWhisperTaskPolling({
        onProgress: (pct) => {
            setProgress(pct);
            setMessage(`Đang phân tích giọng nói và tạo phụ đề... ${pct}%`);
        },
        onComplete: async (_taskId, task) => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || '';
                setDownloadUrls({
                    txtUrl: task.resultTxtUrl ? `${apiBase}${task.resultTxtUrl}` : '',
                    srtUrl: task.resultSrtUrl ? `${apiBase}${task.resultSrtUrl}` : ''
                });

                // Đọc văn bản đã chuyển dịch để hiển thị lên màn hình
                if (task.resultTxtUrl) {
                    const textRes = await api.get(task.resultTxtUrl, { responseType: 'text' });
                    setResultText(textRes.data);
                }

                setProgress(100);
                setMessage('Hoàn thành trích xuất phụ đề!');
                setIsLoading(false);

            } catch {
                setMessage('Hoàn tất nhưng không thể đọc file kết quả.');
                setIsLoading(false);
            }
        },
        onFailed: () => {
            setMessage('Quá trình tạo phụ đề WhisperX thất bại.');
            setIsLoading(false);
        },
        onTimeout: () => {
            setMessage('Quá thời gian chờ. Tác vụ vẫn đang tiếp tục trên server.');
            setIsLoading(false);
        }
    });

    // Thực thi
    const handleExecute = async () => {
        if (!audioFile) {
            return setError('Vui lòng chọn file âm thanh cần chuyển phụ đề.');
        }
        if (!localStorage.getItem('token')) {
            return setError('login-required');
        }

        setError('');
        setIsLoading(true);
        setProgress(0);
        setResultText('');
        setDownloadUrls({ txtUrl: '', srtUrl: '' });

        try {
            setMessage('1/3 Đang khởi tạo phiên xử lý...');
            const createRes = await whisperService.createTask();
            const taskId = createRes.result;

            setMessage('2/3 Đang tải tệp âm thanh lên...');
            await whisperService.uploadAudio(audioFile, taskId);

            setMessage('3/3 Đang khởi chạy WhisperX...');
            await whisperService.processTask(taskId);

            setMessage('Đang phân tích âm thanh... 0%');
            startPolling(taskId);

        } catch (err) {
            stopPolling();
            setIsLoading(false);
            setError(err?.response?.data?.message || err?.message || 'Đã xảy ra lỗi khi tạo phụ đề.');
        }
    };



    const handleReset = () => {
        stopPolling();
        revokeUrls();
        setAudioFile(null);
        setAudioFileName('');
        setAudioUrl(null);
        setIsLoading(false);
        setProgress(0);
        setMessage('');
        setError('');
        setResultText('');
        setDownloadUrls({ txtUrl: '', srtUrl: '' });
        if (audioInputRef.current) audioInputRef.current.value = '';
    };

    const handleOpenLogin = () => {
        window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' }));
    };

    const msgColor = message.includes('Hoàn thành') ? 'text-green-600 dark:text-green-400'
        : (message.includes('thất bại') || message.includes('lỗi') || error) ? 'text-red-500'
        : 'text-[#5b6ef7] dark:text-[#a78bfa]';

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
                {/* Cột trái: Tải file & Xử lý */}
                <div className="flex-1 flex flex-col gap-6">
                    <UploadBox
                        label="1. File âm thanh đầu vào"
                        icon={<FiVolume2 size={24} />}
                        preview={audioUrl}
                        audioName={audioFileName}
                        onClick={() => audioInputRef.current?.click()}
                        inputRef={audioInputRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                if (audioUrl) URL.revokeObjectURL(audioUrl);
                                setAudioFile(file);
                                setAudioFileName(file.name);
                                setAudioUrl(URL.createObjectURL(file));
                            }
                        }}
                        accept="audio/*"
                        hint="Hỗ trợ MP3, WAV, M4A, OGG"
                    />

                    {/* Điều khiển */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-left flex-1">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">Tạo phụ đề tự động</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    WhisperX tự động phân tách âm thanh thành văn bản và tạo tệp phụ đề có mốc thời gian khớp chính xác.
                                </p>
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
                                    disabled={isLoading || !audioFile}
                                    className="w-full md:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] shadow-lg shadow-[#5b6ef7]/20 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.03] transform duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Tạo phụ đề'}
                                </button>
                            )}
                        </div>

                        {message && <p className={`text-xs text-center font-medium ${msgColor}`}>{message}</p>}
                        {error && error !== 'login-required' && <p className="text-xs text-center text-red-500 font-semibold">{error}</p>}
                    </div>
                </div>

                {/* Cột phải: Kết quả */}
                <div className="w-full lg:w-[400px] w-500 xl:w-[700px] shrink-0 flex flex-col gap-6">
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col shadow-xl rounded-3xl min-h-[380px]">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Kết quả trích xuất văn bản</span>
                            {resultText && (
                                <button
                                    onClick={handleCopy}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
                                >
                                    {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                                    {copied ? 'Đã sao chép' : 'Sao chép'}
                                </button>
                            )}
                        </div>

                        <div className="relative flex-1 p-5 bg-slate-50 dark:bg-slate-950/30 min-h-[220px] flex flex-col">
                            {resultText ? (
                                <textarea
                                    readOnly
                                    value={resultText}
                                    className="w-full flex-1 p-3 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl resize-none outline-none leading-relaxed font-mono"
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-center p-4">
                                    {isLoading ? (
                                        <SwapProcessingOverlay progress={progress} label={message || "AI đang dịch giọng nói..."} />
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium max-w-[80%]">
                                            Văn bản đã trích xuất sẽ hiển thị ở đây. Bạn có thể sao chép hoặc tải về file phụ đề SRT.
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {resultText && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => swapService.downloadResult(downloadUrls.srtUrl, 'subtitles.srt')}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[#5b6ef7] text-[#5b6ef7] hover:bg-[#5b6ef7]/10 dark:text-[#a78bfa] dark:border-[#a78bfa] dark:hover:bg-[#a78bfa]/10 transition-colors text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <FiDownload /> Tải File SRT
                                </button>
                                <button
                                    type="button"
                                    onClick={() => swapService.downloadResult(downloadUrls.txtUrl, 'script.txt')}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-350 text-slate-650 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <FiFileText /> Tải File TXT
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-500 hover:bg-slate-100 dark:text-slate-450 dark:border-slate-750 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Làm mới
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}

export default WhisperSubtitle;
