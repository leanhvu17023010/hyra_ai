const STATS = [
    { value: '10K+', label: 'Lượt swap thành công' },
    { value: '99%',  label: 'Mức độ chính xác AI' },
    { value: '< 30s', label: 'Thời gian xử lý trung bình' },
    { value: '5 lần', label: 'Dùng thử miễn phí' },
];

function StatsSection() {
    return (
        <section className="w-full my-14 pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((s, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center"
                    >
                        <span
                            className="text-3xl font-extrabold bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(135deg, #5b6ef7, #7c3aed)' }}
                        >
                            {s.value}
                        </span>
                        <span className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StatsSection;
