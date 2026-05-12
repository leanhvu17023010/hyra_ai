import ImageAI from '../assets/Images/ImageAI.jpg';
import {FiCamera} from 'react-icons/fi';
function ImageSwap() {
    return (
        <div className="flex flex-col lg:flex-row w-full gap-6">
            
            <div className="flex flex-col flex-1 gap-6">
                {/* Box 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-medium">1. Tải lên hình ảnh gốc có khuôn mặt</h2>
                    <div className="
                    border-dashed 
                    outline-dashed
                    outline-2
                    outline-gray-300
                  border-gray-200 
                    rounded-xl 
                    bg-[#fafafa] 
                    flex flex-col 
                    items-center 
                    justify-center 
                    py-10 
                    cursor-pointer">
                         <FiCamera className='text-2xl text-gray-400'></FiCamera>
                        <p className="text-[13px]">Tải lên ảnh hoặc thả nó ở đây</p>
                        <p className="text-[11px] text-gray-400">Định dạng hỗ trợ: jpg, jpeg, png, webp</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-medium">2. Tải lên ảnh khuôn mặt</h2>
                    <div className="
                    border-dashed 
                    outline-dashed
                    outline-2
                    outline-gray-300
                  border-gray-200 
                    rounded-xl 
                    bg-[#fafafa] 
                    flex flex-col 
                    items-center 
                    justify-center 
                    py-10 
                    cursor-pointer">
                        <FiCamera className='text-2xl text-gray-400'></FiCamera>
                        <p className="text-[13px]">Tải lên ảnh muốn hoán đổi hoặc thả nó ở đây</p>
                        <p className="text-[11px] text-gray-400">Định dạng hỗ trợ: jpg, jpeg, png, webp</p>
                    </div>
                </div>

            </div>

            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex-1 rounded-xl bg-gray-100 overflow-hidden relative group">
                    <img 
                        src={ImageAI}    
                        alt="Ảnh mẫu" 
                        className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>
        </div>
    );
}
export default ImageSwap;