import { useState } from "react";
import SwapTabs from "../components/SwapTabs";
import ImageSwap from "../components/ImageSwap";
import VideoSwap from "../components/VideoSwap";

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
            <button 
            className="
            mt-8 
            bg-[#5b6ef7] 
            hover:bg-[#4a5ce6] text-white 
            font-semibold py-3 px-12 
            rounded-lg text-lg mb-10 transition-colors
            dark:bg-[#11229c] dark:hover:bg-[#1128b9] cursor-pointer"> 
                Kết quả
            </button>
        </div>
    )
}
export default HomePage