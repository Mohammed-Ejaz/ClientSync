import { createContext, useContext, useEffect, useState } from 'react';

// Three themes: 'dark' | 'dim' | 'light'
const THEMES = ['dark', 'dim', 'light'];
const STORAGE_KEY = 'clientsync-theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return THEMES.includes(stored) ? stored : 'dark';
    });

    useEffect(() => {
        // Apply data-theme attribute to <html> so CSS vars cascade everywhere
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
