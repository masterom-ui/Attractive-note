import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface KnowledgeCheckProps {
    question: QuizQuestion;
    onCorrect: () => void;
    isCompleted: boolean;
}

const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({ question, onCorrect, isCompleted }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(isCompleted);
    const [isWrong, setIsWrong] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        setSelectedAnswer(null);
        setShowResult(isCompleted);
        setIsWrong(false);
    }, [question, isCompleted]);

    const handleAnswerSelect = (option: string) => {
        if (showResult) return;
        setSelectedAnswer(option);
        setShowResult(true);
        if (option === question.correctAnswer) {
            onCorrect();
            setIsWrong(false);
        } else {
            setIsWrong(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };
    
    const handleRetry = () => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsWrong(false);
    }

    if (isCompleted) {
        return (
            <div className="mt-8 p-6 bg-green-500/10 rounded-xl border border-green-500/30 text-center animate-fadeInUp">
                <div className="flex items-center justify-center gap-2 font-bold text-green-400">
                    <CheckCircleIcon/>
                    <span>Knowledge Check Passed!</span>
                </div>
            </div>
        )
    }

    const containerAnimation = shake ? 'animate-shake' : 'animate-fadeInUp';

    return (
        <div className={`mt-8 p-6 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] ${containerAnimation}`}>
            <h4 className="text-2xl font-bold mb-4 text-[var(--text-primary)] font-pen text-center">🧠 Knowledge Check</h4>
            <p className="text-lg text-[var(--text-secondary)] mb-6 text-center">{question.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-pencil">
                {question.options.map((option) => (
                    <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`p-3 rounded-lg text-center transition-all duration-300 transform disabled:cursor-not-allowed border text-[var(--text-primary)] ${
                        !showResult 
                            ? 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:shadow-md' 
                            : option === question.correctAnswer 
                                ? 'bg-green-200/80 text-green-800 border-green-400 shadow-lg' 
                                : option === selectedAnswer 
                                    ? 'bg-red-200/80 text-red-800 border-red-400' 
                                    : 'bg-[var(--bg-secondary)] opacity-50 border-[var(--border-primary)]'
                        }`}
                        disabled={showResult}
                    >
                        {option}
                    </button>
                ))}
            </div>
             {showResult && isWrong && (
                <div className="mt-4 text-center animate-fadeInUp">
                    <p className="font-semibold text-red-400">
                        Not quite! Review the notes above if you're stuck.
                    </p>
                    <button onClick={handleRetry} className="mt-2 bg-[var(--accent-primary)] hover:opacity-80 text-white font-bold py-1 px-4 rounded-lg text-sm">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default KnowledgeCheck;