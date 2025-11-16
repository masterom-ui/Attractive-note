import React, { useState } from 'react';
import { ModelDescription } from '../types';
import { CubeIcon } from './icons/CubeIcon';

interface InteractiveModelProps {
    model: ModelDescription;
}

const InteractiveModel: React.FC<InteractiveModelProps> = ({ model }) => {
    const [isPaused, setIsPaused] = useState(false);

    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const components = [...model.components]; // Create a mutable copy

    return (
        <div 
            className="mt-8 p-4 sm:p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] shadow-lg animate-fadeInUp font-sans"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <h4 className="text-xl font-bold text-[var(--accent-primary)] mb-3 flex items-center"><CubeIcon /> 3D Model: {model.description}</h4>
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/2 flex items-center justify-center min-h-[16rem] h-64">
                    <div style={{ perspective: '1000px' }}>
                        <div 
                            className="relative w-40 h-40" 
                            style={{ 
                                transformStyle: 'preserve-3d', 
                                animation: 'spin 20s infinite linear',
                                animationPlayState: isPaused ? 'paused' : 'running'
                            }}
                        >
                            {faces.map((face, index) => {
                                const component = components.shift() || { name: 'Face', description: 'A side of the model.'};
                                const transform = {
                                    front: 'rotateY(0deg) translateZ(80px)',
                                    back: 'rotateY(180deg) translateZ(80px)',
                                    right: 'rotateY(90deg) translateZ(80px)',
                                    left: 'rotateY(-90deg) translateZ(80px)',
                                    top: 'rotateX(90deg) translateZ(80px)',
                                    bottom: 'rotateX(-90deg) translateZ(80px)',
                                }[face] || '';

                                return (
                                    <div 
                                        key={face}
                                        className="absolute w-40 h-40 border border-[var(--accent-primary)]/50 bg-[var(--bg-secondary-translucent)]/80 backdrop-blur-sm flex items-center justify-center p-2 text-center"
                                        style={{ transform }}
                                    >
                                        <span className="text-sm font-bold text-[var(--text-primary)]">{component.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                     <h5 className="font-semibold text-[var(--text-primary)] mb-2">Key Components:</h5>
                        <ul className="space-y-3 pl-2">
                            {model.components.map((comp, i) => (
                                <li key={i} className="text-sm text-[var(--text-tertiary)] leading-snug">
                                    <strong className="font-semibold text-[var(--text-secondary)]">{comp.name}:</strong> {comp.description}
                                </li>
                            ))}
                        </ul>
                </div>
            </div>
             <p className="text-xs text-center mt-4 text-[var(--text-tertiary)] italic">Hover over the model to pause the animation.</p>

        </div>
    );
};

export default InteractiveModel;