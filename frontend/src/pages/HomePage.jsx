import { useState, useRef } from "react";
import SwapTabs from "../components/swap/SwapTabs";
import ImageSwap from "../components/swap/ImageSwap";
import VideoSwap from "../components/swap/VideoSwap";
import TextToSpeech from "../components/swap/TextToSpeech";
import VideoVoiceCloneLipSync from "../components/swap/VideoVoiceCloneLipSync";
import WhisperSubtitle from "../components/swap/WhisperSubtitle";
import HowToSwap from "../components/home/HowToSwap";
import Introduction from "../components/home/Introduction";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import FAQSection from "../components/home/FAQSection";
import { motion } from "framer-motion";

function HomePage() {
    const [tab, setTab] = useState('video');
    const toolRef = useRef(null);
    const howToRef = useRef(null);

    // Scroll mượt có offset navbar (~68px)
    const scrollToSection = (ref) => {
        if (!ref.current) return;
        const top = ref.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl">

            {/* Hero Section */}
            <HeroSection
                onStartClick={() => scrollToSection(toolRef)}
                onGuideClick={() => scrollToSection(howToRef)}
            />

            {/* Stats Section */}
            <StatsSection />

            {/* Tool Section */}
            <div ref={toolRef} className="w-full scroll-mt-8" id="tool">
                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <SwapTabs tab={tab} setTab={setTab} />
                </div>

                {/* Tab panel */}
                <div className="w-full min-h-[500px]">
                    <motion.div 
                        className={tab === 'image' ? 'block' : 'hidden'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: tab === 'image' ? 1 : 0, y: tab === 'image' ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ImageSwap />
                    </motion.div>

                    <motion.div 
                        className={tab === 'video' ? 'block' : 'hidden'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: tab === 'video' ? 1 : 0, y: tab === 'video' ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <VideoSwap />
                    </motion.div>

                    <motion.div 
                        className={tab === 'tts' ? 'block' : 'hidden'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: tab === 'tts' ? 1 : 0, y: tab === 'tts' ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TextToSpeech />
                    </motion.div>

                    <motion.div 
                        className={tab === 'lipsync' ? 'block' : 'hidden'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: tab === 'lipsync' ? 1 : 0, y: tab === 'lipsync' ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <VideoVoiceCloneLipSync />
                    </motion.div>

                    <motion.div 
                        className={tab === 'whisper' ? 'block' : 'hidden'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: tab === 'whisper' ? 1 : 0, y: tab === 'whisper' ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <WhisperSubtitle />
                    </motion.div>
                </div>
            </div>

            {/* Introduction / Tại sao chọn Hyra AI */}
            <Introduction />

            {/* How To Swap */}
            <div ref={howToRef} id="how-to" className="w-full">
                <HowToSwap tab={tab} />
            </div>

            {/* FAQ */}
            <FAQSection />
        </div>
    );
}

export default HomePage;