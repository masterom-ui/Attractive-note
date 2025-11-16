import React, { useState, useEffect } from 'react';
import { NoteSection, KeyVocabulary } from '../types';
import { generateMindMapExplanation } from '../services/geminiService';
import { ChildIcon } from './icons/ChildIcon';
import { VocabIcon } from './icons/VocabIcon';

interface MindMapExplanationProps {
    section: NoteSection | null;
    fullContext: string;
}

const LoadingSkeleton: React.FC = () => (
    <div className="p-6 animate-pulse">
        <div className="h-8 bg-[var(--bg-hover)] rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-[var(--bg-hover)] rounded w-full mb-3"></div>
        <div className="h-4 bg-[var(--bg-hover)] rounded w-5/6 mb-3"></div>
        <div className="h-4 bg-[var(--bg-hover)] rounded w-full mb-8"></div>
        <div className="h-6 bg-[var(--bg-hover)] rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/2 mb-3"></div>
    </div>
)

const MindMapExplanation: React.FC<MindMapExplanationProps> = ({ section, fullContext }) => {
    const [explanation, setExplanation] = useState<Partial<NoteSection> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (section) {
            const fetchExplanation = async () => {
                setIsLoading(true);
                setExplanation(null);
                const result = await generateMindMapExplanation(section.title, fullContext);
                setExplanation(result);
                setIsLoading(false);
            };
            fetchExplanation();
        } else {
            setExplanation(null);
        }
    }, [section, fullContext]);

    if (!section) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">
                <div className="w-16 h-16 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 opacity-30">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold font-pen text-[var(--text-secondary)]">Select a Node</h3>
                <p className="max-w-xs mx-auto">Click on a topic in the mind map to see a detailed explanation and study tools.</p>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!explanation) {
        return (
             <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">
                <p>Could not load explanation.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-4xl font-bold text-[var(--accent-primary)] mb-4 font-pen">{explanation.title || section.title}</h2>

            {explanation.contentBlocks?.map((block, index) => (
                <div key={index} className="mb-4">
                    {block.title && <h4 className="font-bold text-lg mb-2 text-[var(--text-primary)]">{block.title}</h4>}
                    <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                        {block.items.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
            
            {explanation.eli5 && (
                <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                    <h4 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]"><ChildIcon /> Explain Like I'm 5</h4>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{explanation.eli5}</p>
                </div>
            )}
            
            {explanation.keyVocabulary && explanation.keyVocabulary.length > 0 && (
                <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                    <h4 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]"><VocabIcon /> Key Vocabulary</h4>
                    <ul className="mt-2 space-y-2">
                        {explanation.keyVocabulary.map(v => (
                            <li key={v.term} className="text-sm">
                                <strong className="text-[var(--text-secondary)]">{v.term}:</strong> 
                                <span className="text-[var(--text-tertiary)]"> {v.definition}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// FIX: Added default export to resolve import error.
export default MindMapExplanation;
