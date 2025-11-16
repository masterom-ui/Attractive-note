import React, { useMemo, useState, useEffect } from 'react';
import { ThoughtBubbleIcon } from './icons/ThoughtBubbleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CircleIcon } from './icons/CircleIcon';

interface DynamicLoadingScreenProps {
  topics: string[];
  status: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
);

const DynamicLoadingScreen: React.FC<DynamicLoadingScreenProps> = ({ topics, status }) => {
    const stages = [
        "Analyzing Material",
        "Extracting Key Topics",
        "Building Notes & Learning Path",
        "Enriching with Media",
        "Finalizing"
    ];

    const currentStageIndex = useMemo(() => {
        if (status.startsWith('✅')) return 4;
        if (status.startsWith('✨') || status.startsWith('🎨') || status.startsWith('🧊') || status.startsWith('🎵')) return 3;
        if (status.startsWith('🗺️')) return 2;
        if (topics.length > 0) return 1;
        if (status.startsWith('Analyzing')) return 0;
        return 0;
    }, [status, topics]);
    
    const titleToType = "Crafting Your Study Guide";
    const [typedTitle, setTypedTitle] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setTypedTitle('');
        setIsTyping(true);
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < titleToType.length) {
                setTypedTitle(prev => prev + titleToType.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false); // Finished typing
            }
        }, 100); // Typing speed in ms

        return () => clearInterval(typingInterval);
    }, []);


    return (
        <div className="flex flex-col items-center justify-center text-center h-full w-full max-w-2xl mx-auto animate-fadeInUp p-4">
             <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)] font-pen h-20 md:h-24 flex items-center justify-center text-center">
                <span>{typedTitle}</span>
                <span className={`${isTyping ? '' : 'blinking-cursor'} ml-1 text-3xl md:text-4xl`}>|</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-12">
                The AI is working its magic. Please wait a moment...
            </p>

            <div className="w-full max-w-md">
                <ul className="space-y-2">
                    {stages.map((stage, index) => {
                        const isCompleted = currentStageIndex > index;
                        const isActive = currentStageIndex === index;

                        return (
                            <li key={stage} className="flex items-start transition-all duration-500">
                                <div className="flex flex-col items-center mr-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--accent-primary)]">
                                        {isCompleted ? <CheckCircleIcon /> : isActive ? <LoadingSpinner /> : <CircleIcon />}
                                    </div>
                                    {index < stages.length - 1 && (
                                        <div className={`w-0.5 h-12 transition-colors duration-500 ${isCompleted ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-primary)]'}`}></div>
                                    )}
                                </div>
                                <div className={`pt-1 transition-opacity duration-500 text-left ${isActive || isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                                    <p className="font-bold text-lg text-[var(--text-primary)]">{stage}</p>
                                    {isActive && topics.length > 0 && index === 1 && (
                                        <div className="text-sm text-[var(--text-secondary)] mt-2 animate-fadeInUp space-y-1">
                                            {topics.map(topic => <p key={topic}>- {topic}</p>)}
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mt-16 w-full max-w-md">
                <div className="bg-[var(--bg-secondary-translucent)] backdrop-blur-sm border border-[var(--border-primary)] rounded-lg p-4 flex items-center justify-center gap-4 shadow-lg">
                    <ThoughtBubbleIcon />
                    <p className="text-[var(--text-secondary)] text-sm">{status}</p>
                </div>
            </div>
        </div>
    );
};

export default DynamicLoadingScreen;