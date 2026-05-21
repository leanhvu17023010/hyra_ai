import { FiZap, FiCheckCircle, FiShield, FiCpu } from "react-icons/fi";

const features = [
    {
        icon: <FiZap size={20} />,
        title: "Tốc độ cực nhanh",
        desc: "Hệ thống máy chủ mạnh mẽ xử lý và trả kết quả ảnh/video chỉ trong vài giây.",
    },
    {
        icon: <FiCheckCircle size={20} />,
        title: "Chất lượng chân thực",
        desc: "AI tiên tiến nhận diện và khớp chính xác biểu cảm khuôn mặt, mang lại sự tự nhiên nhất.",
    },
    {
        icon: <FiShield size={20} />,
        title: "Bảo mật tuyệt đối",
        desc: "Dữ liệu của bạn được mã hóa an toàn và tự động xóa khỏi hệ thống sau khi xử lý.",
    },
    {
        icon: <FiCpu size={20} />,
        title: "Hoàn toàn tự động",
        desc: "Không cần bất kỳ kỹ năng chỉnh sửa nào, chỉ việc tải ảnh lên và AI sẽ làm phần còn lại.",
    },
];

function Introduction() {
    return (
        <section className="w-full py-30">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center mb-10 mt-40">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 ">
                    Tại sao chọn <span className="text-[#5b6ef7]">Hyra AI</span>?
                </h2>
                <p className="text-sm pb-5 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Nền tảng hoán đổi khuôn mặt thông minh thế hệ mới — nhanh, đẹp và bảo mật tuyệt đối.
                </p>
            </div>

            {/* 4 feature cards — cùng style với HowToSwap và toàn trang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-700 rounded-2xl border border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-1 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#5b6ef7]">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Introduction;
