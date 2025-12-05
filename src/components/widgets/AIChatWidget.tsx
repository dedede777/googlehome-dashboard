"use client";

import React, { useState, useEffect } from "react";
import { Settings, X, Plus, Check, Trash2 } from "lucide-react";

interface AIService {
    id: string;
    name: string;
    url: string;
    customIcon?: React.ReactNode;
    isCustom?: boolean;
}

const BUILT_IN_SERVICES: AIService[] = [
    { id: "gemini", name: "Gemini", url: "https://gemini.google.com/app" },
    { id: "chatgpt", name: "ChatGPT", url: "https://chat.openai.com" },
    { id: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai" },
    { id: "claude", name: "Claude", url: "https://claude.ai" },
    { id: "copilot", name: "Copilot", url: "https://copilot.microsoft.com" },
    { id: "grok", name: "Grok", url: "https://grok.x.ai" },
    { id: "poe", name: "Poe", url: "https://poe.com" },
    { id: "manus", name: "Manus", url: "https://manus.im" },
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
const CUSTOM_STORAGE_KEY = "dashboard-ai-custom";
const DEFAULT_SELECTED = ["gemini", "chatgpt", "claude", "perplexity"];

export default function AIChatWidget() {
    const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SELECTED);
    const [customServices, setCustomServices] = useState<AIService[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSelectedIds(JSON.parse(saved));
        const customSaved = localStorage.getItem(CUSTOM_STORAGE_KEY);
        if (customSaved) setCustomServices(JSON.parse(customSaved));
    }, []);

    const saveSelection = (ids: string[]) => {
        setSelectedIds(ids);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    };

    const saveCustomServices = (services: AIService[]) => {
        setCustomServices(services);
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(services));
    };

    const toggleService = (id: string) => {
        if (selectedIds.includes(id)) {
            saveSelection(selectedIds.filter(s => s !== id));
        } else {
            saveSelection([...selectedIds, id]);
        }
    };

    const addCustomService = () => {
        if (!newName.trim() || !newUrl.trim()) return;
        const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
        const newService: AIService = {
            id: `custom-${Date.now()}`,
            name: newName.trim(),
            url,
            isCustom: true,
        };
        saveCustomServices([...customServices, newService]);
        saveSelection([...selectedIds, newService.id]);
        setNewName("");
        setNewUrl("");
        setShowAddForm(false);
    };

    const deleteCustomService = (id: string) => {
        saveCustomServices(customServices.filter(s => s.id !== id));
        saveSelection(selectedIds.filter(s => s !== id));
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

    const allServices = [...BUILT_IN_SERVICES, ...customServices];
    const selectedServices = allServices.filter(s => selectedIds.includes(s.id));

    return (
        <div className="h-full flex flex-col">
            <div className="widget-title">AI</div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <p className="text-[9px] text-gray-500 mb-2">表示するAIを選択:</p>
                    <div className="space-y-1">
                        {allServices.map((service) => (
                            <div key={service.id} className="flex items-center gap-1">
                                <button
                                    onClick={() => toggleService(service.id)}
                                    className={`flex-1 flex items-center gap-2 p-2 border transition-colors ${selectedIds.includes(service.id)
                                        ? "bg-[#252525] border-green-600/50"
                                        : "bg-[#151515] border-[#2a2a2a] hover:border-[#3a3a3a]"
                                        }`}
                                >
                                    {service.customIcon ? (
                                        <div className="text-gray-500 w-4 h-4 flex items-center justify-center">
                                            {service.customIcon}
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
                                {service.isCustom && (
                                    <button
                                        onClick={() => deleteCustomService(service.id)}
                                        className="p-2 text-gray-600 hover:text-red-400"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Custom Form */}
                    {showAddForm ? (
                        <div className="mt-3 p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="名前 (例: MyAI)"
                                className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                                autoFocus
                            />
                            <input
                                type="text"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="URL (例: https://example.ai)"
                                className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                                onKeyDown={(e) => e.key === "Enter" && addCustomService()}
                            />
                            <div className="flex gap-1">
                                <button
                                    onClick={addCustomService}
                                    className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                                >
                                    追加
                                </button>
                                <button
                                    onClick={() => { setShowAddForm(false); setNewName(""); setNewUrl(""); }}
                                    className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 bg-[#151515] border border-dashed border-[#3a3a3a] hover:border-[#555] transition-colors"
                        >
                            <Plus size={12} />
                            <span>カスタムAI追加</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <div className="grid grid-cols-3 gap-1 auto-rows-min">
                        {selectedServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => openAI(service.url)}
                                className="group flex flex-col items-center gap-0.5 p-1.5 bg-[#151515] border border-[#252525] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-all"
                                title={service.name}
                            >
                                <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
                                    {service.customIcon ? (
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            {service.customIcon}
                                        </div>
                                    ) : (
                                        <img
                                            src={getFaviconUrl(service.url)}
                                            alt={service.name}
                                            className="w-5 h-5"
                                        />
                                    )}
                                </div>
                                <span className="text-[8px] text-gray-600 group-hover:text-gray-400 transition-colors truncate w-full text-center">
                                    {service.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-2 border-t border-[#3a3a3a]">
                <button
                    onClick={() => { setShowSettings(!showSettings); setShowAddForm(false); }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 bg-[#252525] hover:bg-[#2a2a2a] border border-[#3a3a3a] transition-colors"
                >
                    {showSettings ? <X size={10} /> : <Settings size={10} />}
                    <span>{showSettings ? "Done" : "Settings"}</span>
                </button>
            </div>
        </div>
    );
}
