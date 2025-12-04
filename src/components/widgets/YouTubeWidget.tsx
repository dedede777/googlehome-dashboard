"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";

interface YouTubeWidgetProps {
    videoId?: string;
    onUpdate?: (videoId: string) => void;
}

export default function YouTubeWidget({ videoId: initialVideoId, onUpdate }: YouTubeWidgetProps) {
    const [videoId, setVideoId] = useState(initialVideoId || "");
    const [inputMode, setInputMode] = useState(!initialVideoId);

    useEffect(() => {
        if (initialVideoId) {
            setVideoId(initialVideoId);
            setInputMode(false);
        }
    }, [initialVideoId]);

    const handleSubmit = (input: string) => {
        // Extract video ID from various YouTube URL formats
        const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
        const id = match ? match[1] : input.trim();
        if (id) {
            setVideoId(id);
            setInputMode(false);
            onUpdate?.(id);
        }
    };

    const handleClick = () => {
        const input = prompt("Enter YouTube URL or Video ID:", videoId);
        if (input !== null) {
            handleSubmit(input);
        }
    };

    if (inputMode || !videoId) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0">YOUTUBE</div>
                <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1f1f1f] transition-colors min-h-0"
                    onClick={handleClick}
                >
                    <Play size={32} className="text-red-500 mb-2" />
                    <span className="text-xs text-gray-500">クリックで動画追加</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">YOUTUBE</div>
            <div className="flex-1 relative min-h-0 group">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                {/* Change button overlay - appears on hover */}
                <button
                    onClick={handleClick}
                    className="absolute bottom-2 right-2 px-2 py-1 text-[9px] text-gray-300 bg-black/70 hover:bg-black/90 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    変更
                </button>
            </div>
        </div>
    );
}
