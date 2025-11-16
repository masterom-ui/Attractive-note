import React from 'react';
import { TopperNoteSection, PastQuestion } from '../types';

interface TopperNotesLayoutProps {
    section: TopperNoteSection;
}

const PYQCard: React.FC<{ pyq: PastQuestion }> = ({ pyq }) => (
    <div className="border border-[var(--border-primary)] rounded-lg p-3 mt-2 text-sm">
        <p className="font-semibold text-[var(--text-primary)]"><span className="highlight-green">[{pyq.type}]</span> {pyq.question}</p>
        <p className="text-[var(--text-secondary)] mt-1">{pyq.answer}</p>
    </div>
)

const TopperNotesLayout: React.FC<TopperNotesLayoutProps> = ({ section }) => {
    return (
        <div className="topper-note-section">
            <h2 className="text-4xl font-pen font-bold text-center text-[var(--text-primary)] mb-6">{section.title}</h2>
            
            {/* 1. Definition */}
            <div className="highlight-yellow mb-4">
                <p><strong>Definition:</strong> {section.definition}</p>
            </div>

            {/* 2. Key Formula / Terms */}
            {section.keyFormulas && (
                <div className="formula-box highlight-pink">
                    <h3 className="text-lg font-bold mt-0 border-b-0 pb-0 mb-2">{section.keyFormulas.title}</h3>
                    <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                        {section.keyFormulas.content.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            )}
            
            {/* 3. Examples */}
            {section.examples && section.examples.length > 0 && (
                 <div>
                    <h3>Examples</h3>
                    {section.examples.map((ex, i) => (
                        <div key={i} className="mb-2 p-3 bg-[var(--bg-secondary)] rounded-md">
                             <p className="font-semibold text-[var(--text-primary)]">{ex.type} Example:</p>
                             <p className="text-sm text-[var(--text-secondary)]">{ex.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* 4. Diagram */}
            {section.diagram && (
                 <div className="my-4 text-center">
                    <h3>Diagram: {section.diagram.imageQuery}</h3>
                     {section.imageDataUrl ? (
                        <img src={section.imageDataUrl} alt={section.diagram.imageQuery} className="w-full h-auto object-contain rounded-lg border border-[var(--border-primary)] shadow-sm" />
                    ) : (
                        <div className="w-full aspect-video bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center animate-pulse">
                            <div className="text-[var(--text-tertiary)] text-sm">Generating Diagram...</div>
                        </div>
                    )}
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Labels: {section.diagram.labels.join(', ')}</p>
                </div>
            )}

            {/* 5. PYQs */}
            {section.pyqs && section.pyqs.length > 0 && (
                <div className="pyq-section">
                    <h3>Past Year Questions</h3>
                    {section.pyqs.map((pyq, i) => <PYQCard key={i} pyq={pyq} />)}
                </div>
            )}
            
            {/* 6. Common Mistakes */}
            {section.commonMistakes && section.commonMistakes.length > 0 && (
                <div className="mistake-box mt-4">
                     <h4 className="font-bold text-red-500">Common Mistakes</h4>
                     <ul className="list-disc list-inside space-y-1 text-red-500/80 text-sm mt-1">
                        {section.commonMistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
                    </ul>
                </div>
            )}
            
            {/* 7. One-Shot Summary */}
            <div className="mt-6">
                <h3 className="text-lg font-bold">Topic Summary</h3>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                    {section.topicSummary.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
            </div>
        </div>
    );
};

export default TopperNotesLayout;
