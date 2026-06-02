function SwapProcessingOverlay({ progress, label }) {
    const percent = Math.max(0, Math.min(100, progress ?? 0));

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <div className="w-12 h-12 border-4 border-[#5b6ef7] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 font-semibold text-[#5b6ef7] bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm dark:bg-gray-800/80 dark:text-[#a78bfa] text-center">
                {label}
            </p>
            <div className="mt-4 w-full max-w-xs">
                <div className="h-2 rounded-full bg-gray-200/90 dark:bg-gray-600 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa] transition-[width] duration-300 ease-out"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="mt-2 text-center text-sm font-bold text-[#5b6ef7] dark:text-[#a78bfa]">
                    {percent}%
                </p>
            </div>
        </div>
    );
}

export default SwapProcessingOverlay;
