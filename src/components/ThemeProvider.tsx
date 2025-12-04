"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Theme {
    id: string;
    name: string;
    colors: {
        bg: string;
        bgSecondary: string;
        border: string;
        borderHover: string;
        text: string;
        textSecondary: string;
        accent: string;
    };
}

export const THEMES: Theme[] = [
    {
        id: "dark",
        name: "Dark",
        colors: {
            bg: "#0a0a0a",
            bgSecondary: "#1a1a1a",
            border: "#2a2a2a",
            borderHover: "#3a3a3a",
            text: "#e5e5e5",
            textSecondary: "#888888",
            accent: "#666666",
        },
    },
    {
        id: "midnight",
        name: "Midnight Blue",
        colors: {
            bg: "#0a0f1a",
            bgSecondary: "#131c2e",
            border: "#1e2d47",
            borderHover: "#2a4066",
            text: "#e0e6f0",
            textSecondary: "#7a8ba8",
            accent: "#4a7dff",
        },
    },
    {
        id: "forest",
        name: "Forest",
        colors: {
            bg: "#0a100c",
            bgSecondary: "#141f17",
            border: "#1e3025",
            borderHover: "#2a4535",
            text: "#d5e5da",
            textSecondary: "#7a9a82",
            accent: "#4a9a5a",
        },
    },
    {
        id: "sunset",
        name: "Sunset",
        colors: {
            bg: "#12090a",
            bgSecondary: "#1f1012",
            border: "#3a1a1e",
            borderHover: "#552530",
            text: "#f0e0e2",
            textSecondary: "#a08085",
            accent: "#ff6b6b",
        },
    },
    {
        id: "cyberpunk",
        name: "Cyberpunk",
        colors: {
            bg: "#0a0510",
            bgSecondary: "#150a20",
            border: "#2a1540",
            borderHover: "#451a6a",
            text: "#f0e0ff",
            textSecondary: "#9a7ab0",
            accent: "#ff00ff",
        },
    },
    {
        id: "coffee",
        name: "Coffee",
        colors: {
            bg: "#100a08",
            bgSecondary: "#1a1210",
            border: "#2a201a",
            borderHover: "#3a3025",
            text: "#e8ddd5",
            textSecondary: "#a09080",
            accent: "#c4a77d",
        },
    },
];

interface ThemeContextType {
    theme: Theme;
    setTheme: (themeId: string) => void;
    themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "dashboard-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(THEMES[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const found = THEMES.find(t => t.id === saved);
            if (found) setThemeState(found);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Apply CSS variables
        const root = document.documentElement;
        root.style.setProperty("--color-bg", theme.colors.bg);
        root.style.setProperty("--color-bg-secondary", theme.colors.bgSecondary);
        root.style.setProperty("--color-border", theme.colors.border);
        root.style.setProperty("--color-border-hover", theme.colors.borderHover);
        root.style.setProperty("--color-text", theme.colors.text);
        root.style.setProperty("--color-text-secondary", theme.colors.textSecondary);
        root.style.setProperty("--color-accent", theme.colors.accent);
    }, [theme, mounted]);

    const setTheme = (themeId: string) => {
        const found = THEMES.find(t => t.id === themeId);
        if (found) {
            setThemeState(found);
            localStorage.setItem(STORAGE_KEY, themeId);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
