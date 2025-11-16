import React, { useState, useCallback, useRef } from 'react';
import { PdfIcon } from './icons/PdfIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface LandingPageProps {
  onGenerate: (pdfFile: File | null, videoUrl: string) => void;
  error: string | null;
}

// Debounce hook
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<number | null>(null);
    return (...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

const LandingPage: React.FC<LandingPageProps> = ({ onGenerate, error }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [localError, setLocalError] = useState('');

  const isValidYouTubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const triggerGeneration = useCallback((file: File | null, url: string) => {
    if (!file && !url) return;

    if (!file && url && !isValidYouTubeUrl(url)) {
      setLocalError('Please enter a valid YouTube URL.');
      return;
    }
    setLocalError('');
    onGenerate(file, url);
  }, [onGenerate]);

  const debouncedGenerate = useDebounce(triggerGeneration, 800);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPdfFile(file);
      setVideoUrl(''); // Prioritize file: clear other input
      setLocalError('');
      triggerGeneration(file, ''); // Trigger immediately
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
    
    // Prioritize URL input: clear file if user types here
    if (pdfFile) {
        setPdfFile(null);
    }

    if (newUrl === '') {
        setLocalError('');
        return; // Don't trigger generation on empty input
    }

    if (isValidYouTubeUrl(newUrl)) {
        setLocalError('');
        debouncedGenerate(null, newUrl);
    } else {
        setLocalError('Please enter a valid YouTube URL.');
    }
  };


  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center p-4 animate-fadeInUp">
      <div className="bg-[var(--bg-secondary-translucent)] p-5 rounded-full mb-6 shadow-lg transition-transform hover:scale-110 duration-300">
         <SparklesIcon />
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 font-pen text-[var(--text-primary)]">
        Interactive Study Notes AI
      </h1>
      <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl">
        Ready when you are. Just drop a PDF or paste a YouTube link to begin.
      </p>

      <div className="w-full max-w-lg bg-[var(--bg-secondary-translucent)] backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-[var(--border-primary)]">
        <div className="space-y-6">
          <div className="relative">
            <label htmlFor="pdf-upload" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 text-left">
              Upload Chapter PDF
            </label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--border-secondary)] border-dashed rounded-lg cursor-pointer bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)] transition-all duration-300 group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                          <PdfIcon />
                        </div>
                        <p className="mb-2 text-sm text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors duration-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{pdfFile ? pdfFile.name : 'PDF file'}</p>
                    </div>
                    <input id="pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-[var(--text-tertiary)]">
              <div className="flex-grow border-t border-[var(--border-primary)]"></div>
              <span className="flex-shrink mx-4">OR</span>
              <div className="flex-grow border-t border-[var(--border-primary)]"></div>
          </div>


          <div className="relative">
             <label htmlFor="yt-url" className="block text-sm font-medium text-[var(--text-secondary)] mb-2 text-left">
              Paste a YouTube Video Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <YoutubeIcon />
              </div>
              <input
                id="yt-url"
                type="text"
                value={videoUrl}
                onChange={handleUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        {(error || localError) && (
          <p className="mt-4 text-red-400 text-sm animate-fadeInUp h-5">{error || localError}</p>
        )}
      </div>
    </div>
  );
};

export default LandingPage;