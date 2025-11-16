import React, { useState, useMemo, useCallback } from 'react';
import { InteractiveNotes, NoteSection, QuizQuestion, TopperNoteSection } from '../types';
import MindMap from './MindMap';
import MindMapExplanation from './MindMapExplanation';
import ThemeSwitcher from './ThemeSwitcher';

const QuizComponent: React.FC<{ questions: QuizQuestion[], title: string }> = ({ questions, title }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
    setShowResult(true);
    if (option === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setIsExiting(true);
    setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            setIsFinished(true);
        }
        setIsExiting(false);
    }, 300);
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
  }

  const animationClass = isExiting ? 'animate-fadeOut' : 'animate-fadeInUp';

  if (isFinished) {
    return (
       <div className="bg-[var(--bg-primary)] p-8 rounded-xl border border-[var(--border-primary)] text-center animate-fadeInUp">
          <h2 className="text-4xl font-bold text-[var(--accent-primary)] font-pen mb-4">Quiz Complete!</h2>
          <p className="text-2xl text-[var(--text-secondary)] mb-6">You scored <span className="font-bold text-[var(--text-primary)]">{score}</span> out of <span className="font-bold text-[var(--text-primary)]">{questions.length}</span></p>
          <button onClick={handleRestart} className="mt-4 bg-[var(--accent-primary)] hover:opacity-80 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95">
              Try Again
          </button>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-primary)] overflow-hidden">
        <h2 className="text-5xl font-bold text-center mb-2 text-[var(--text-primary)] font-pen">{title}</h2>
        <p className="text-center text-[var(--text-secondary)] mb-8">Test your knowledge on what you've learned.</p>
        <div className={animationClass} style={{ animationDuration: '300ms' }} key={currentQuestionIndex}>
            <p className="text-sm font-semibold text-[var(--accent-primary)] mb-2 font-pencil">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <h4 className="text-3xl font-bold mb-6 text-[var(--text-primary)] font-pen">{currentQuestion.question}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-pencil">
                {currentQuestion.options.map((option) => (
                    <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`p-4 rounded-lg text-left transition-all duration-300 transform disabled:cursor-not-allowed border text-[var(--text-primary)] ${
                        !showResult 
                            ? 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:shadow-md' 
                            : option === currentQuestion.correctAnswer 
                                ? 'bg-green-200 text-green-800 border-green-400 shadow-lg' 
                                : option === selectedAnswer 
                                    ? 'bg-red-200 text-red-800 border-red-400' 
                                    : 'bg-[var(--bg-secondary)] opacity-60 border-[var(--border-primary)]'
                        }`}
                        disabled={showResult}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>

        {showResult && (
            <div className="mt-6 text-center animate-fadeInUp font-pencil" style={{animationDuration: '400ms'}}>
                <p className={`font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct!' : `Not quite! The answer is: ${currentQuestion.correctAnswer}`}
                </p>
                <button onClick={handleNext} className="mt-4 bg-[var(--accent-primary)] hover:opacity-80 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95">
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            </div>
        )}
    </div>
  );
};


interface RevisionPageProps {
  notes: InteractiveNotes;
  onBack: () => void;
}

type RevisionView = 'map' | 'quiz';

// Adapter function to convert new TopperNoteSection to old NoteSection for compatibility
const mapToLegacySection = (section: TopperNoteSection): NoteSection => ({
    title: section.title,
    contentBlocks: [{ items: section.topicSummary }],
    eli5: section.definition, // Use definition as a stand-in for eli5
    keyVocabulary: section.keyFormulas?.content.map(f => ({ term: f, definition: 'A key formula or term.'})) || [],
    knowledgeCheck: undefined, // No direct equivalent
});


const RevisionPage: React.FC<RevisionPageProps> = ({ notes, onBack }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [view, setView] = useState<RevisionView>('map');

    const selectedSection = useMemo(() => {
        if (!selectedNodeId) return null;
        const topperSection = notes.sections.find(s => s.title === selectedNodeId);
        return topperSection ? mapToLegacySection(topperSection) : null;
    }, [selectedNodeId, notes.sections]);

    const handleNodeSelect = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
        setView('map'); // Ensure map explanation is visible when a node is selected
    }, []);

    return (
        <div className="w-full max-w-full mx-auto animate-fadeInUp h-full">
            <header className="flex justify-between items-center mb-4 px-2">
                 <button onClick={onBack} className="flex items-center justify-center gap-2 bg-[var(--bg-secondary-translucent)] backdrop-blur-sm hover:bg-[var(--bg-hover)] px-4 py-2 rounded-lg transition-colors font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to Notes
                </button>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-[var(--bg-secondary-translucent)] backdrop-blur-sm p-1 rounded-lg border border-[var(--border-primary)]">
                        <button onClick={() => setView('map')} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${view === 'map' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>
                            Revision Map
                        </button>
                        <button onClick={() => setView('quiz')} className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${view === 'quiz' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>
                            Final Quiz
                        </button>
                    </div>
                </div>
                 <ThemeSwitcher />
            </header>

            <div className="flex h-[85vh] bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-2xl overflow-hidden">
                <div className="w-2/3 border-r border-[var(--border-primary)]">
                     <MindMap 
                        path={notes.learningPath}
                        onNodeSelect={handleNodeSelect}
                        selectedNodeId={selectedNodeId}
                     />
                </div>
                <aside className="w-1/3 overflow-y-auto">
                    {view === 'map' ? (
                        <MindMapExplanation 
                            section={selectedSection}
                            fullContext={notes.title}
                        />
                    ) : (
                        <div className="p-8 h-full flex items-center justify-center">
                            <QuizComponent questions={notes.quiz} title="Final Challenge" />
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default RevisionPage;