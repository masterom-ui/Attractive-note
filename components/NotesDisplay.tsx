import React, { useState } from 'react';
import { InteractiveNotes } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import { RuledIcon } from './icons/RuledIcon';
import { PlainIcon } from './icons/PlainIcon';
import Notebook from './Notebook';

interface NotesDisplayProps {
  notes: InteractiveNotes;
  onBack: () => void;
  onFinish: () => void;
}

export type PaperStyle = 'graph' | 'ruled' | 'plain';

const NotesDisplay: React.FC<NotesDisplayProps> = ({ notes, onBack, onFinish }) => {
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('graph');
  
  return (
    <div className="w-full h-full flex flex-col animate-fadeInUp">
      <header className="flex justify-between items-center mb-4 px-2 flex-shrink-0">
        <div>
          <button onClick={onBack} className="flex items-center justify-center gap-2 bg-[var(--bg-secondary-translucent)] backdrop-blur-sm hover:bg-[var(--bg-hover)] px-4 py-2 rounded-lg transition-colors font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Start Over
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[var(--bg-secondary-translucent)] backdrop-blur-sm p-1 rounded-lg border border-[var(--border-primary)]">
             <button onClick={() => setPaperStyle('graph')} className={`px-3 py-1 rounded-md ${paperStyle === 'graph' ? 'bg-[var(--bg-tertiary)]' : ''}`}><RuledIcon/></button>
             <button onClick={() => setPaperStyle('ruled')} className={`px-3 py-1 rounded-md ${paperStyle === 'ruled' ? 'bg-[var(--bg-tertiary)]' : ''}`}>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
             </button>
             <button onClick={() => setPaperStyle('plain')} className={`px-3 py-1 rounded-md ${paperStyle === 'plain' ? 'bg-[var(--bg-tertiary)]' : ''}`}><PlainIcon/></button>
          </div>
          <ThemeSwitcher />
        </div>
      </header>
      
      <main className="flex-grow">
          <Notebook notes={notes} paperStyle={paperStyle} onFinish={onFinish} />
      </main>
    </div>
  );
};

export default NotesDisplay;