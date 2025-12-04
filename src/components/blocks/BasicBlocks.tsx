"use client";

import { Block, BlockContent } from "@/lib/blocks";

interface CoverBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function CoverBlock({ block, onUpdate }: CoverBlockProps) {
    const handleImageChange = () => {
        const url = prompt("Enter image URL:", block.content.imageUrl);
        if (url !== null) {
            onUpdate({ ...block.content, imageUrl: url });
        }
    };

    return (
        <div
            className="w-full h-48 md:h-64 bg-cover bg-center relative group cursor-pointer"
            style={{ backgroundImage: `url(${block.content.imageUrl})` }}
            onClick={handleImageChange}
        >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/80 bg-black/50 px-2 py-1">
                    Click to change cover
                </span>
            </div>
        </div>
    );
}

interface HeadingBlockProps {
    block: Block;
    level: 1 | 2 | 3;
    onUpdate: (content: BlockContent) => void;
}

export function HeadingBlock({ block, level, onUpdate }: HeadingBlockProps) {
    const sizes = {
        1: 'text-4xl font-bold',
        2: 'text-2xl font-semibold',
        3: 'text-lg font-medium',
    };

    return (
        <input
            type="text"
            value={block.content.text || ''}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className={`w-full bg-transparent border-none outline-none ${sizes[level]} text-white placeholder-gray-500`}
            placeholder={level === 1 ? 'Untitled' : 'Heading'}
        />
    );
}

interface TextBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function TextBlock({ block, onUpdate }: TextBlockProps) {
    return (
        <textarea
            value={block.content.text || ''}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-gray-300 resize-none min-h-[24px] placeholder-gray-600"
            placeholder="Type something..."
            rows={1}
            onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
            }}
        />
    );
}

export function DividerBlock() {
    return <hr className="border-gray-700 my-2" />;
}

interface ImageBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function ImageBlock({ block, onUpdate }: ImageBlockProps) {
    const handleImageChange = () => {
        const url = prompt("Enter image URL:", block.content.imageUrl);
        if (url !== null) {
            onUpdate({ ...block.content, imageUrl: url });
        }
    };

    if (!block.content.imageUrl) {
        return (
            <div
                onClick={handleImageChange}
                className="w-full h-32 bg-gray-800/50 border border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
            >
                <span className="text-gray-500 text-sm">Click to add image</span>
            </div>
        );
    }

    return (
        <div className="relative group">
            <img
                src={block.content.imageUrl}
                alt=""
                className="w-full rounded cursor-pointer"
                onClick={handleImageChange}
            />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/80 bg-black/50 px-2 py-1">
                    Click to change
                </span>
            </div>
        </div>
    );
}

interface YouTubeBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function YouTubeBlock({ block, onUpdate }: YouTubeBlockProps) {
    const handleVideoChange = () => {
        const input = prompt("Enter YouTube URL or Video ID:", block.content.videoId);
        if (input !== null) {
            // Extract video ID from URL if needed
            const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
            const videoId = match ? match[1] : input;
            onUpdate({ ...block.content, videoId });
        }
    };

    if (!block.content.videoId) {
        return (
            <div
                onClick={handleVideoChange}
                className="w-full h-48 bg-gray-800/50 border border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
            >
                <span className="text-gray-500 text-sm">📺 Click to add YouTube video</span>
            </div>
        );
    }

    return (
        <div className="relative aspect-video group">
            <iframe
                src={`https://www.youtube.com/embed/${block.content.videoId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            <button
                onClick={handleVideoChange}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-2 py-1"
            >
                Change
            </button>
        </div>
    );
}

interface SpotifyBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function SpotifyBlock({ block, onUpdate }: SpotifyBlockProps) {
    const handleSpotifyChange = () => {
        const input = prompt("Enter Spotify URI (e.g., playlist/37i9dQZF1DXcBWIGoYBM5M):", block.content.spotifyUri);
        if (input !== null) {
            onUpdate({ ...block.content, spotifyUri: input });
        }
    };

    if (!block.content.spotifyUri) {
        return (
            <div
                onClick={handleSpotifyChange}
                className="w-full h-24 bg-gray-800/50 border border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
            >
                <span className="text-gray-500 text-sm">🎵 Click to add Spotify</span>
            </div>
        );
    }

    return (
        <div className="relative group">
            <iframe
                src={`https://open.spotify.com/embed/${block.content.spotifyUri}?theme=0`}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
            />
            <button
                onClick={handleSpotifyChange}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-2 py-1"
            >
                Change
            </button>
        </div>
    );
}
