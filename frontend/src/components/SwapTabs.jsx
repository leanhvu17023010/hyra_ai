const TABS = [
    { id: 'image', label: 'Hoán đổi khuôn mặt ảnh' },
    { id: 'video', label: 'Video hoán đổi khuôn mặt' },
    { id: 'tts',   label: 'Text to Speech' },
];

function SwapTabs({ tab, setTab }) {
    return (
        <div className="flex flex-wrap gap-4 mb-8 transition-all duration-300 ease-in-out">
            {TABS.map(t => (
                <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`py-5 px-8 rounded-full text-xl font-medium transition-colors duration-300 ease-in-out transform hover:scale-105 ${
                        tab === t.id
                        ? 'bg-[#5b6ef7] text-white dark:bg-[#11229c] dark:hover:bg-[#1128b9]'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
export default SwapTabs;