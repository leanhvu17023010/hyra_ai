import { FiArrowRight, FiZap } from 'react-icons/fi';

const BADGES = [
    'FaceFusion AI',
    'Voice Clone',
    'Bảo mật cao',
    'Miễn phí sử dụng',
];

function HeroSection({ onStartClick, onGuideClick }) {
    return (
        <section className="w-full text-center pt-6 pb-10 flex flex-col items-center gap-6 relative">
            {/* Glow background effect */}
            <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[350px] rounded-full opacity-20 dark:opacity-10 blur-3xl"
                style={{ background: 'radial-gradient(ellipse, #5b6ef7 0%, #a78bfa 60%, transparent 100%)' }}
            />

            {/* Badge "Mới" */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold bg-[#5b6ef7]/10 text-[#5b6ef7] border border-[#5b6ef7]/30 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
                <FiZap size={11} className="animate-pulse" />
                Powered by FaceFusion AI — Phiên bản mới nhất
            </span>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white max-w-4xl">
                Hoán đổi khuôn mặt{' '}
                <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(90deg, #5b6ef7, #a78bfa)' }}
                >
                    thực tế
                </span>{' '}
                bằng AI
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                Tải ảnh hoặc video lên, AI sẽ hoán đổi khuôn mặt chỉ trong vài giây. Không cần kỹ năng chỉnh sửa,
                không cần cài đặt — hoàn toàn miễn phí và bảo mật.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                    onClick={onStartClick}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm shadow-lg shadow-[#5b6ef7]/20 bg-gradient-to-r from-[#5b6ef7] to-[#7c3aed] hover:from-[#4b5ee7] hover:to-[#6c2ae5] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#5b6ef7]/30 cursor-pointer"
                >
                    Bắt đầu ngay miễn phí
                    <FiArrowRight size={16} />
                </button>
                <button
                    onClick={onGuideClick}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer hover:scale-105"
                >
                    Xem hướng dẫn
                </button>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {BADGES.map((badge, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm"
                    >
                        {badge}
                    </span>
                ))}
            </div>
        </section>
    );
}

export default HeroSection;
