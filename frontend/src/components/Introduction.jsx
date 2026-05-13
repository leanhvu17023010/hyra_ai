import { FiZap, FiCheckCircle, FiShield, FiCpu } from "react-icons/fi";

function Introduction() {
  const features = [
    {
      id: 1,
      title: "Tốc độ cực nhanh",
      description: "Hệ thống máy chủ mạnh mẽ xử lý và trả kết quả ảnh/video chỉ trong vài giây.",
      icon: <FiZap className="w-8 h-8 text-orange-500" />,
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100"
    },
    {
      id: 2,
      title: "Chất lượng chân thực",
      description: "AI tiên tiến nhận diện và khớp chính xác biểu cảm khuôn mặt, mang lại sự tự nhiên nhất.",
      icon: <FiCheckCircle className="w-8 h-8 text-green-500" />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      id: 3,
      title: "Bảo mật tuyệt đối",
      description: "Dữ liệu của bạn được mã hóa an toàn và tự động xóa khỏi hệ thống sau khi xử lý.",
      icon: <FiShield className="w-8 h-8 text-blue-500" />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      id: 4,
      title: "Hoàn toàn tự động",
      description: "Không cần bất kỳ kỹ năng chỉnh sửa nào, chỉ việc tải ảnh lên và AI sẽ làm phần còn lại.",
      icon: <FiCpu className="w-8 h-8 text-purple-500" />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100"
    }
  ];

  return (
    <div className="w-full py-20 px-4 sm:px-6 lg:px-8 mt-10 ">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Giới thiệu */}
        <div className="text-center mb-16 space-y-4" >
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            Về <span className="text-blue-600">SwapAI</span>
          </h2>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-4 font-medium">
            SwapAI là công cụ hoán đổi khuôn mặt thông minh thế hệ mới, 
            giúp bạn tạo ra những nội dung video và hình ảnh độc đáo chỉ với vài cú click.
          </p>
        </div>

        {/* Ưu điểm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`
                relative overflow-hidden
                flex flex-col items-center text-center
                bg-white dark:bg-zinc-800 
                rounded-[2.5rem] p-10
                border border-zinc-100 dark:border-zinc-700
                shadow-[0_20px_50px_rgba(0,0,0,0.04)]
                hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)]
                hover:-translate-y-2
                transition-all duration-500
                group
              `}
            >
              {/* Background Decor */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${feature.bgColor} opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className={`
                relative
                w-20 h-20 rounded-3xl 
                ${feature.iconBg}
                flex items-center justify-center mb-8
                shadow-inner
                group-hover:rotate-6 transition-transform duration-300
              `}>
                {feature.icon}
              </div>
              
              <h3 className="relative text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              
              <p className="relative text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Introduction;
