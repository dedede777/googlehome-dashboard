"use client";

import React, { useState, useEffect } from "react";
import { Settings, X, Check, Plus, Trash2 } from "lucide-react";

interface SNSService {
    id: string;
    name: string;
    url: string;
    svg: React.ReactNode;
}

const ALL_SNS_SERVICES: SNSService[] = [
    {
        id: "x",
        name: "X",
        url: "https://x.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
        ),
    },
    {
        id: "instagram",
        name: "Instagram",
        url: "https://instagram.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        id: "youtube",
        name: "YouTube",
        url: "https://youtube.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
    {
        id: "tiktok",
        name: "TikTok",
        url: "https://tiktok.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
        ),
    },
    {
        id: "discord",
        name: "Discord",
        url: "https://discord.com/app",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
        ),
    },
    {
        id: "threads",
        name: "Threads",
        url: "https://threads.net",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.022.88-.73 2.132-1.13 3.628-1.154 1.135-.018 2.18.127 3.133.432-.02-.925-.146-1.7-.387-2.29-.344-.842-.947-1.293-1.842-1.379-1.27-.121-2.227.286-2.749.786l-1.332-1.598c.915-.839 2.318-1.36 3.998-1.194 1.663.164 2.815.94 3.422 2.305.453.97.655 2.18.666 3.74.942.388 1.713.895 2.28 1.526.916 1.02 1.376 2.32 1.332 3.762-.068 2.219-.96 4.013-2.58 5.192C17.702 22.849 15.281 24 12.186 24zm-.09-6.693c1.074-.052 1.854-.406 2.322-1.054.432-.598.654-1.457.66-2.556-.658-.165-1.376-.246-2.144-.242-1.022.015-1.81.248-2.35.694-.476.393-.7.873-.668 1.428.045.807.536 1.73 2.18 1.73z" />
            </svg>
        ),
    },
    {
        id: "facebook",
        name: "Facebook",
        url: "https://facebook.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        url: "https://linkedin.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        id: "reddit",
        name: "Reddit",
        url: "https://reddit.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
        ),
    },
    {
        id: "twitch",
        name: "Twitch",
        url: "https://twitch.tv",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
            </svg>
        ),
    },
    {
        id: "pinterest",
        name: "Pinterest",
        url: "https://pinterest.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
            </svg>
        ),
    },
    {
        id: "bluesky",
        name: "Bluesky",
        url: "https://bsky.app",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
            </svg>
        ),
    },
    {
        id: "github",
        name: "GitHub",
        url: "https://github.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
    },
    {
        id: "note",
        name: "note",
        url: "https://note.com",
        svg: (
            <svg viewBox="0 0 24 24" className="w-5 h-5">
                <text x="4" y="20" fontSize="22" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">n</text>
            </svg>
        ),
    },
];

const STORAGE_KEY = "dashboard-sns-services";
const CUSTOM_STORAGE_KEY = "dashboard-sns-custom";
const DEFAULT_SELECTED = ["x", "instagram", "youtube", "discord", "threads"];

interface CustomSNS { id: string; name: string; url: string; }

export default function SNSWidget() {
    const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SELECTED);
    const [customServices, setCustomServices] = useState<CustomSNS[]>([]);
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

    const toggleService = (id: string) => {
        if (selectedIds.includes(id)) {
            saveSelection(selectedIds.filter(s => s !== id));
        } else {
            saveSelection([...selectedIds, id]);
        }
    };

    const saveCustomServices = (services: CustomSNS[]) => {
        setCustomServices(services);
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(services));
    };

    const addCustomService = () => {
        if (!newName.trim() || !newUrl.trim()) return;
        const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
        const newService: CustomSNS = { id: `custom-${Date.now()}`, name: newName.trim(), url };
        saveCustomServices([...customServices, newService]);
        saveSelection([...selectedIds, newService.id]);
        setNewName(""); setNewUrl(""); setShowAddForm(false);
    };

    const deleteCustomService = (id: string) => {
        saveCustomServices(customServices.filter(s => s.id !== id));
        saveSelection(selectedIds.filter(s => s !== id));
    };

    const openSNS = (url: string) => window.open(url, "_blank");

    const getFaviconUrl = (url: string) => {
        try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; }
        catch { return ""; }
    };

    if (!mounted) return null;

    const allServices: Array<{ id: string; name: string; url: string; svg: React.ReactNode; isCustom?: boolean }> = [
        ...ALL_SNS_SERVICES.map(s => ({ ...s, isCustom: false })),
        ...customServices.map(c => ({ ...c, svg: null as React.ReactNode, isCustom: true })),
    ];
    const selectedServices = allServices.filter(s => selectedIds.includes(s.id));

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">SNS</div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <p className="text-[9px] text-gray-500 mb-2">表示するSNSを選択:</p>
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
                                    {service.svg ? (
                                        <div className="text-gray-500">{service.svg as React.ReactNode}</div>
                                    ) : (
                                        <img src={getFaviconUrl(service.url)} alt={service.name} className="w-5 h-5 rounded-sm" />
                                    )}
                                    <span className="text-[10px] text-gray-300 flex-1 text-left">{service.name}</span>
                                    {selectedIds.includes(service.id) && <Check size={12} className="text-green-500" />}
                                </button>
                                {'isCustom' in service && service.isCustom && (
                                    <button onClick={() => deleteCustomService(service.id)} className="p-2 text-gray-600 hover:text-red-400">
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {showAddForm ? (
                        <div className="mt-3 p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="名前 (例: MySNS)" className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]" autoFocus />
                            <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL (例: https://example.com)" className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]" onKeyDown={(e) => e.key === "Enter" && addCustomService()} />
                            <div className="flex gap-1">
                                <button onClick={addCustomService} className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]">追加</button>
                                <button onClick={() => { setShowAddForm(false); setNewName(""); setNewUrl(""); }} className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]">キャンセル</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setShowAddForm(true)} className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 bg-[#151515] border border-dashed border-[#3a3a3a] hover:border-[#555] transition-colors">
                            <Plus size={12} /><span>カスタムSNS追加</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <div className="grid grid-cols-3 gap-1.5 auto-rows-min">
                        {selectedServices.map((service) => (
                            <button key={service.id} onClick={() => openSNS(service.url)} className="group flex flex-col items-center gap-1 p-2 bg-[#151515] border border-[#252525] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-all" title={service.name}>
                                <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
                                    {service.svg ? service.svg : <img src={getFaviconUrl(service.url)} alt={service.name} className="w-5 h-5" />}
                                </div>
                                <span className="text-[8px] text-gray-600 group-hover:text-gray-400 transition-colors truncate w-full text-center">{service.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-1.5 border-t border-[#2a2a2a] flex-shrink-0">
                <button onClick={() => { setShowSettings(!showSettings); setShowAddForm(false); }} className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors">
                    {showSettings ? <X size={10} /> : <Settings size={10} />}
                    <span>{showSettings ? "完了" : "設定"}</span>
                </button>
            </div>
        </div>
    );
}
