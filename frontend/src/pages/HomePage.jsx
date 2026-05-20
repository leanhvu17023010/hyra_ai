import { useState } from "react";
import SwapTabs from "../components/SwapTabs";
import ImageSwap from "../components/ImageSwap";
import VideoSwap from "../components/VideoSwap";
import TextToSpeech from "../components/TextToSpeech";
import HowToSwap from "../components/HowToSwap";
import Introduction from "../components/Introduction";


function HomePage(){
    const [tab, setTab] = useState('video'); 

    const titles = {
        image: 'Hoán đổi khuôn mặt AI trên Ảnh trực tuyến',
        video: 'Hoán đổi khuôn mặt AI Video trực tuyến',
        tts:   'Chuyển văn bản thành giọng nói AI',
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl">
            <h1 className="text-5xl font-extrabold mb-8 text-black dark:text-white text-center">
                {titles[tab]}
            </h1>
            <span className="py-5 dark:text-white text-center">
                {tab === 'tts'
                    ? 'Nhập văn bản và chọn giọng đọc để tạo ra âm thanh nghe tự nhiên trong vài giây.'
                    : 'Công cụ trực tuyến mạnh mẽ để hoán đổi khuôn mặt này sang khuôn mặt khác một cách liền mạch.'}
            </span>
            
            <div className="mb-8 py-5">
                <SwapTabs tab={tab} setTab={setTab} />
            </div>

            <div className="w-full mb-4 py-5">
                {tab === 'image' && <ImageSwap />}
                {tab === 'video' && <VideoSwap />}
                {tab === 'tts'   && <TextToSpeech />}
            </div>


            {/* Phần Giới thiệu & Ưu điểm */}
            <Introduction />

            {/* Hướng dẫn cách swap */}
            <HowToSwap tab={tab} />
        </div>
    )
}
export default HomePage