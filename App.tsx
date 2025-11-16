import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import DynamicLoadingScreen from './components/DynamicLoadingScreen';
import NotesDisplay from './components/NotesDisplay';
import { generateNotesWithProgress } from './services/geminiService';
import { InteractiveNotes, TopperNoteSection } from './types';
import RevisionPage from './components/RevisionPage';

type AppView = 'landing' | 'loading' | 'notes' | 'revision';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [loadingTopics, setLoadingTopics] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [notesData, setNotesData] = useState<InteractiveNotes | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = useCallback(async (pdfFile: File | null, videoUrl: string) => {
    if (view !== 'landing') return;

    setView('loading');
    setLoadingTopics([]);
    setAiStatus('Initializing...');
    setError(null);
    setNotesData(null);

    try {
      const baseNotes = await generateNotesWithProgress(pdfFile, videoUrl, {
        onTopicsExtracted: (topics) => setLoadingTopics(topics),
        onStatusUpdate: (status) => setAiStatus(status),
        // This is now handled internally by enrichment
        onSectionUpdate: () => {},
      });
      
      setNotesData(baseNotes);
      setView('notes');

    } catch (err) {
      console.error(err);
      setError('Failed to generate notes. Please check the inputs and try again.');
      setView('landing');
    }
  }, [view]);

  const handleBack = () => {
    setView('landing');
    setNotesData(null);
    setError(null);
    setAiStatus('');
    setLoadingTopics([]);
  };
  
  const handleFinishNotes = useCallback(() => {
    setView('revision');
  }, []);

  const handleBackToNotes = useCallback(() => {
    setView('notes');
  }, []);


  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <DynamicLoadingScreen key="loading" topics={loadingTopics} status={aiStatus} />;
      case 'notes':
        return notesData ? <NotesDisplay key="notes" notes={notesData} onBack={handleBack} onFinish={handleFinishNotes} /> : null;
      case 'revision':
        return notesData ? <RevisionPage key="revision" notes={notesData} onBack={handleBackToNotes} /> : null;
      case 'landing':
      default:
        return <LandingPage key="landing" onGenerate={handleGenerate} error={error} />;
    }
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center transition-all duration-500">
      {renderContent()}
    </div>
  );
};

export default App;