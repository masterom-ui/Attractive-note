import React, { useRef, useState, useMemo, useCallback } from 'react';
import { InteractiveNotes } from '../types';
import { FileDownloadIcon } from './icons/FileDownloadIcon';

// This is a simple parser to handle markdown-like syntax from the AI
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    // Handle headings
    if (text.startsWith('## ')) {
        return <h3>{text.substring(3)}</h3>;
    }
    // Handle bold text
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
        <p>
            {parts.map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
        </p>
    );
};


const OnePageNotes: React.FC<{ notes: InteractiveNotes }> = ({ notes }) => {
    const pageRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const diagramMap = useMemo(() => {
        const map = new Map<string, string>();
        notes.sections.forEach(section => {
            if (section.imageDataUrl) {
                map.set(section.title, section.imageDataUrl);
            }
        });
        return map;
    }, [notes.sections]);

    const handleDownload = async () => {
        setIsDownloading(true);
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        const element = pageRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            backgroundColor: '#fdfdfb', // LaTeX-style background color
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${notes.title.replace(/\s+/g, '_')}_notes.pdf`);
        setIsDownloading(false);
    };

    const renderColumnContent = useCallback((column: string[], startIndex: number) => {
        const content: React.ReactNode[] = [];
        let diagramIndex = startIndex;

        column.forEach((line, index) => {
            const diagramMatch = line.match(/\[DIAGRAM: (.*?)\]/);
            if (diagramMatch) {
                const sectionTitle = diagramMatch[1];
                const imageUrl = diagramMap.get(sectionTitle);
                if (imageUrl) {
                    content.push(
                        <div key={`diag-${sectionTitle}-${index}`} className="my-4 diagram-container">
                            <img src={imageUrl} alt={`Diagram for ${sectionTitle}`} className="w-full h-auto rounded" />
                            <p className="diagram-caption">Fig. {diagramIndex++}: {sectionTitle}</p>
                        </div>
                    );
                }
            } else {
                content.push(<SimpleMarkdown key={index} text={line} />);
            }
        });
        return { content, nextDiagramIndex: diagramIndex };
    }, [diagramMap]);
    
    const { content: col1Content, nextDiagramIndex } = renderColumnContent(notes.onePageSummary?.column1 || [], 1);
    const { content: col2Content } = renderColumnContent(notes.onePageSummary?.column2 || [], nextDiagramIndex);


    return (
        <div className="animate-fadeInUp latex-style-container" style={{animationDuration: '500ms'}}>
            <div className="flex justify-between items-center mb-4">
                 <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] font-pen">One-Page Summary</h2>
                    <p className="text-[var(--text-secondary)]">A condensed view of all key topics, perfect for printing.</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 bg-[var(--accent-primary)] hover:opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                    <FileDownloadIcon />
                    {isDownloading ? 'Generating PDF...' : 'Download as PDF'}
                </button>
            </div>
            
            <div ref={pageRef} className="p-8 latex-style shadow-2xl">
                <header className="text-center mb-8 border-b border-[var(--latex-border)] pb-4">
                    <h1>{notes.title}</h1>
                    <p>{notes.introduction}</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
                    <div className="one-page-column">
                        {col1Content}
                    </div>
                    <div className="one-page-column">
                        {col2Content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnePageNotes;