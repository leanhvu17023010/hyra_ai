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
                        className="flex flex-col items-center justify-center py-10 px-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md shadow-black/[0.04] hover:shadow-xl hover:shadow-black/[0.08] hover:-translate-y-0.5 transition-all duration-300 text-center"
                    >
                        <span
                            className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#5b6ef7] to-[#7c3aed]"
                        >
                            {s.value}
                        </span>
                        <span className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StatsSection;
