const TABS = [
    { id: 'image', label: 'Hoán đổi khuôn mặt ảnh' },
    { id: 'video', label: 'Video hoán đổi khuôn mặt' },
    { id: 'tts',   label: 'Chuyển văn bản thành âm thanh' },
];

function SwapTabs({ tab, setTab }) {
    return (
        <div className="flex flex-wrap gap-3 py-6 transition-all duration-300 ease-in-out">
            {TABS.map(t => (
                <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`py-3 px-6 rounded-full text-sm font-semibold transition-colors duration-200 hover:scale-105 transform ${
                        tab === t.id
                        ? 'bg-[#5b6ef7] text-white dark:bg-[#11229c] dark:hover:bg-[#1128b9]'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
export default SwapTabs;