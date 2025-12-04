"use client";

import { useTheme } from "./ThemeProvider";
import { Palette, Check } from "lucide-react";
import { useState } from "react";

export default function ThemeSwitcher() {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
                title="Change theme"
            >
                <Palette size={16} className="text-[var(--color-text-secondary)]" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-lg z-50">
                        <div className="p-2 border-b border-[var(--color-border)]">
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">
                                Theme
                            </span>
                        </div>
                        <div className="p-1">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] hover:bg-[var(--color-border)] transition-colors text-left"
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border border-[var(--color-border)]"
                                        style={{ backgroundColor: t.colors.accent }}
                                    />
                                    <span className="flex-1 text-[var(--color-text)]">{t.name}</span>
                                    {theme.id === t.id && (
                                        <Check size={12} className="text-[var(--color-accent)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
