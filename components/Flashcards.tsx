import React, { useState, useEffect } from 'react';
import { KeyVocabulary } from '../types';

interface FlashcardsProps {
    terms: KeyVocabulary[];
    onClose: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ terms, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const currentTerm = terms[currentIndex];

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    }

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % terms.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
         setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + terms.length) % terms.length);
        }, 150);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === ' ') {
                e.preventDefault();
                setIsFlipped(f => !f);
            };
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);
    
    const modalAnimation = isExiting ? 'animate-fadeOut' : 'animate-fadeInUp';

    return (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${modalAnimation}`} style={{animationDuration: '300ms'}}>
            <div className="w-full max-w-lg">
                <div className="relative" style={{ perspective: '1000px' }}>
                     <div 
                        className="relative w-full h-80 rounded-xl shadow-2xl transition-transform duration-500"
                        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                        {/* Front of card */}
                        <div className="absolute w-full h-full bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                            <p className="text-sm text-[var(--text-tertiary)] mb-4">Term</p>
                            <h2 className="text-4xl font-bold text-[var(--text-primary)]">{currentTerm.term}</h2>
                            <button onClick={() => setIsFlipped(true)} className="absolute bottom-6 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors">
                                Click or press space to flip
                            </button>
                        </div>
                        {/* Back of card */}
                        <div className="absolute w-full h-full bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] p-8 flex flex-col items-center justify-center text-center overflow-y-auto" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                             <p className="text-sm text-[var(--text-tertiary)] mb-4">Definition</p>
                            <p className="text-lg text-[var(--text-secondary)]">{currentTerm.definition}</p>
                            <button onClick={() => setIsFlipped(false)} className="absolute bottom-6 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors">
                                Click or press space to flip back
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 text-[var(--text-primary)]">
                    <button onClick={handlePrev} className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-lg p-3 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <p className="font-semibold">{currentIndex + 1} / {terms.length}</p>
                    <button onClick={handleNext} className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-lg p-3 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <button onClick={handleClose} className="w-full mt-6 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold py-2 px-4 rounded-lg transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};

export default Flashcards;
