import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiSquare, FiRefreshCw, FiVolume2, FiMic, FiUploadCloud, FiTrash2, FiCpu, FiLogIn } from 'react-icons/fi';
import xttsService from '../../services/xttsService';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import swapService from '../../services/swapService';

const MAX_CHARS = 1000;

function TextToSpeech() {
    const [text, setText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState('');
    const [swapDone, setSwapDone] = useState(false); // đánh dấu swap đã hoàn tất
    
    // Voice Swap / Voice Clone States
    const [sourceType, setSourceType] = useState('upload'); // 'upload' | 'record'
    const [audioFile, setAudioFile] = useState(null);
    const [audioFileName, setAudioFileName] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [resultAudioUrl, setResultAudioUrl] = useState('');
    
    // AI Processing States
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioPlayerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // File Upload Handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                return setError('Chỉ chấp nhận tệp tin âm thanh (audio/*).');
            }
            setAudioFile(file);
            setAudioFileName(file.name);
            setRecordedUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleClearAudio = () => {
        setAudioFile(null);
        setAudioFileName('');
        setRecordedUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Recording Handlers
    const startRecording = async () => {
        try {
            setError('');
            handleClearAudio();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const file = new File([audioBlob], 'recorded_voice.wav', { type: 'audio/wav' });
                setAudioFile(file);
                setAudioFileName('Giọng ghi âm của tôi.wav');
                setRecordedUrl(URL.createObjectURL(audioBlob));
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch {
            setError('Không thể truy cập microphone. Vui lòng cấp quyền thiết bị.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Trigger Auth Modal
    const handleOpenLogin = () => {
        window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' }));
    };

    // Core execution handler
    const handleExecute = async () => {
        // Kiểm tra điều kiện: phải có text
        if (!text.trim()) return setError('Vui lòng nhập nội dung văn bản.');
        // Kiểm tra điều kiện: phải có file âm thanh mẫu
        if (!audioFile) return setError('Vui lòng cung cấp giọng đọc mẫu (tải file hoặc ghi âm) trước khi swap.');
        // Kiểm tra điều kiện: phải đăng nhập
        if (!localStorage.getItem('token')) return setError('login-required');

        setError('');

        try {
            setIsLoading(true);
<<<<<<< HEAD
=======
            setProgress(2);
>>>>>>> feature/upload-be
            setMessage('Đang khởi tạo tác vụ hoán đổi giọng nói...');

            // tạo task XTTS mới và upload file âm thanh mẫu
            const createRes = await xttsService.createTtsTask();
            const taskId = createRes.result;
            if (!taskId) throw new Error('Không khởi tạo được task XTTS');

<<<<<<< HEAD
            setMessage('Đang tải tệp âm thanh mẫu lên hệ thống...');
            await xttsService.uploadVoiceToTtsTask(audioFile, taskId);

            setMessage('Bắt đầu xử lý nhân bản giọng nói AI...');
            await xttsService.processTtsTask(taskId, text, 'vi');

=======
            setProgress(5);
            setMessage('Đang tải tệp âm thanh mẫu lên hệ thống...');
            await xttsService.uploadVoiceToTtsTask(audioFile, taskId);

            setProgress(10);
            setMessage('Bắt đầu xử lý nhân bản giọng nói AI...');
            await xttsService.processTtsTask(taskId, text, 'vi');

            setProgress(15);
>>>>>>> feature/upload-be
            setMessage('Hệ thống AI đang tạo file âm thanh của bạn...');
            
            let pollAttempts = 0;
            const maxPollAttempts = 120; // 3 phút tối đa
            
            const pollInterval = setInterval(async () => {
                pollAttempts++;
                if (pollAttempts > maxPollAttempts) {
                    clearInterval(pollInterval);
                    setIsLoading(false);
                    setError('Quá thời gian xử lý tác vụ (timeout). Vui lòng thử lại.');
                    return;
                }

                try {
                    const statusRes = await xttsService.getTtsTaskStatus(taskId);
                    const taskData = statusRes.result;

                    // Cập nhật thanh tiến trình nếu có
                    if (taskData.progress !== undefined && taskData.progress > 0) {
                        setProgress(taskData.progress);
                    }

                    if (taskData.status === 'Complete') {
                        clearInterval(pollInterval);
                        setMessage('Hoàn tất hoán đổi giọng đọc AI!');
                        
                        // Lưu lịch sử
                        swapService.saveCompletedTaskToHistory(taskId, taskData.resultUrl, 'audio');

                        setTimeout(() => {
                            setIsLoading(false);
                            setSwapDone(true);
                            setResultAudioUrl(taskData.resultUrl);
                            
                            // Phát âm thanh tự động
                            setTimeout(() => {
                                if (audioPlayerRef.current) {
                                    audioPlayerRef.current.play().catch(e => console.log('Auto-play error:', e));
                                    setIsPlaying(true);
                                }
                            }, 200);
                        }, 500);
                    } else if (taskData.status === 'Failed') {
                        clearInterval(pollInterval);
                        setIsLoading(false);
                        setError('Tác vụ nhân bản giọng nói thất bại trên máy chủ AI.');
                    } else {
                        // Vẫn đang xử lý (Pending / Processing)
<<<<<<< HEAD
                        setMessage('Đang sinh âm thanh... Vui lòng đợi');
=======
                        let currentProgress = taskData.progress || 0;
                        setMessage(`Đang sinh âm thanh... ${currentProgress}%`);
>>>>>>> feature/upload-be
                    }
                } catch (pollErr) {
                    console.error('Lỗi khi kiểm tra trạng thái XTTS:', pollErr);
                }
            }, 1500);

        } catch (err) {
            console.error('Lỗi quy trình XTTS:', err);
            setIsLoading(false);
            setError(err.response?.data?.message || 'Xử lý tác vụ XTTS thất bại. Vui lòng thử lại.');
        }
    };



    const handleReset = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
        }
        setText('');
        setError('');
        setIsPlaying(false);
        setSwapDone(false);
        setResultAudioUrl('');
        handleClearAudio();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">

            {/* ===== CỘT TRÁI: Nhập liệu (Văn bản & Giọng mẫu) ===== */}
            <div className="flex-1 flex flex-col gap-6">
                
                {/* 1. Nhập văn bản */}
                <div className="rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col shadow-xl">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">1. Nhập văn bản</p>
                        <span className={`text-xs font-semibold ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                            {text.length}/{MAX_CHARS}
                        </span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => e.target.value.length <= MAX_CHARS && setText(e.target.value)}
                        placeholder="Nhập nội dung văn bản bạn muốn chuyển đổi tại đây..."
                        disabled={isLoading}
                        className="w-full min-h-[160px] p-5 text-sm text-slate-750 dark:text-slate-200 bg-transparent resize-none outline-none placeholder:text-slate-400 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* 2. Chọn giọng mẫu (Tải file hoặc Ghi âm) */}
                <div className="rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xl">
                    <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <FiMic className="text-[#5b6ef7] dark:text-[#a78bfa]" size={16} />
                        2. Giọng đọc mẫu
                    </p>
                    
                    {/* Tabs switch */}
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-4 border border-slate-205 dark:border-slate-800">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => { setSourceType('upload'); handleClearAudio(); }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                sourceType === 'upload'
                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-[#5b6ef7] dark:text-[#a78bfa]'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
                            }`}
                        >
                            Tải file giọng mẫu
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => { setSourceType('record'); handleClearAudio(); }}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                sourceType === 'record'
                                    ? 'bg-white dark:bg-slate-800 shadow-sm text-[#5b6ef7] dark:text-[#a78bfa]'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-750'
                            }`}
                        >
                            Tự ghi âm giọng
                        </button>
                    </div>

                    {/* Content Upload */}
                    {sourceType === 'upload' ? (
                        <div>
                            {!audioFile ? (
                                <div
                                    onClick={() => !isLoading && fileInputRef.current?.click()}
                                    className={`border-2 border-dashed border-slate-300 dark:border-slate-750 rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-6 flex flex-col items-center justify-center transition-colors min-h-[160px] ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa]'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#5b6ef7]/5 dark:bg-[#a78bfa]/5 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-2">
                                        <FiUploadCloud size={20} />
                                    </div>
                                    <span className="text-xs text-slate-650 dark:text-slate-300 text-center font-bold">Tải tệp âm thanh</span>
                                    <span className="text-[10px] text-slate-400 text-center mt-1">Hỗ trợ mp3, wav, m4a</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="audio/*"
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-650 dark:text-slate-300 truncate max-w-[280px]">
                                            {audioFileName}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={handleClearAudio}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                    <audio src={recordedUrl} controls className="w-full h-9 rounded-lg" />
                                </div>
                            )}
                        </div>
                    ) : (
                        // Content Recording
                        <div className="flex flex-col items-center">
                            {!audioFile && !isRecording ? (
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={startRecording}
                                    className={`w-full border-2 border-dashed border-slate-300 dark:border-slate-750 rounded-2xl bg-slate-50 dark:bg-slate-950/40 py-8 flex flex-col items-center justify-center transition-colors min-h-[160px] ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa]'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#5b6ef7]/5 dark:bg-[#a78bfa]/5 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-2">
                                        <FiMic size={20} />
                                    </div>
                                    <span className="text-xs text-slate-650 dark:text-slate-300 font-bold">Bắt đầu ghi âm</span>
                                </button>
                            ) : isRecording ? (
                                <div className="w-full border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                        <span className="text-xs font-bold text-red-65 tracking-wider">
                                            ĐANG GHI ÂM ({formatTime(recordingTime)})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="py-2 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer shadow-md"
                                    >
                                        <FiSquare size={12} /> Dừng ghi âm
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-650 dark:text-slate-300 truncate max-w-[280px]">
                                            {audioFileName}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={handleClearAudio}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                    <audio src={recordedUrl} controls className="w-full h-9 rounded-lg" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Panel cấu hình hoán đổi / phát lệnh */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-left flex-1">
                            <h3 className="text-sm font-bold text-slate-850 dark:text-white">Cấu hình chuyển đổi</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-455 mt-0.5">AI sẽ nhân bản mẫu giọng thu âm và biến đổi văn bản của bạn.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {error === 'login-required' ? (
                                <button
                                    type="button"
                                    onClick={handleOpenLogin}
                                    className="w-full md:w-auto px-8 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-650 hover:to-red-700 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.03]"
                                >
                                    <FiLogIn size={13} /> Đăng nhập ngay
                                </button>
                            ) : (
                                <>
                                    {swapDone ? (
                                        <button
                                            type="button"
                                            onClick={() => { setSwapDone(false); }}
                                            disabled={!text.trim() || !audioFile || isRecording || isLoading}
                                            className="w-full md:w-auto px-8 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] shadow-lg shadow-[#5b6ef7]/20 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.03] flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <FiCpu size={14} /> Tạo giọng nói mới
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleExecute}
                                            disabled={!text.trim() || !audioFile || isRecording || isLoading}
                                            className="w-full md:w-auto px-8 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] shadow-lg shadow-[#5b6ef7]/20 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.03] flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    Đang tạo...
                                                </>
                                            ) : (
                                                <>
                                                    <FiPlay size={14} /> Chuyển đổi giọng AI
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isLoading}
                                className="px-5 py-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <FiRefreshCw size={12} /> Thiết lập lại
                            </button>
                        </div>
                    </div>

                    {error && error !== 'login-required' && (
                        <p className="text-xs text-red-500 text-center font-bold">{error}</p>
                    )}
                </div>
            </div>

            {/* ===== CỘT PHẢI: Kết quả âm thanh AI ===== */}
            <div className="w-full lg:w-[400px] xl:w-[460px] shrink-0 flex flex-col gap-6">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col shadow-xl rounded-3xl min-h-[480px]">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Kết quả âm thanh AI</span>
                        {swapDone && (
                            <span className="text-xs font-bold text-green-650 dark:text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">Hoàn thành</span>
                        )}
                    </div>
                    
                    <div className="relative flex-1 min-h-[360px] bg-slate-50 dark:bg-slate-950/30 flex flex-col items-center justify-center p-6 text-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4 animate-pulse">
                                <div className="w-14 h-14 border-4 border-[#5b6ef7]/20 border-t-[#5b6ef7] dark:border-t-[#a78bfa] rounded-full animate-spin shadow-md" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-850 dark:text-white">AI Đang xử lý</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[240px] leading-relaxed">{message}</p>
                                </div>
                            </div>
                        ) : swapDone && resultAudioUrl ? (
                            // Audio visualizer illustration
                            <div className="w-full flex flex-col items-center gap-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                                    isPlaying
                                        ? 'bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] shadow-xl shadow-[#5b6ef7]/35 scale-110'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                                }`}>
                                    <FiVolume2 className={isPlaying ? "text-white animate-pulse" : ""} size={32} />
                                </div>
                                <div className="text-center px-4 w-full">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                        {isPlaying ? 'Đang phát âm thanh' : 'Sẵn sàng phát'}
                                    </h4>
                                </div>
                                <div className="w-full max-w-[320px] mt-2">
                                    <audio
                                        ref={audioPlayerRef}
                                        src={resolveMediaUrl(resultAudioUrl)}
                                        controls
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => setIsPlaying(false)}
                                        className="w-full h-10 outline-none rounded-lg bg-slate-100 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                                    <FiVolume2 size={24} />
                                </div>
                                <span className="text-xs text-center max-w-[240px] leading-relaxed">
                                    Âm thanh kết quả sau khi chuyển đổi bằng giọng AI sẽ xuất hiện tại đây
                                </span>
                            </div>
                        )}
                    </div>

                    {swapDone && resultAudioUrl && (
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <a
                                    href={resolveMediaUrl(resultAudioUrl)}
                                    download="clone-voice.wav"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] text-white hover:from-[#4b5ee7] hover:to-[#906ef5] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#5b6ef7]/15"
                                >
                                    Tải âm thanh (.WAV)
                                </a>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    Làm mới
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TextToSpeech;