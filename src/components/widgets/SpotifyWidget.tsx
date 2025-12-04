"use client";

import { useState, useEffect } from "react";
import { Music } from "lucide-react";

interface SpotifyWidgetProps {
    uri?: string;
    onUpdate?: (uri: string) => void;
}

export default function SpotifyWidget({ uri: initialUri, onUpdate }: SpotifyWidgetProps) {
    const [uri, setUri] = useState(initialUri || "");
    const [inputMode, setInputMode] = useState(!initialUri);

    useEffect(() => {
        if (initialUri) {
            setUri(initialUri);
            setInputMode(false);
        }
    }, [initialUri]);

    const handleSubmit = (input: string) => {
        // Extract URI from Spotify URLs
        // e.g., https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
        const match = input.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
        const cleanUri = match ? `${match[1]}/${match[2]}` : input.trim();
        if (cleanUri) {
            setUri(cleanUri);
            setInputMode(false);
            onUpdate?.(cleanUri);
        }
    };

    const handleClick = () => {
        const input = prompt("Enter Spotify URL or URI (e.g., playlist/37i9dQZF1DXcBWIGoYBM5M):", uri);
        if (input !== null) {
            handleSubmit(input);
        }
    };

    if (inputMode || !uri) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0">SPOTIFY</div>
                <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1f1f1f] transition-colors min-h-0"
                    onClick={handleClick}
                >
                    <Music size={32} className="text-green-500 mb-2" />
                    <span className="text-xs text-gray-500">クリックで音楽追加</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">SPOTIFY</div>
            <div className="flex-1 p-2 min-h-0 relative group">
                <iframe
                    src={`https://open.spotify.com/embed/${uri}?theme=0`}
                    width="100%"
                    height="100%"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded"
                />
                <button
                    onClick={handleClick}
                    className="absolute bottom-3 right-3 px-2 py-1 text-[9px] text-gray-300 bg-black/70 hover:bg-black/90 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    変更
                </button>
            </div>
        </div>
    );
}
