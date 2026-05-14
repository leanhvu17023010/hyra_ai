import { useState } from "react";
import SwapTabs from "../components/SwapTabs";
import ImageSwap from "../components/ImageSwap";
import VideoSwap from "../components/VideoSwap";
import Introduction from "../components/Introduction";


function HomePage(){
    const [tab, setTab] = useState('video'); 

    return (
        <div className="
        flex 
        flex-col 
        items-center 
        w-full 
        max-w-7xl ">
            <h1 className="
            text-5xl font-extrabold mb-8 text-black dark:text-white">
                Hoán đổi khuôn mặt AI Video & Ảnh trực tuyến 
            </h1>
            <span className="py-5 dark:text-white">Công cụ trực tuyến mạnh mẽ để hoán đổi khuôn mặt này sang khuôn mặt khác một cách liền mạch. 
                Ứng dụng hoán đổi khuôn mặt tốt nhất hiện có.</span>
            
            <div className="mb-8 py-5 ">
            <SwapTabs tab={tab} setTab={setTab} />
            </div>

            <div className="w-full mb-8 py-5">
                {
                 tab === "image" 
                 ? <ImageSwap/> 
                 : <VideoSwap/> }
            </div>

            {/* Phần Giới thiệu & Ưu điểm */}
            <Introduction />
        </div>
    )
}
export default HomePage