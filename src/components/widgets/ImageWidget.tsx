"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageWidgetProps {
    imageUrl?: string;
    onUpdate?: (url: string) => void;
}

export default function ImageWidget({ imageUrl: initialUrl, onUpdate }: ImageWidgetProps) {
    const [imageUrl, setImageUrl] = useState(initialUrl || "");

    useEffect(() => {
        if (initialUrl) {
            setImageUrl(initialUrl);
        }
    }, [initialUrl]);

    const handleClick = () => {
        const input = prompt("Enter image URL:", imageUrl);
        if (input !== null && input.trim()) {
            setImageUrl(input.trim());
            onUpdate?.(input.trim());
        }
    };

    if (!imageUrl) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0">IMAGE</div>
                <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1f1f1f] transition-colors min-h-0"
                    onClick={handleClick}
                >
                    <ImageIcon size={32} className="text-purple-400 mb-2" />
                    <span className="text-xs text-gray-500">クリックで画像追加</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">IMAGE</div>
            <div className="flex-1 relative min-h-0 group">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                />
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
