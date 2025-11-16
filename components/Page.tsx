import React from 'react';
import { PaperStyle } from './NotesDisplay';

interface PageProps {
    isFlipped: boolean;
    frontContent: React.ReactNode;
    backContent: React.ReactNode;
    paperStyle: PaperStyle;
    zIndex: number;
}

const Page: React.FC<PageProps> = ({ isFlipped, frontContent, backContent, paperStyle, zIndex }) => {
    return (
        <div 
            className={`page ${isFlipped ? 'flipped' : ''}`}
            style={{ zIndex }}
        >
            <div className={`page-front page-content ${paperStyle}`}>
                {frontContent}
            </div>
            <div className={`page-back page-content ${paperStyle}`}>
                {backContent}
            </div>
        </div>
    );
};

export default Page;
