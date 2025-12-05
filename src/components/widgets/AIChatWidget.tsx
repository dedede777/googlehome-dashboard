"use client";

import React, { useState, useEffect } from "react";
import { Settings, X, Plus, Check } from "lucide-react";

interface AIService {
    id: string;
    name: string;
    url: string;
    customIcon?: React.ReactNode;
}

const ALL_AI_SERVICES: AIService[] = [
    {
        id: "gemini",
        name: "Gemini",
        url: "https://gemini.google.com/app",
    },
    {
        id: "chatgpt",
        name: "ChatGPT",
        url: "https://chat.openai.com",
    },
    {
        id: "perplexity",
        name: "Perplexity",
        url: "https://www.perplexity.ai",
    },
    {
        id: "claude",
        name: "Claude",
        url: "https://claude.ai",
    },
    {
        id: "copilot",
        name: "Copilot",
        url: "https://copilot.microsoft.com",
    },
    {
        id: "grok",
        name: "Grok",
        url: "https://grok.x.ai",
    },
    {
        id: "poe",
        name: "Poe",
        url: "https://poe.com",
    },
    {
        id: "notebooklm",
        name: "NotebookLM",
        url: "https://notebooklm.google.com",
        customIcon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 20 C 4 12, 12 12, 12 12 C 12 12, 20 12, 20 20" />
                <path d="M7 20 C 7 15, 12 15, 12 15 C 12 15, 17 15, 17 20" />
                <path d="M10 20 C 10 18, 12 18, 12 18 C 12 18, 14 18, 14 20" />
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

    const getFaviconUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        } catch {
            return "";
        }
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
                                {service.customIcon ? (
                                    <div className="text-gray-500 w-4 h-4 flex items-center justify-center">
                                        {React.cloneElement(service.customIcon as React.ReactElement, { className: "w-4 h-4 fill-none stroke-current" })}
                                    </div>
                                ) : (
                                    <img
                                        src={getFaviconUrl(service.url)}
                                        alt={service.name}
                                        className="w-4 h-4 rounded-sm"
                                    />
                                )}
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
                            <div className="w-6 h-6 flex items-center justify-center bg-[#202020] rounded-md group-hover:scale-110 transition-transform">
                                {service.customIcon ? (
                                    <div className="text-gray-500 group-hover:text-gray-300 transition-colors w-4 h-4 flex items-center justify-center">
                                        {service.customIcon}
                                    </div>
                                ) : (
                                    <img
                                        src={getFaviconUrl(service.url)}
                                        alt={service.name}
                                        className="w-4 h-4"
                                    />
                                )}
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
