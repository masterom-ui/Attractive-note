import React, { useState, useRef, useEffect } from 'react';
import { InteractiveDiagram as InteractiveDiagramType } from '../types';

interface InteractiveDiagramProps {
    diagram: InteractiveDiagramType;
    imageUrl: string;
}

const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ diagram, imageUrl }) => {
    const [activeHotspot, setActiveHotspot] = useState<InteractiveDiagramType['hotspots'][0] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveHotspot(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleHotspotClick = (e: React.MouseEvent, hotspot: InteractiveDiagramType['hotspots'][0]) => {
        e.stopPropagation();
        setActiveHotspot(hotspot);
    }

    return (
        <div ref={containerRef} className="my-8 animate-fadeInUp">
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-pen">{diagram.description}</h4>
            <div className="relative w-full aspect-video bg-[var(--bg-tertiary)] rounded-lg shadow-md overflow-hidden">
                <img src={imageUrl} alt={diagram.imageQuery} className="w-full h-full object-contain" />

                {diagram.hotspots.map((hotspot, index) => {
                    const isActive = activeHotspot?.label === hotspot.label;
                    return (
                        <div key={index} style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}>
                            <button
                                onClick={(e) => handleHotspotClick(e, hotspot)}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-sm shadow-lg ring-4 ring-[var(--accent-primary)]/50 transition-transform duration-300 hover:scale-125 focus:outline-none"
                                aria-label={`Info about ${hotspot.label}`}
                            >
                                {index + 1}
                            </button>
                            
                            {/* Popover for active hotspot */}
                            {isActive && (
                                <div
                                    className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-64 z-10 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-2xl p-3 animate-fadeInUp"
                                    style={{ animationDuration: '200ms'}}
                                >
                                    <h5 className="font-bold text-[var(--text-primary)] mb-1">{hotspot.label}</h5>
                                    <p className="text-sm text-[var(--text-secondary)]">{hotspot.description}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-center mt-2 text-[var(--text-tertiary)]">Click the numbered hotspots to learn more.</p>
        </div>
    );
};

export default InteractiveDiagram;