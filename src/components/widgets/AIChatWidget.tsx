"use client";

import React, { useState, useEffect } from "react";
import { Settings, X, Plus, Check } from "lucide-react";

interface AIService {
    id: string;
    name: string;
    url: string;
    svg: React.ReactNode;
}

const ALL_AI_SERVICES: AIService[] = [
    {
        id: "gemini",
        name: "Gemini",
        url: "https://gemini.google.com/app",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
            </svg>
        ),
    },
    {
        id: "chatgpt",
        name: "ChatGPT",
        url: "https://chat.openai.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M22.2 8.4c.2-.6.3-1.3.3-2 0-2.8-2-5.2-4.7-5.8-.5-.1-1-.2-1.5-.2-1.8 0-3.4.8-4.5 2.1C10.6 1.3 9 .5 7.2.5c-.5 0-1 .1-1.5.2C3 1.3 1 3.7 1 6.5c0 .7.1 1.4.3 2C.5 9.3 0 10.4 0 11.6c0 2.8 2 5.2 4.7 5.8.5.1 1 .2 1.5.2 1.8 0 3.4-.8 4.5-2.1 1.2 1.3 2.8 2.1 4.6 2.1.5 0 1-.1 1.5-.2 2.7-.6 4.7-3 4.7-5.8 0-1.2-.5-2.3-1.3-3.2zM12 14.4c-1.3 0-2.4-1.1-2.4-2.4s1.1-2.4 2.4-2.4 2.4 1.1 2.4 2.4-1.1 2.4-2.4 2.4z" />
            </svg>
        ),
    },
    {
        id: "perplexity",
        name: "Perplexity",
        url: "https://www.perplexity.ai",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.5L18 8l-6 3-6-3 6-3.5zM6 9.5l5 2.5v7l-5-2.5v-7zm12 0v7l-5 2.5v-7l5-2.5z" />
            </svg>
        ),
    },
    {
        id: "claude",
        name: "Claude",
        url: "https://claude.ai",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
        ),
    },
    {
        id: "copilot",
        name: "Copilot",
        url: "https://copilot.microsoft.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
        ),
    },
    {
        id: "grok",
        name: "Grok",
        url: "https://grok.x.ai",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
        ),
    },
    {
        id: "poe",
        name: "Poe",
        url: "https://poe.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
        ),
    },
    {
        id: "notebooklm",
        name: "NotebookLM",
        url: "https://notebooklm.google.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
        ),
    },
];

const STORAGE_KEY = "dashboard-ai-services";
const DEFAULT_SELECTED = ["gemini", "chatgpt", "claude", "perplexity"];

export default function AIChatWidget() {
    const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SELECTED);
    const [showSettings, setShowSettings] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setSelectedIds(JSON.parse(saved));
        }
    }, []);

    const saveSelection = (ids: string[]) => {
        setSelectedIds(ids);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    };

    const toggleService = (id: string) => {
        if (selectedIds.includes(id)) {
            saveSelection(selectedIds.filter(s => s !== id));
        } else {
            saveSelection([...selectedIds, id]);
        }
    };

    const openAI = (url: string) => {
        window.open(url, "_blank");
    };

    if (!mounted) return null;

    const selectedServices = ALL_AI_SERVICES.filter(s => selectedIds.includes(s.id));

    return (
        <div className="h-full flex flex-col">
            <div className="widget-title">AI</div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto">
                    <p className="text-[9px] text-gray-500 mb-2">表示するAIを選択:</p>
                    <div className="space-y-1">
                        {ALL_AI_SERVICES.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={`w-full flex items-center gap-2 p-2 border transition-colors ${selectedIds.includes(service.id)
                                    ? "bg-[#252525] border-green-600/50"
                                    : "bg-[#151515] border-[#2a2a2a] hover:border-[#3a3a3a]"
                                    }`}
                            >
                                <div className="text-gray-500">{service.svg}</div>
                                <span className="text-[10px] text-gray-300 flex-1 text-left">
                                    {service.name}
                                </span>
                                {selectedIds.includes(service.id) && (
                                    <Check size={12} className="text-green-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-2 grid grid-cols-3 gap-1.5 content-start">
                    {selectedServices.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => openAI(service.url)}
                            className="group flex flex-col items-center gap-1.5 p-2.5 bg-[#151515] border border-[#252525] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-all"
                            title={service.name}
                        >
                            <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
                                {service.svg}
                            </div>
                            <span className="text-[9px] text-gray-600 group-hover:text-gray-400 transition-colors truncate w-full text-center">
                                {service.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="p-2 border-t border-[#3a3a3a]">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 bg-[#252525] hover:bg-[#2a2a2a] border border-[#3a3a3a] transition-colors"
                >
                    {showSettings ? <X size={10} /> : <Settings size={10} />}
                    <span>{showSettings ? "Done" : "Settings"}</span>
                </button>
            </div>
        </div>
    );
}
