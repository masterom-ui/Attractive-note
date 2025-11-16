import React, { useState, useRef } from 'react';
import { explainImageRegion } from '../services/geminiService';

interface PopoverState {
    content: string;
    isLoading: boolean;
    position: { top: number; left: number } | null;
}

interface InteractiveImageProps {
    imageUrl: string;
    imageQuery: string;
    context: string;
}

const InteractiveImage: React.FC<InteractiveImageProps> = ({ imageUrl, imageQuery, context }) => {
    const [popover, setPopover] = useState<PopoverState>({ content: '', isLoading: false, position: null });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleImageClick = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current || !containerRef.current) return;
        if (popover.isLoading) return; // Prevent multiple clicks while loading

        const rect = imageRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Ensure click is within image bounds
        if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // Position popover/loader relative to the container div
        const containerRect = containerRef.current.getBoundingClientRect();
        const clickTop = event.clientY - containerRect.top;
        const clickLeft = event.clientX - containerRect.left;

        setPopover({
            isLoading: true,
            content: '',
            position: { top: clickTop, left: clickLeft }
        });

        try {
            const explanation = await explainImageRegion(imageUrl, { x: xPercent, y: yPercent }, context);
            setPopover(p => ({ ...p, isLoading: false, content: explanation }));
        } catch (error) {
            console.error(error);
            setPopover(p => ({ ...p, isLoading: false, content: 'Could not get an explanation.' }));
        }
    };

    const closePopover = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setPopover({ isLoading: false, content: '', position: null });
    };

    return (
        <div className="my-8 animate-fadeInUp">
            <div 
                ref={containerRef}
                className="relative w-full aspect-video bg-[var(--bg-tertiary)] rounded-lg shadow-md overflow-hidden group cursor-crosshair"
                onClick={handleImageClick}
            >
                <img 
                    ref={imageRef}
                    src={imageUrl} 
                    alt={imageQuery} 
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                     <p className="text-white text-lg font-bold font-pen drop-shadow-lg text-center p-4">Click any part of the image to explain</p>
                </div>

                {popover.position && (
                    <div 
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ top: popover.position.top, left: popover.position.left }}
                    >
                        {popover.isLoading ? (
                            <div className="w-8 h-8 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin bg-[var(--bg-secondary-translucent)]"></div>
                        ) : (
                             <div 
                                className="absolute -translate-x-1/2 -translate-y-[calc(100%+1rem)] w-64 z-20 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-2xl p-3 animate-fadeInUp"
                                style={{ animationDuration: '200ms'}}
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking popover
                            >
                                <button onClick={closePopover} className="absolute top-1 right-2 text-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">&times;</button>
                                <p className="text-sm text-[var(--text-secondary)] pr-4">{popover.content}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-center mt-2 text-[var(--text-tertiary)]">Visual concept: "{imageQuery}". Click the image for an AI explanation.</p>
        </div>
    );
};

export default InteractiveImage;