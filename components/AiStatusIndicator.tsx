import React, { useState, useEffect } from 'react';
import { ThoughtBubbleIcon } from './icons/ThoughtBubbleIcon';

interface AiStatusIndicatorProps {
  status: string;
}

const AiStatusIndicator: React.FC<AiStatusIndicatorProps> = ({ status }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (status) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  const animationClass = isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${animationClass}`}>
      <div className="bg-[var(--bg-secondary-translucent)] backdrop-blur-md border border-[var(--accent-primary)]/30 rounded-lg p-3 flex items-center gap-3 shadow-2xl max-w-xs">
        <div className="flex-shrink-0">
            <div className="w-5 h-5 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
        </div>
        <p className="text-[var(--text-secondary)] text-sm truncate">{status}</p>
      </div>
    </div>
  );
};

export default AiStatusIndicator;