import { useState } from 'react';
import { FiPlay, FiSquare, FiRefreshCw, FiVolume2, FiMic } from 'react-icons/fi';

const MAX_CHARS = 1000;

function TextToSpeech() {
    const [text, setText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState('');

    const handlePlay = () => {
        if (!text.trim()) return setError('Vui lòng nhập nội dung văn bản.');
        setError('');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.onend   = () => setIsPlaying(false);
        utterance.onerror = () => { setError('Trình duyệt không hỗ trợ. Vui lòng thử lại.'); setIsPlaying(false); };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const handleReset = () => {
        window.speechSynthesis.cancel();
        setText(''); setError(''); setIsPlaying(false);
    };

    return (
        <div className="flex gap-6 items-start w-full flex-wrap">

            {/* ===== CỘT TRÁI: Trạng thái + Nút ===== */}
            <div className="flex flex-col gap-4 w-72 shrink-0">

                {/* Card trạng thái */}
                <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700">
                    <p className="mb-3 py-2 text-xl font-semibold text-gray-600 dark:text-gray-300">Trạng thái</p>
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isPlaying
                                ? 'bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 scale-110'
                                : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                            {isPlaying
                                ? <FiVolume2 className="text-white" size={28} />
                                : <FiMic className="text-gray-400" size={28} />
                            }
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {isPlaying ? 'Đang phát...' : 'Sẵn sàng'}
                        </p>

                        {/* Sóng âm */}
                        <div className="flex items-end justify-center gap-[3px] h-8 w-full px-4">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-200 ${
                                        isPlaying ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-500'
                                    }`}
                                    style={{
                                        height: isPlaying
                                            ? `${10 + Math.abs(Math.sin(i * 0.7)) * 22}px`
                                            : `${4 + Math.abs(Math.sin(i * 0.5)) * 6}px`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card nút điều khiển */}
                <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700">
                    <p className="mb-3 py-2 text-xl font-semibold text-gray-600 dark:text-gray-300">Điều khiển</p>
                    <div className="flex flex-col gap-2 px-1 pb-1">
                        {isPlaying ? (
                            <button onClick={handleStop}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                <FiSquare size={14} /> Dừng lại
                            </button>
                        ) : (
                            <button onClick={handlePlay} disabled={!text.trim()}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                                <FiPlay size={14} /> Phát âm thanh
                            </button>
                        )}
                        <button onClick={handleReset}
                            className="w-full py-2 rounded-xl text-sm font-medium border border-gray-300 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                            <FiRefreshCw size={12} /> Làm mới
                        </button>
                        {error && <p className="text-xs text-red-500 text-center pt-1">{error}</p>}
                    </div>
                </div>
            </div>

            {/* ===== CỘT PHẢI: Nhập văn bản ===== */}
            <div className="flex-1 min-w-0 rounded-2xl border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                    <p className=" text-xl font-semibold text-gray-600 dark:text-gray-300">Nhập văn bản</p>
                    <span className={`text-xl ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                        {text.length}/{MAX_CHARS}
                    </span>
                </div>
                <textarea
                    value={text}
                    onChange={e => e.target.value.length <= MAX_CHARS && setText(e.target.value)}
                    placeholder="Nhập nội dung bạn muốn nghe tại đây..."
                    className="flex-1 min-h-[390px] w-full p-4 text-xl text-gray-700 dark:text-gray-200 bg-transparent resize-none outline-none placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}

export default TextToSpeech;
