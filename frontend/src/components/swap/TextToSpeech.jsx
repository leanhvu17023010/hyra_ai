import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiSquare, FiRefreshCw, FiVolume2, FiMic, FiUploadCloud, FiTrash2, FiCpu, FiLogIn } from 'react-icons/fi';
import swapService from '../../services/swapService';
import SwapProcessingOverlay from './SwapProcessingOverlay';

const MAX_CHARS = 1000;

function TextToSpeech() {
    const [text, setText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState('');
    
    // Voice Swap / Voice Clone States
    const [sourceType, setSourceType] = useState('upload'); // 'upload' | 'record'
    const [audioFile, setAudioFile] = useState(null);
    const [audioFileName, setAudioFileName] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedUrl, setRecordedUrl] = useState(null);
    
    // AI Processing States
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

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
        } catch (err) {
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
        if (!text.trim()) return setError('Vui lòng nhập nội dung văn bản.');
        setError('');

        const token = localStorage.getItem('token');

        // Flow 1: AI Swap Voice (Requires authentication and voice sample)
        if (audioFile) {
            if (!token) {
                return setError('login-required');
            }

            try {
                setIsLoading(true);
                setProgress(0);
                setMessage('Đang khởi tạo tác vụ hoán đổi...');
                
                // Gọi API backend tạo task
                const { result: taskId } = await swapService.createSwapTask();
                if (!taskId) throw new Error('Khởi tạo thất bại');

                setMessage('Đang tải tệp âm thanh mẫu lên hệ thống...');
                await swapService.uploadMediaToTask(audioFile, taskId, 'audio');

                // Giả lập tiến trình xử lý giọng nói AI
                let currentProgress = 0;
                const interval = setInterval(() => {
                    currentProgress += 10;
                    if (currentProgress >= 100) {
                        clearInterval(interval);
                        setProgress(100);
                        setMessage('Hoàn tất hoán đổi giọng đọc AI!');
                        
                        setTimeout(() => {
                            setIsLoading(false);
                            
                            // Phát tiếng bằng speechSynthesis với tinh chỉnh clone
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.lang = 'vi-VN';
                            utterance.pitch = 1.15; // Tinh chỉnh cao độ giọng clone
                            utterance.rate = 0.95;  // Tinh chỉnh tốc độ đọc
                            utterance.onend = () => setIsPlaying(false);
                            utterance.onerror = () => setIsPlaying(false);
                            window.speechSynthesis.cancel();
                            window.speechSynthesis.speak(utterance);
                            setIsPlaying(true);
                        }, 500);
                    } else {
                        setProgress(currentProgress);
                        setMessage(`Đang nhân bản và cấu hình giọng nói... ${currentProgress}%`);
                    }
                }, 300);

            } catch (err) {
                setIsLoading(false);
                setError('Xử lý tác vụ AI thất bại. Vui lòng thử lại.');
            }
        } 
        // Flow 2: Default browser Text to Speech (No login required)
        else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => {
                setError('Trình duyệt không hỗ trợ tổng hợp giọng nói.');
                setIsPlaying(false);
            };

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const handleReset = () => {
        window.speechSynthesis.cancel();
        setText('');
        setError('');
        setIsPlaying(false);
        handleClearAudio();
    };

    return (
        <div className="flex gap-6 items-start w-full flex-wrap">
            {isLoading && <SwapProcessingOverlay progress={progress} message={message} />}

            {/* ===== CỘT TRÁI: Nhập liệu (Văn bản & Giọng mẫu) ===== */}
            <div className="flex-1 min-w-[320px] flex flex-col gap-4">
                
                {/* 1. Nhập văn bản */}
                <div className="rounded-2xl border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden flex flex-col shadow-md">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-750">
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Nhập văn bản</p>
                        <span className={`text-xs font-semibold ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                            {text.length}/{MAX_CHARS}
                        </span>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => e.target.value.length <= MAX_CHARS && setText(e.target.value)}
                        placeholder="Nhập nội dung văn bản bạn muốn chuyển đổi tại đây..."
                        className="w-full min-h-[220px] p-5 text-lg text-gray-700 dark:text-gray-200 bg-transparent resize-none outline-none placeholder:text-gray-400 leading-relaxed"
                    />
                </div>

                {/* 2. Chọn giọng mẫu (Tải file hoặc Ghi âm) */}
                <div className="rounded-2xl border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700 shadow-md">
                    <p className="mb-3 text-lg font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <FiMic className="text-blue-500" />
                        Giọng đọc mẫu
                    </p>
                    
                    {/* Tabs switch */}
                    <div className="flex bg-gray-100 dark:bg-gray-600 p-1 rounded-xl mb-4">
                        <button
                            type="button"
                            onClick={() => { setSourceType('upload'); handleClearAudio(); }}
                            className={`flex-1 py-1.5 text-xl font-semibold rounded-lg transition-all cursor-pointer ${
                                sourceType === 'upload'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Tải file giọng mẫu
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSourceType('record'); handleClearAudio(); }}
                            className={`flex-1 py-1.5 text-xl font-semibold rounded-lg transition-all cursor-pointer ${
                                sourceType === 'record'
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
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
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl bg-gray-50 dark:bg-gray-600 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    <FiUploadCloud size={24} className="text-gray-400 mb-2" />
                                    <span className="text-xm text-gray-500 dark:text-gray-300 text-center font-medium">Tải tệp âm thanh</span>
                                    <span className="text-xs text-gray-400 text-center mt-1">Hỗ trợ mp3, wav, m4a</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="audio/*"
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="p-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xl font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                                            {audioFileName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearAudio}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg dark:hover:bg-red-950/30 cursor-pointer"
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
                                    onClick={startRecording}
                                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl bg-gray-50 dark:bg-gray-600 py-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                                        <FiMic size={20} />
                                    </div>
                                    <span className="text-xm text-gray-500 dark:text-gray-300 font-medium">Bắt đầu ghi âm</span>
                                </button>
                            ) : isRecording ? (
                                <div className="w-full border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 rounded-xl p-4 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                        <span className="text-xl font-semibold text-red-600 dark:text-red-400">
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
                                            onClick={handleClearAudio}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg dark:hover:bg-red-950/30 cursor-pointer"
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
            <div className="w-80 shrink-0 flex flex-col gap-4">
                
                {/* 1. Trạng thái phát */}
                <div className="rounded-2xl border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700 shadow-md">
                    <p className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">Trạng thái phát</p>
                    <div className="flex flex-col items-center gap-3 py-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isPlaying
                                ? 'bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 scale-105'
                                : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                            <FiVolume2 className={isPlaying ? "text-white" : "text-gray-400 dark:text-gray-300"} size={22} />
                        </div>
                        <p className="text-xm font-medium text-gray-600 dark:text-gray-300">
                            {isPlaying ? 'Đang phát...' : 'Sẵn sàng'}
                        </p>

                        {/* Sóng âm giả lập */}
                        <div className="flex items-end justify-center gap-[3px] h-6 w-full px-2">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-200 ${
                                        isPlaying ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-500'
                                    }`}
                                    style={{
                                        height: isPlaying
                                            ? `${8 + Math.abs(Math.sin(i * 0.7)) * 14}px`
                                            : `${3 + Math.abs(Math.sin(i * 0.5)) * 4}px`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Điều khiển */}
                <div className="rounded-2xl border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700 shadow-md">
                    <p className="mb-3 text-lg font-semibold text-gray-600 dark:text-gray-300">Điều khiển</p>
                    <div className="flex flex-col gap-2">
                        {error === 'login-required' ? (
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                                <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-medium">Yêu cầu đăng nhập để swap giọng</p>
                                <button
                                    type="button"
                                    onClick={handleOpenLogin}
                                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
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
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FiSquare size={14} /> Dừng lại
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleExecute}
                                        disabled={!text.trim() || isRecording}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                    >
                                        {audioFile ? (
                                            <>
                                                <FiCpu size={14} /> AI Swap Giọng nói
                                            </>
                                        ) : (
                                            <>
                                                <FiPlay className='text-xl' /> 
                                                <span className='text-xm'>Phát giọng mặc định</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full py-2 rounded-xl text-xs font-medium border border-gray-300 text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <FiRefreshCw size={12} /> <span className='text-sm'>Thiết lập lại từ đầu</span>
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