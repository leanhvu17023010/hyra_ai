const CONTENT = {
    image: {
        title: 'Cách hoán đổi khuôn mặt trực tuyến với Hyra AI',
        subtitle: 'Nhanh chóng hoán đổi khuôn mặt trong ảnh bằng AI tiên tiến. Làm theo những bước đơn giản để tạo ra kết quả độc đáo chỉ trong vài phút.',
        steps: [
            { title: 'Tải lên hình ảnh gốc',    desc: 'Bắt đầu bằng cách tải lên ảnh mà bạn muốn hoán đổi khuôn mặt. Đây sẽ là ảnh cơ sở. Công cụ đảm bảo khu vực bên ngoài khuôn mặt không bị ảnh hưởng.' },
            { title: 'Thêm hình ảnh khuôn mặt', desc: 'Tải lên hình ảnh khuôn mặt muốn sử dụng để hoán đổi. Có thể là ảnh của bạn, bạn bè hoặc nhân vật yêu thích. Hình ảnh rõ nét sẽ cho kết quả tốt nhất.' },
            { title: 'Hoán đổi khuôn mặt',      desc: 'Nhấn "Bắt đầu Swap" để AI tự động phân tích, nhận diện và ghép khuôn mặt một cách chân thực. Hệ thống xử lý nhanh và trả kết quả trong vài giây.' },
            { title: 'Tải kết quả về',           desc: 'Xem trước kết quả ngay trên trang và nhấn "Tải xuống" để lưu ảnh đã hoán đổi. Chia sẻ ngay với bạn bè và mạng xã hội.' },
        ],
        tips: ['Dùng ảnh độ phân giải cao', 'Khuôn mặt nhìn thẳng, không bị che', 'Ánh sáng đồng đều', 'Định dạng PNG cho chất lượng tốt nhất'],
    },
    video: {
        title: 'Cách hoán đổi khuôn mặt trong video với Hyra AI',
        subtitle: 'AI thay thế khuôn mặt qua từng khung hình. Tạo ra video độc đáo chỉ trong vài bước đơn giản.',
        steps: [
            { title: 'Tải video gốc lên',    desc: 'Chọn video cần thay khuôn mặt. Hỗ trợ định dạng MP4, MOV, AVI. Tối đa 5 giây và 30MB để đảm bảo xử lý nhanh và hiệu quả.' },
            { title: 'Chọn ảnh khuôn mặt',  desc: 'Tải lên ảnh chứa khuôn mặt bạn muốn ghép vào video. Nên chọn ảnh chụp thẳng, ánh sáng tốt và rõ nét để AI nhận diện chính xác.' },
            { title: 'AI xử lý từng frame',  desc: 'Nhấn "Bắt đầu Swap" và hệ thống AI sẽ tự động phân tích, thay thế khuôn mặt qua từng khung hình. Thời gian tùy theo độ dài video.' },
            { title: 'Xem và tải video về',  desc: 'Video kết quả tự phát sau khi xử lý xong. Nhấn "Tải xuống" để lưu file MP4 về máy và chia sẻ với bạn bè.' },
        ],
        tips: ['Video ngắn dưới 5 giây xử lý nhanh hơn', 'Khuôn mặt trong video rõ, không bị che', 'Tránh ánh sáng thay đổi đột ngột', 'Độ phân giải 720p trở lên'],
    },
    tts: {
        title: 'Cách chuyển văn bản thành giọng nói với Hyra AI',
        subtitle: 'Nhập văn bản và nhận ngay giọng đọc tự nhiên bằng tiếng Việt. Đơn giản, nhanh chóng, không cần cài đặt thêm.',
        steps: [
            { title: 'Nhập nội dung văn bản',  desc: 'Gõ hoặc dán đoạn văn bản bạn muốn nghe vào ô nhập liệu. Hỗ trợ tối đa 1000 ký tự mỗi lần. Nên thêm dấu câu để giọng đọc tự nhiên hơn.' },
            { title: 'Nhấn nút Phát âm thanh', desc: 'Nhấn "Phát âm thanh" và trình duyệt sẽ đọc nội dung bằng giọng tiếng Việt tự nhiên ngay lập tức, không cần chờ đợi.' },
            { title: 'Dừng khi cần thiết',     desc: 'Dừng giọng đọc bất kỳ lúc nào bằng nút "Dừng lại". Âm thanh ngừng ngay và bạn có thể điều chỉnh rồi phát lại.' },
            { title: 'Làm mới và nhập lại',    desc: 'Nhấn "Làm mới" để xóa toàn bộ nội dung cũ và bắt đầu với đoạn văn bản mới. Thao tác đơn giản và nhanh chóng.' },
        ],
        tips: ['Chia văn bản dài thành đoạn ngắn', 'Dùng dấu chấm phẩy cho ngữ điệu tự nhiên', 'Tránh ký tự đặc biệt', 'Hoạt động tốt nhất trên Chrome & Edge'],
    },
    lipsync: {
        title: 'Cách lồng tiếng và ghép phụ đề video với Hyra AI',
        subtitle: 'Lồng tiếng nói tự nhiên hoặc nhân bản giọng nói của bạn trực tiếp vào video, tự động sinh và ghép phụ đề chạy chữ song song.',
        steps: [
            { title: 'Tải video cần lồng tiếng', desc: 'Chọn video gốc mà bạn muốn ghép giọng nói và phụ đề. Định dạng tối đa 5 giây và 30MB.' },
            { title: 'Nhập text hoặc tải file giọng', desc: 'Chọn lồng tiếng bằng cách nhập văn bản (AI nhân bản giọng đọc từ giọng mẫu) hoặc tải/ghi âm trực tiếp file giọng nói của bạn.' },
            { title: 'AI tự động ghép chữ và tiếng', desc: 'AI sẽ tự động tạo âm thanh từ văn bản, sinh phụ đề khớp thời gian thực và ghép hoàn chỉnh vào video gốc của bạn.' },
            { title: 'Xem và tải video kết quả', desc: 'Sau khi hoàn thành, video kết quả sẽ tự động phát. Nhấn "Tải xuống" để lưu video lồng tiếng chất lượng cao.' },
        ],
        tips: ['Video gốc có âm thanh rõ ràng hoặc không lời', 'Giọng mẫu rõ âm, không có tiếng ồn nền', 'Chia văn bản lồng tiếng thành câu ngắn để khớp phụ đề', 'Hỗ trợ MP4, WAV, MP3'],
    },
};

function HowToSwap({ tab }) {
    const c = CONTENT[tab] || CONTENT.image;
    return (
        <section className="w-full mt-12 mb-4">

            {/* Tiêu đề */}
            <div className="text-center mb-10 flex flex-col items-center justify-center pt-20 pb-5">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">{c.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">{c.subtitle}</p>
            </div>

            {/* Steps — lưới 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-5">
                {c.steps.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-md shadow-black/[0.04] hover:shadow-xl hover:shadow-black/[0.08] transition-all duration-300">
                        {/* Số thứ tự */}
                        <div className="shrink-0 w-10 h-10 rounded-full bg-[#5b6ef7]/10 border border-[#5b6ef7]/30 flex items-center justify-center mt-0.5">
                            <span className="text-sm font-bold text-[#5b6ef7]">{String(i + 1).padStart(2, '0')}</span>
                        </div>
                        {/* Nội dung */}
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tips */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-md shadow-black/[0.04]">
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-3">Mẹo để có kết quả tốt nhất</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {c.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="text-[#5b6ef7] shrink-0">•</span> {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
export default HowToSwap;
