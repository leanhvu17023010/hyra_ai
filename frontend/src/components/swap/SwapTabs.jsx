const TABS = [
    { id: 'image', label: 'Hoán đổi khuôn mặt ảnh' },
    { id: 'video', label: 'Video hoán đổi khuôn mặt' },
    { id: 'tts',   label: 'Chuyển văn bản thành âm thanh' },
    { id: 'lipsync', label: 'Lồng tiếng & Ghép phụ đề' },
    { id: 'whisper', label: 'Tự động tạo phụ đề' },
];

function SwapTabs({ tab, setTab }) {
    return (
        <div className="flex flex-wrap gap-3 py-6 transition-all duration-300 ease-in-out">
            {TABS.map(t => (
                <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`py-3 px-6 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 transform ${
                        tab === t.id
                        ? 'bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] text-white shadow-md shadow-[#5b6ef7]/20 border-0'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-md shadow-black/[0.04]'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
export default SwapTabs;