import React, { useState, useRef, useEffect } from 'react';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface StickyNoteProps {
    content: string;
    onSave: (newContent: string) => void;
    onDelete: () => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ content, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(content === '');
    const [editText, setEditText] = useState(content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing]);
    
    const handleSave = () => {
        onSave(editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (content === '') {
            onDelete();
        } else {
            setEditText(content);
            setIsEditing(false);
        }
    }
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }

    if (isEditing) {
        return (
            <div className="sticky-note">
                <textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={handleTextChange}
                    placeholder="Your note..."
                    rows={3}
                    className="w-full bg-transparent border-none resize-none outline-none p-0"
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={handleCancel} className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1 rounded">Cancel</button>
                    <button onClick={handleSave} className="text-sm font-semibold bg-[var(--accent-primary)] text-white px-3 py-1 rounded hover:opacity-90">Save</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sticky-note group">
            <p className="whitespace-pre-wrap">{content}</p>
            <div className="sticky-note-actions">
                <button onClick={() => setIsEditing(true)} title="Edit note"><EditIcon /></button>
                <button onClick={onDelete} title="Delete note"><DeleteIcon /></button>
            </div>
        </div>
    );
};

export default StickyNote;