function SwapTabs({ tab, setTab }) {
    return (
        <div className="flex gap-6 mb-8">
            <button 
                onClick={() => setTab("image")}
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${
                    tab === "image" 
                    ? "bg-[#5b6ef7] text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
                Hoán đổi khuôn mặt ảnh
            </button>
            <button 
                onClick={() => setTab("video")}
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${
                    tab === "video" 
                    ? "bg-[#5b6ef7] text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
                Video hoán đổi khuôn mặt
            </button>
        </div>
    );
}
export default SwapTabs;