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
            setMessage('Đang khởi tạo tác vụ hoán đổi giọng nói...');

            const createRes = await xttsService.createTtsTask();
            const taskId = createRes.result;
            if (!taskId) throw new Error('Không khởi tạo được task XTTS');

            setMessage('Đang tải tệp âm thanh mẫu lên hệ thống...');
            await xttsService.uploadVoiceToTtsTask(audioFile, taskId);

            setMessage('Bắt đầu xử lý nhân bản giọng nói AI...');
            await xttsService.processTtsTask(taskId, text, 'vi');

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
                        setMessage('Đang sinh âm thanh... Vui lòng đợi');
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

    const handleStop = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }
        setIsPlaying(false);
    };

    const handleReplay = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.play().catch(e => console.log('Replay error:', e));
            setIsPlaying(true);
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
        <div className="flex gap-6 items-start w-full flex-wrap">

            {/* ===== CỘT TRÁI: Nhập liệu (Văn bản & Giọng mẫu) ===== */}
            <div className="flex-1 max-w-[740px] min-w-[320px] flex flex-col gap-4">
                
                {/* 1. Nhập văn bản */}
                <div className="rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden flex flex-col shadow-md">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Nhập văn bản</p>
                        <span className={`text-xs font-semibold ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                            {text.length}/{MAX_CHARS}
                        </span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => e.target.value.length <= MAX_CHARS && setText(e.target.value)}
                        placeholder="Nhập nội dung văn bản bạn muốn chuyển đổi tại đây..."
                        disabled={isLoading}
                        className="w-full min-h-[220px] p-5 text-lg text-gray-700 dark:text-gray-200 bg-transparent resize-none outline-none placeholder:text-gray-400 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* 2. Chọn giọng mẫu (Tải file hoặc Ghi âm) */}
                <div className="rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 shadow-md">
                    <p className="mb-3 text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <FiMic className="text-[#5b6ef7] dark:text-[#a78bfa]" />
                        Giọng đọc mẫu
                    </p>
                    
                    {/* Tabs switch */}
                    <div className="flex bg-gray-100 dark:bg-gray-600 p-1 rounded-xl mb-4">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => { setSourceType('upload'); handleClearAudio(); }}
                            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                sourceType === 'upload'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-[#5b6ef7] dark:text-[#a78bfa]'
                                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Tải file giọng mẫu
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => { setSourceType('record'); handleClearAudio(); }}
                            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                sourceType === 'record'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-[#5b6ef7] dark:text-[#a78bfa]'
                                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-700'
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
                                    className={`border-2 border-dashed border-slate-300 dark:border-slate-750 rounded-xl bg-slate-50 dark:bg-slate-950/25 p-6 flex flex-col items-center justify-center transition-colors ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa]'
                                    }`}
                                >
                                    <FiUploadCloud size={24} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-300 text-center font-medium">Tải tệp âm thanh</span>
                                    <span className="text-xs text-gray-400 text-center mt-1">Hỗ trợ mp3, wav, m4a</span>
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
                                <div className="p-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                                            {audioFileName}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={handleClearAudio}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg dark:hover:bg-red-950/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                    <audio src={recordedUrl} controls className="w-full h-8" />
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
                                    className={`w-full border-2 border-dashed border-slate-300 dark:border-slate-750 rounded-xl bg-slate-50 dark:bg-slate-950/25 py-8 flex flex-col items-center justify-center transition-colors ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#5b6ef7] dark:hover:border-[#a78bfa]'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-[#5b6ef7] dark:text-[#a78bfa] mb-2">
                                        <FiMic size={20} />
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-300 font-medium">Bắt đầu ghi âm</span>
                                </button>
                            ) : isRecording ? (
                                <div className="w-full border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 rounded-xl p-4 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            ĐANG GHI ÂM ({formatTime(recordingTime)})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="py-1.5 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                                    >
                                        <FiSquare size={12} /> Dừng ghi âm
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full p-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {audioFileName}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={handleClearAudio}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg dark:hover:bg-red-950/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                    <audio src={recordedUrl} controls className="w-full h-8" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== CỘT PHẢI: Trạng thái & Điều khiển hành động ===== */}
            <div className="w-150 shrink-0 flex flex-col gap-4">
                
                {/* 1. Trạng thái phát */}
                <div className="rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 shadow-md">
                    <p className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">Trạng thái phát</p>
                    <div className="flex flex-col items-center gap-3 py-3 w-full">
                        {isLoading ? (
                            <div className="flex flex-col items-center w-full py-4 gap-3">
                                {/* Vòng quay tải */}
                                <div className="w-10 h-10 border-4 border-[#5b6ef7]/20 border-t-[#5b6ef7] dark:border-t-[#a78bfa] rounded-full animate-spin" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-[#5b6ef7] dark:text-[#a78bfa]">
                                        Đang xử lý...
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px] leading-tight">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isPlaying
                                        ? 'bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] shadow-lg shadow-[#5b6ef7]/20 scale-105'
                                        : 'bg-gray-100 dark:bg-gray-600'
                                }`}>
                                    <FiVolume2 className={isPlaying ? "text-white" : "text-gray-400 dark:text-gray-300"} size={22} />
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {isPlaying ? 'Đang phát...' : 'Sẵn sàng'}
                                </p>

                                {/* Sóng âm giả lập hoặc trình phát nhạc thực tế */}
                                {resultAudioUrl ? (
                                    <div className="w-full mt-2">
                                        <audio
                                            ref={audioPlayerRef}
                                            src={resolveMediaUrl(resultAudioUrl)}
                                            controls
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onEnded={() => setIsPlaying(false)}
                                            className="w-full h-10 outline-none rounded-lg bg-gray-50 dark:bg-slate-800"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1.5">
                                        Chờ tạo âm thanh...
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Điều khiển */}
                <div className="rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 shadow-md">
                    <p className="mb-3 text-lg font-semibold text-gray-600 dark:text-gray-300">Điều khiển</p>
                    <div className="flex flex-col gap-2">
                        {error === 'login-required' ? (
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                                <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-medium">Yêu cầu đăng nhập để swap giọng</p>
                                <button
                                    type="button"
                                    onClick={handleOpenLogin}
                                    className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                                >
                                    <FiLogIn size={13} /> Đăng nhập ngay
                                </button>
                            </div>
                        ) : (
                            <>
                                {isPlaying ? (
                                    <button
                                        type="button"
                                        onClick={handleStop}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FiSquare size={14} /> Dừng lại
                                    </button>
                                ) : swapDone ? (
                                    // Đã swap xong, có thể nghe lại hoặc swap mới
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={handleReplay}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                        >
                                            <FiPlay size={14} /> Nghe lại
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setSwapDone(false); }}
                                            disabled={!text.trim() || !audioFile || isRecording || isLoading}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <FiCpu size={14} /> Swap lại
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleExecute}
                                        disabled={!text.trim() || !audioFile || isRecording || isLoading}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] hover:from-[#4b5ee7] hover:to-[#906ef5] disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Đang chuyển đổi giọng đọc...
                                            </>
                                        ) : (
                                            <>
                                                <FiPlay size={14} /> Chuyển đổi giọng nói AI
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
                            className="w-full py-2 rounded-xl text-sm font-medium border border-slate-300 text-slate-500 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <FiRefreshCw size={12} /> Thiết lập lại từ đầu
                        </button>
                        {error && error !== 'login-required' && (
                            <p className="text-xs text-red-500 text-center font-medium pt-1">{error}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TextToSpeech;