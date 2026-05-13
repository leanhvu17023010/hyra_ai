function SwapTabs({ tab, setTab }) {
    return (
        <div className="flex gap-6 mb-8 transition-all duration-300 ease-in-out">
            <button 
                onClick={() => setTab("image")}
                className={`py-5 px-8 rounded-full text-xl font-medium transition-colors duration-300 ease-in-out transform hover:scale-105 ${
                    tab === "image" 
                    ? "bg-[#5b6ef7] text-white dark:bg-[#11229c] dark:hover:bg-[#1128b9]" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
                Hoán đổi khuôn mặt ảnh
            </button>
            <button 
                onClick={() => setTab("video")}
                className={`py-5 px-8 rounded-full text-xl font-medium transition-colors duration-300 ease-in-out transform hover:scale-105 ${
                    tab === "video" 
                    ? "bg-[#5b6ef7] text-white dark:bg-[#11229c] dark:hover:bg-[#1128b9]" 
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
                Video hoán đổi khuôn mặt
            </button>
        </div>
    );
}
export default SwapTabs;