import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const FAQS = [
    {
        q: 'Hyra AI có miễn phí không?',
        a: 'Có! Bạn có thể hoán đổi khuôn mặt ảnh và video hoàn toàn miễn phí. Một số tính năng nâng cao (như Voice Clone AI) yêu cầu đăng nhập tài khoản.'
    },
    {
        q: 'Dữ liệu của tôi có được bảo mật không?',
        a: 'Tuyệt đối. Toàn bộ ảnh và video bạn tải lên chỉ được dùng để xử lý swap và tự động xóa sau khi hoàn tất. Chúng tôi không lưu trữ hay chia sẻ dữ liệu cá nhân.'
    },
    {
        q: 'Chất lượng kết quả như thế nào?',
        a: 'Hyra AI sử dụng mô hình FaceFusion thế hệ mới, đảm bảo kết quả chân thực với khả năng khớp biểu cảm khuôn mặt, màu da và góc nhìn tự nhiên nhất.'
    },
    {
        q: 'Video tối đa bao lâu?',
        a: 'Hiện tại hệ thống hỗ trợ video tối đa 5 giây và dung lượng không quá 30MB để đảm bảo tốc độ xử lý nhanh nhất.'
    },
    {
        q: 'Tôi có cần cài đặt gì không?',
        a: 'Không cần cài đặt bất cứ thứ gì. Hyra AI chạy hoàn toàn trên trình duyệt web — chỉ cần truy cập và sử dụng ngay.'
    },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex flex-col border border-slate-300 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-md shadow-black/[0.04] hover:shadow-lg transition-shadow">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-8 py-6 text-left cursor-pointer"
            >
                <span className="font-semibold text-slate-800 dark:text-white text-base">{q}</span>
                <FiChevronDown
                    className={`shrink-0 text-[#5b6ef7] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    size={22}
                />
            </button>
            {open && (
                <div className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    {a}
                </div>
            )}
        </div>
    );
}

function FAQSection() {
    return (
        <section className="w-full mt-12 mb-4">
            <div className="flex flex-col items-center justify-center text-center pt-20 mb-8 mt-16">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                 Câu hỏi <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5b6ef7] to-[#a78bfa]">thường gặp</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                    Không tìm thấy câu trả lời? Liên hệ với chúng tôi qua email.
                </p>
            </div>
            <div className="flex flex-col gap-4 w-full">
                {FAQS.map((faq, i) => (
                    <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
            </div>
        </section>
    );
}

export default FAQSection;
