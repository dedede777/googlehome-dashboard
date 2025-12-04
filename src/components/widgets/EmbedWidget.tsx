"use client";

import { useState, useEffect } from "react";
import { Globe, Image, Film } from "lucide-react";

interface EmbedWidgetProps {
    url?: string;
    onUpdate?: (url: string) => void;
}

type MediaType = "image" | "video" | "iframe";

const getMediaType = (url: string): MediaType => {
    const lower = url.toLowerCase();
    // Image extensions
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(lower)) {
        return "image";
    }
    // Video extensions
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(lower)) {
        return "video";
    }
    // Default to iframe for everything else
    return "iframe";
};

export default function EmbedWidget({ url: initialUrl, onUpdate }: EmbedWidgetProps) {
    const [url, setUrl] = useState(initialUrl || "");

    useEffect(() => {
        if (initialUrl) {
            setUrl(initialUrl);
        }
    }, [initialUrl]);

    const handleClick = () => {
        const input = prompt("URL を入力（画像/GIF/動画/埋め込み対応）:", url);
        if (input !== null && input.trim()) {
            setUrl(input.trim());
            onUpdate?.(input.trim());
        }
    };

    if (!url) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0">EMBED</div>
                <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1f1f1f] transition-colors min-h-0"
                    onClick={handleClick}
                >
                    <Globe size={32} className="text-blue-400 mb-2" />
                    <span className="text-xs text-gray-500">クリックでメディア追加</span>
                    <span className="text-[9px] text-gray-600 mt-1">画像 / GIF / 動画 / URL</span>
                </div>
            </div>
        );
    }

    const mediaType = getMediaType(url);

    const renderMedia = () => {
        switch (mediaType) {
            case "image":
                return (
                    <img
                        src={url}
                        alt="Embedded content"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                );
            case "video":
                return (
                    <video
                        src={url}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                );
            case "iframe":
            default:
                return (
                    <iframe
                        src={url}
                        className="absolute inset-0 w-full h-full border-0"
                        loading="lazy"
                    />
                );
        }
    };

    const getTypeIcon = () => {
        switch (mediaType) {
            case "image": return <Image size={8} />;
            case "video": return <Film size={8} />;
            default: return <Globe size={8} />;
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex items-center gap-1 flex-shrink-0">
                <span className="text-gray-500">{getTypeIcon()}</span>
                EMBED
            </div>
            <div className="flex-1 relative min-h-0 group">
                {renderMedia()}
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

