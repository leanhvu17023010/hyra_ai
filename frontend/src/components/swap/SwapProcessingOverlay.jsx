function SwapProcessingOverlay({ progress, label }) {
    const percent = Math.max(0, Math.min(100, progress ?? 0));

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 font-medium text-blue-600 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm dark:bg-gray-800/80 dark:text-blue-400 text-center">
                {label}
            </p>
            <div className="mt-4 w-full max-w-xs">
                <div className="h-2 rounded-full bg-gray-200/90 dark:bg-gray-600 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-blue-500 transition-[width] duration-300 ease-out"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="mt-2 text-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {percent}%
                </p>
            </div>
        </div>
    );
}

export default SwapProcessingOverlay;
