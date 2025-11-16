import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { PaletteIcon } from './icons/PaletteIcon';

const themes: { name: Theme, label: string }[] = [
    { name: 'abyss', label: 'Abyss' },
    { name: 'paper', label: 'Notebook' },
    { name: 'cyberpunk', label: 'Cyberpunk' }
];

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useContext(ThemeContext);

    const cycleTheme = () => {
        const currentIndex = themes.findIndex(t => t.name === theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex].name);
    };

    const currentThemeLabel = themes.find(t => t.name === theme)?.label || 'Theme';

    return (
        <button
            onClick={cycleTheme}
            className="flex items-center gap-2 bg-[var(--bg-secondary-translucent)] backdrop-blur-md border border-[var(--border-primary)] rounded-full py-2 px-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            title={`Change theme (current: ${currentThemeLabel})`}
        >
            <PaletteIcon />
            <span className="font-semibold text-sm">{currentThemeLabel}</span>
        </button>
    );
};

export default ThemeSwitcher;