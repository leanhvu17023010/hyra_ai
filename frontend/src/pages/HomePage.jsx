import { useState, useRef } from "react";
import SwapTabs from "../components/swap/SwapTabs";
import ImageSwap from "../components/swap/ImageSwap";
import VideoSwap from "../components/swap/VideoSwap";
import TextToSpeech from "../components/swap/TextToSpeech";
import HowToSwap from "../components/home/HowToSwap";
import Introduction from "../components/home/Introduction";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import FAQSection from "../components/home/FAQSection";

function HomePage() {
    const [tab, setTab] = useState('video');
    const toolRef = useRef(null);

    const scrollToTool = () => {
        toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl">

            {/* Hero Section */}
            <HeroSection onStartClick={scrollToTool} />

            {/* Stats Section */}
            <StatsSection />

            {/* Tool Section */}
            <div ref={toolRef} className="w-full scroll-mt-8" id="tool">
                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <SwapTabs tab={tab} setTab={setTab} />
                </div>

                {/* Tab panel */}
                <div className="w-full">
                    {tab === 'image' && <ImageSwap />}
                    {tab === 'video' && <VideoSwap />}
                    {tab === 'tts'   && <TextToSpeech />}
                </div>
            </div>

            {/* Introduction / Tại sao chọn Hyra AI */}
            <Introduction />

            {/* How To Swap */}
            <div id="how-to" className="w-full scroll-mt-8">
                <HowToSwap tab={tab} />
            </div>

            {/* FAQ */}
            <FAQSection />
        </div>
    );
}

export default HomePage;