import { useState, useRef } from 'react';
import videoAI from '../assets/Images/videoAI.webp';
import { FiCamera, FiVideo } from 'react-icons/fi';
import swapService from '../services/swapService';

function VideoSwap() {
    const [sourceImage, setSourceImage] = useState(null);
    const [targetVideo, setTargetVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [resultVideoSrc, setResultVideoSrc] = useState(null)

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSourceImage(e.target.files[0]);
        }
    };

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setTargetVideo(e.target.files[0]);
        }
    };

    const handleSwap = async () => {
        if (!sourceImage || !targetVideo) {
            setMessage('Vui lòng chọn cả ảnh và video gốc.');
            return;
        }

        try {
            setIsLoading(true);
            setMessage('Đang khởi tạo phiên...');
            
            // 1. Tạo session SwapTask
            const taskResponse = await swapService.createSwapTask();
            const taskId = taskResponse.result;

            if (!taskId) {
                throw new Error('Không thể tạo phiên làm việc.');
            }

            // 2. Tải ảnh lên
            setMessage('Đang tải ảnh lên...');
            await swapService.uploadMediaToTask(sourceImage, taskId);

            // 3. Tải video lên (Khi tải xong, BE sẽ tự động trigger processing)
            setMessage('Đang tải video lên...');
            await swapService.uploadMediaToTask(targetVideo, taskId);

            setMessage('Tải lên thành công! Đang xử lý bằng AI... Vui lòng đợi.');
            

        } catch (error) {
            console.error('Lỗi khi swap:', error);
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý.');
            setIsLoading(false);
        }
        // Xóa block finally để giữ trạng thái loading khi đang chờ setTimeout
    };

    return (
        <div className="flex flex-col lg:flex-row w-full gap-6">
            
            <div className="flex flex-col flex-1 gap-6">
                {/* Box 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <h2 className="font-medium">1. Tải ảnh gốc có khuôn mặt</h2>
                    <div 
                        className="
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
                            dark:bg-gray-500 dark:text-white
                            hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                        "
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={imageInputRef}
                            onChange={handleImageChange}
                        />
                        <FiCamera className='text-2xl text-gray-400'></FiCamera>
                        {sourceImage ? (
                            <p className="text-[13px] text-green-600 font-medium mt-2">Đã chọn: {sourceImage.name}</p>
                        ) : (
                            <>
                                <p className="text-[13px] mt-2">Tải lên ảnh hoặc thả nó ở đây</p>
                                <p className="text-[11px] text-gray-400">Định dạng hỗ trợ: jpg, jpeg, png, webp</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Box 2 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <h2 className="font-medium">2. Tải video gốc có khuôn mặt</h2>
                    <div 
                        className="
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
                            dark:bg-gray-500 dark:text-white
                            hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                        "
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept="video/*" 
                            className="hidden" 
                            ref={videoInputRef}
                            onChange={handleVideoChange}
                        />
                        <FiVideo className='text-2xl text-gray-400'></FiVideo>
                        {targetVideo ? (
                            <p className="text-[13px] text-green-600 font-medium mt-2">Đã chọn: {targetVideo.name}</p>
                        ) : (
                            <>
                                <p className="text-[13px] mt-2">Tải lên video hoặc thả nó ở đây</p>
                                <p className="text-[11px] text-gray-400">Tối đa 5 giây và 30MB</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                     <button 
                        onClick={handleSwap}
                        disabled={isLoading || !sourceImage || !targetVideo}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                     >
                        {isLoading ? 'Đang xử lý...' : 'Bắt đầu Swap'}
                     </button>
                     {message && (
                         <p className={`mt-3 text-sm text-center ${message.includes('thành công') ? 'text-green-600' : 'text-blue-600'} dark:text-blue-300`}>
                             {message}
                         </p>
                     )}
                </div>

            </div>

            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col dark:bg-gray-700">
                <div className="flex-1 rounded-xl bg-gray-100 overflow-hidden relative group flex items-center justify-center">
                    {resultVideoSrc ? (
                        <video 
                            src={resultVideoSrc} 
                            controls 
                            autoPlay
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <>
                            <img 
                                src={videoAI}    
                                alt="Ảnh mẫu" 
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-50' : ''}`}
                            />
                            {isLoading && message.includes('Đang xử lý') && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 font-medium text-blue-600 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm dark:bg-gray-800/80 dark:text-blue-400">
                                        AI đang xử lý video...
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoSwap;