import { useRef, useState } from 'react';
import ImageAI from '../assets/Images/ImageAI.jpg';
import { FiCamera } from 'react-icons/fi';
import swapService from '../services/swapService';
import SwapProcessingOverlay from './SwapProcessingOverlay';
import { useSwapTaskPolling } from '../hooks/useSwapTaskPolling';

function ImageSwap() {
    const [sourceImage, setSourceImage] = useState(null);
    const [targetImage, setTargetImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [resultImageSrc, setResultImageSrc] = useState(null);

    const imageInputRef = useRef(null);
    const targetImageInputRef = useRef(null);

    const { startPolling, stopPolling } = useSwapTaskPolling({
        onProgress: (pct) => {
            setProgress(pct);
            setMessage(`AI đang xử lý ảnh... ${pct}%`);
        },
        onComplete: async (_taskId, task) => {
            if (!task?.resultUrl) {
                setMessage('Xử lý xong nhưng chưa có file kết quả. Vui lòng thử lại.');
                setIsLoading(false);
                return;
            }
            const blobUrl = await swapService.getResultBlobUrlFromPath(task.resultUrl);
            swapService.saveCompletedTaskToHistory(_taskId, task.resultUrl, 'image');
            setResultImageSrc(blobUrl);
            setProgress(100);
            setMessage('Xử lý thành công!');
            setIsLoading(false);
        },
        onFailed: () => {
            setMessage('AI xử lý thất bại. Vui lòng thử lại.');
            setIsLoading(false);
        },
        onTimeout: () => {
            setMessage('Quá thời gian chờ AI xử lý. Vui lòng thử lại sau.');
            setIsLoading(false);
        },
    });

    const handleImageChange = (e) => {
        if (e.target.files?.length > 0) {
            setSourceImage(e.target.files[0]);
        }
    };

    const handleTargetImageChange = (e) => {
        if (e.target.files?.length > 0) {
            setTargetImage(e.target.files[0]);
        }
    };

    const handleSwap = async () => {
        if (!sourceImage || !targetImage) {
            setMessage('Vui lòng chọn cả ảnh gốc và ảnh muốn swap.');
            return;
        }
        if (!localStorage.getItem('token')) {
            setMessage('Vui lòng đăng nhập để sử dụng tính năng swap.');
            return;
        }

        try {
            setIsLoading(true);
            setProgress(0);
            setMessage('Đang khởi tạo phiên...');

            const taskResponse = await swapService.createSwapTask();
            const taskId = taskResponse.result;

            if (!taskId) {
                throw new Error('Không thể tạo phiên làm việc.');
            }

            setMessage('Đang tải ảnh lên...');
            await swapService.uploadMediaToTask(sourceImage, taskId);
            await swapService.uploadMediaToTask(targetImage, taskId);

            setMessage('Tải lên thành công! Đang xử lý bằng AI... 0%');
            startPolling(taskId);
        } catch (error) {
            console.error('Lỗi khi swap:', error);
            stopPolling();
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row w-full gap-6">
            <div className="flex flex-col flex-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <h2 className="font-medium">1. Tải lên hình ảnh gốc có khuôn mặt</h2>
                    <div
                        className="border-dashed outline-dashed outline-2 outline-gray-300 border-gray-200 rounded-xl bg-[#fafafa] flex flex-col items-center justify-center py-10 cursor-pointer dark:bg-gray-500 dark:text-white"
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={imageInputRef}
                            onChange={handleImageChange}
                        />
                        <FiCamera className="text-2xl text-gray-400" />
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

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <h2 className="font-medium">2. Tải lên ảnh khuôn mặt</h2>
                    <div
                        className="border-dashed outline-dashed outline-2 outline-gray-300 border-gray-200 rounded-xl bg-[#fafafa] flex flex-col items-center justify-center py-10 cursor-pointer dark:bg-gray-500 dark:text-white"
                        onClick={() => targetImageInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={targetImageInputRef}
                            onChange={handleTargetImageChange}
                        />
                        <FiCamera className="text-2xl text-gray-400" />
                        {targetImage ? (
                            <p className="text-[13px] text-green-600 font-medium mt-2">Đã chọn: {targetImage.name}</p>
                        ) : (
                            <>
                                <p className="text-[13px] mt-2">Tải lên ảnh muốn hoán đổi hoặc thả nó ở đây</p>
                                <p className="text-[11px] text-gray-400">Định dạng hỗ trợ: jpg, jpeg, png, webp</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-700 dark:text-white">
                    <button
                        onClick={handleSwap}
                        disabled={isLoading || !sourceImage || !targetImage}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Bắt đầu Swap'}
                    </button>
                    {message && (
                        <p
                            className={`mt-3 text-sm text-center ${message.includes('thành công') ? 'text-green-600' : 'text-blue-600'} dark:text-blue-300`}
                        >
                            {message}
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-[900px] bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col dark:bg-gray-700">
                <div className="flex-1 rounded-xl bg-gray-100 overflow-hidden relative group flex items-center justify-center">
                    {resultImageSrc ? (
                        <img src={resultImageSrc} alt="Kết quả swap" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <>
                            <img
                                src={ImageAI}
                                alt="Ảnh mẫu"
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-50' : ''}`}
                            />
                            {isLoading && !resultImageSrc && (
                                <SwapProcessingOverlay progress={progress} label="AI đang xử lý ảnh..." />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImageSwap;
