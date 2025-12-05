"use client";

import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";

const STORAGE_KEY = "dashboard-youtube-video";

interface YouTubeWidgetProps {
    videoId?: string;
    onUpdate?: (videoId: string) => void;
}

export default function YouTubeWidget({ videoId: initialVideoId, onUpdate }: YouTubeWidgetProps) {
    const [videoId, setVideoId] = useState("");
    const [inputMode, setInputMode] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setVideoId(saved);
        } else if (initialVideoId) {
            setVideoId(initialVideoId);
        }
    }, [initialVideoId]);

    const extractVideoId = (input: string): string => {
        // Extract video ID from various YouTube URL formats
        const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&\n?#]+)/);
        return match ? match[1] : input.trim();
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const id = extractVideoId(inputValue);
        if (id) {
            setVideoId(id);
            setInputMode(false);
            localStorage.setItem(STORAGE_KEY, id);
            onUpdate?.(id);
        }
    };

    const handleClear = () => {
        setVideoId("");
        setInputValue("");
        setInputMode(false);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!mounted) return null;

    if (inputMode) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0">YOUTUBE</div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
                    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="YouTube URL または Video ID"
                            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#3a3a3a] rounded focus:border-red-500 focus:outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setInputMode(false)}
                                className="flex-1 py-2 text-xs text-gray-400 bg-[#252525] hover:bg-[#2a2a2a] rounded transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                            >
                                追加
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (!videoId) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0">YOUTUBE</div>
                <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1f1f1f] transition-colors min-h-0"
                    onClick={() => setInputMode(true)}
                >
                    <Play size={32} className="text-red-500 mb-2" />
                    <span className="text-xs text-gray-500">クリックで動画追加</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span>YOUTUBE</span>
                <button
                    onClick={handleClear}
                    className="p-0.5 text-gray-500 hover:text-red-500 transition-colors"
                    title="動画を削除"
                >
                    <X size={12} />
                </button>
            </div>
            <div className="flex-1 relative min-h-0 group">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                {/* Change button overlay - appears on hover */}
                <button
                    onClick={() => {
                        setInputValue(videoId);
                        setInputMode(true);
                    }}
                    className="absolute bottom-2 right-2 px-2 py-1 text-[9px] text-gray-300 bg-black/70 hover:bg-black/90 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    変更
                </button>
            </div>
        </div>
    );
}
