import React, { useState, useMemo } from 'react';
import { InteractiveNotes, TopperNoteSection } from '../types';
import { PaperStyle } from './NotesDisplay';
import Page from './Page';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import TopperNotesLayout from './TopperNotesLayout';
import { MindMapIcon } from './icons/MindMapIcon';

interface NotebookProps {
    notes: InteractiveNotes;
    paperStyle: PaperStyle;
    onFinish: () => void;
}

const ChapterFrontPage: React.FC<{ notes: InteractiveNotes }> = ({ notes }) => (
    <div className="h-full flex flex-col items-center justify-center text-center notebook-cover p-8">
        <h1 className="text-5xl md:text-7xl font-pen font-bold text-[var(--text-primary)] mb-8">{notes.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            <div className="bg-[var(--bg-secondary-translucent)] p-4 rounded-lg">
                <h2 className="font-bold text-lg text-[var(--accent-primary)] mb-2">Exam Weightage</h2>
                <p className="text-sm text-[var(--text-secondary)]">{notes.weightage}</p>
            </div>
            <div className="bg-[var(--bg-secondary-translucent)] p-4 rounded-lg">
                <h2 className="font-bold text-lg text-[var(--accent-primary)] mb-2">High-Risk Topics</h2>
                <ul className="text-sm text-left list-disc list-inside text-[var(--text-secondary)]">
                    {notes.highRiskTopics.map(topic => <li key={topic}>{topic}</li>)}
                </ul>
            </div>
            <div className="bg-[var(--bg-secondary-translucent)] p-4 rounded-lg">
                <h2 className="font-bold text-lg text-[var(--accent-primary)] mb-2">Past Questions</h2>
                 <ul className="text-sm text-left list-disc list-inside text-[var(--text-secondary)]">
                    {notes.pyqHeadlines.map(q => <li key={q}>{q}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const MindMapPage: React.FC<{ notes: InteractiveNotes }> = ({ notes }) => (
     <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-4xl font-pen font-bold text-[var(--accent-primary)] mb-4 flex items-center gap-2"><MindMapIcon/> Chapter Mind Map</h2>
        {notes.mindMapImageDataUrl ? (
            <img src={notes.mindMapImageDataUrl} alt="Mind Map" className="w-full h-auto max-h-[80%] object-contain rounded-lg shadow-md" />
        ) : (
            <div className="w-full h-full max-h-[80%] bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center animate-pulse">
                <p className="text-[var(--text-tertiary)]">Generating Mind Map...</p>
            </div>
        )}
     </div>
);

const EndPage: React.FC<{ onFinish: () => void, title: string }> = ({ onFinish, title }) => (
     <div className="h-full flex flex-col items-center justify-center text-center notebook-cover p-8">
        <h1 className="text-5xl md:text-6xl font-pen font-bold text-[var(--text-primary)] mb-4">End of Chapter: {title}</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">You've reviewed all the core material. Ready to test your knowledge?</p>
        <button 
            onClick={onFinish}
            className="bg-[var(--accent-primary)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
        >
            Continue to Revision Hub &rarr;
        </button>
    </div>
)

const Notebook: React.FC<NotebookProps> = ({ notes, paperStyle, onFinish }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const pages = useMemo(() => {
        const generatedPages: React.ReactNode[][] = [];
        // Page 0: Cover & Mindmap
        generatedPages.push([<ChapterFrontPage notes={notes} />, <MindMapPage notes={notes}/>]);

        // Group sections into pages (front and back)
        for (let i = 0; i < notes.sections.length; i += 2) {
            const front = <TopperNotesLayout section={notes.sections[i]} />;
            const back = notes.sections[i+1] ? <TopperNotesLayout section={notes.sections[i+1]} /> : <div></div>;
            generatedPages.push([front, back]);
        }
        
        // Add special sections
        // For simplicity, each special section gets its own page side for now.
        const specialSections: {title: string, content: React.ReactNode}[] = [];
        if(notes.giveReasonBank) specialSections.push({title: "Give Reason Bank", content: <div><h3>Give Reason Bank</h3><ul>{notes.giveReasonBank.map(item => <li key={item.question}><strong>{item.question}</strong><p>{item.answer}</p></li>)}</ul></div>})
        if(notes.formulaSheet) specialSections.push({title: "Formula Sheet", content: <div><h3>Formula Sheet</h3><ul>{notes.formulaSheet.map(item => <li key={item.formula}><strong>{item.formula}</strong><p>{item.variables} -> {item.example}</p></li>)}</ul></div>})
        
        for (let i = 0; i < specialSections.length; i += 2) {
            const front = specialSections[i] ? specialSections[i].content : <div></div>;
            const back = specialSections[i+1] ? specialSections[i+1].content : <div></div>;
            generatedPages.push([front, back]);
        }
        
        // Final Page
        generatedPages.push([<EndPage onFinish={onFinish} title={notes.title} />, <div></div>]);

        return generatedPages;
    }, [notes, onFinish]);

    const totalPages = pages.length;

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(p => p + 1);
        }
    };
    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(p => p - 1);
        }
    };

    return (
        <div className="h-full w-full flex flex-col items-center">
            <div className="notebook-container flex-grow">
                <div className="notebook">
                    {pages.map(([front, back], index) => (
                        <Page 
                            key={index}
                            isFlipped={currentPage > index}
                            frontContent={front}
                            backContent={back}
                            paperStyle={paperStyle}
                            zIndex={totalPages - index}
                        />
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0 mt-4 flex items-center justify-center gap-4">
                 <button onClick={handlePrev} disabled={currentPage === 0} className="p-2 disabled:opacity-30 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--bg-hover)]"><ChevronLeftIcon/></button>
                 <span className="text-sm font-semibold text-[var(--text-secondary)]">Page {currentPage + 1} of {totalPages}</span>
                 <button onClick={handleNext} disabled={currentPage === totalPages - 1} className="p-2 disabled:opacity-30 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--bg-hover)]"><ChevronRightIcon/></button>
            </div>
        </div>
    );
};

export default Notebook;
