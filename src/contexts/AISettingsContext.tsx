"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AIProvider = "groq" | "gemini";

export interface AISettings {
    provider: AIProvider;
    groqModel: string;
}

interface AISettingsContextType {
    settings: AISettings;
    updateSettings: (updates: Partial<AISettings>) => void;
}

const STORAGE_KEY = "dashboard-ai-settings";

const DEFAULT_SETTINGS: AISettings = {
    provider: "groq", // Default to Groq as Gemini is having issues
    groqModel: "llama-3.1-70b-versatile",
};

const GROQ_MODELS = [
    { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B (推奨)" },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (高速)" },
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (最新)" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
];

const AISettingsContext = createContext<AISettingsContextType | null>(null);

export function AISettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch {
                // Use default settings
            }
        }
    }, []);

    const updateSettings = (updates: Partial<AISettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <AISettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </AISettingsContext.Provider>
    );
}

export function useAISettings() {
    const context = useContext(AISettingsContext);
    if (!context) {
        // Return default values if not in provider
        return {
            settings: DEFAULT_SETTINGS,
            updateSettings: () => { },
        };
    }
    return context;
}

export { GROQ_MODELS };
