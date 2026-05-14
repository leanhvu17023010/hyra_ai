import videoAI from '../assets/Images/videoAI.webp';
import {FiCamera, FiVideo} from 'react-icons/fi';
function VideoSwap() {
    return (
        <div className="flex flex-col lg:flex-row w-full gap-6">
            
            <div className="flex flex-col flex-1 gap-6">
                {/* Box 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <h2 className="font-medium">1. Tải ảnh gốc có khuôn mặt</h2>
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
                    cursor-pointer
                    dark:bg-gray-500 dark:text-white">
                        <FiCamera className='text-2xl text-gray-400'></FiCamera>
                        <p className="text-[13px]">Tải lên ảnh hoặc thả nó ở đây</p>
                        <p className="text-[11px] text-gray-400">Định dạng hỗ trợ: jpg, jpeg, png, webp</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <h2 className="font-medium">2. Tải video gốc có khuôn mặt</h2>
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
                    cursor-pointer
                    dark:bg-gray-500 dark:text-white">
                        <FiVideo className='text-2xl text-gray-400'></FiVideo>
                        <p className="text-[13px]">Tải lên video hoặc thả nó ở đây</p>
                        <p className="text-[11px] text-gray-400">Tối đa 5 giây và 30MB</p>
                    </div>
                </div>

            </div>

            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col dark:bg-gray-700">
                <div className="flex-1 rounded-xl bg-gray-100 overflow-hidden relative group">
                    <img 
                        src={videoAI}    
                        alt="Ảnh mẫu" 
                        className="w-full h-full object-cover "
                    />
                </div>
            </div>
        </div>
    );
}
export default VideoSwap;