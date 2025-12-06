"use client";

import { useState, useEffect, useRef } from "react";
import { Play, X, Search, Plus, List, ChevronLeft, Trash2 } from "lucide-react";

const STORAGE_KEY = "dashboard-youtube-video";
const PLAYLIST_KEY = "dashboard-youtube-playlist";
const API_KEY_STORAGE = "dashboard-youtube-api-key";

interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
}

interface YouTubeWidgetProps {
    videoId?: string;
    onUpdate?: (videoId: string) => void;
}

export default function YouTubeWidget({ videoId: initialVideoId, onUpdate }: YouTubeWidgetProps) {
    const [videoId, setVideoId] = useState("");
    const [mode, setMode] = useState<"player" | "search" | "playlist" | "settings">("player");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
    const [playlist, setPlaylist] = useState<VideoItem[]>([]);
    const [apiKey, setApiKey] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [searching, setSearching] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("");
    const playerRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        setMounted(true);
        const savedVideo = localStorage.getItem(STORAGE_KEY);
        const savedPlaylist = localStorage.getItem(PLAYLIST_KEY);
        const savedApiKey = localStorage.getItem(API_KEY_STORAGE);

        if (savedVideo) {
            try {
                const parsed = JSON.parse(savedVideo);
                setVideoId(parsed.id || parsed);
                setCurrentTitle(parsed.title || "");
            } catch {
                setVideoId(savedVideo);
            }
        } else if (initialVideoId) {
            setVideoId(initialVideoId);
        }
        if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));
        if (savedApiKey) setApiKey(savedApiKey);
    }, [initialVideoId]);

    const extractVideoId = (input: string): string => {
        const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&\n?#]+)/);
        return match ? match[1] : input.trim();
    };

    const saveApiKey = () => {
        if (apiKeyInput.trim()) {
            setApiKey(apiKeyInput.trim());
            localStorage.setItem(API_KEY_STORAGE, apiKeyInput.trim());
            setMode("player");
        }
    };

    const searchVideos = async () => {
        if (!searchQuery.trim() || !apiKey) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}`
            );
            const data = await res.json();
            if (data.items) {
                setSearchResults(data.items.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { default: { url: string } } } }) => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url,
                })));
            }
        } catch (e) {
            console.error("Search failed:", e);
        }
        setSearching(false);
    };

    const playVideo = (video: VideoItem) => {
        setVideoId(video.id);
        setCurrentTitle(video.title);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: video.id, title: video.title }));
        onUpdate?.(video.id);
        setMode("player");
    };

    const addToPlaylist = (video: VideoItem) => {
        if (!playlist.find(v => v.id === video.id)) {
            const updated = [...playlist, video];
            setPlaylist(updated);
            localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updated));
        }
    };

    const removeFromPlaylist = (id: string) => {
        const updated = playlist.filter(v => v.id !== id);
        setPlaylist(updated);
        localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updated));
    };

    const playNext = () => {
        const currentIndex = playlist.findIndex(v => v.id === videoId);
        if (currentIndex < playlist.length - 1) {
            playVideo(playlist[currentIndex + 1]);
        }
    };

    const handleClear = () => {
        setVideoId("");
        setCurrentTitle("");
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!mounted) return null;

    // Settings mode - API key input
    if (mode === "settings" || (!apiKey && mode !== "player")) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span>YOUTUBE</span>
                    {apiKey && <button onClick={() => setMode("player")} className="text-gray-500 hover:text-white"><ChevronLeft size={14} /></button>}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-center min-h-0">
                    <p className="text-[10px] text-gray-400 mb-2">YouTube API キーを設定:</p>
                    <input
                        type="text"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="AIza..."
                        className="w-full px-2 py-1.5 text-[10px] bg-[#1a1a1a] border border-[#3a3a3a] rounded mb-2"
                    />
                    <button onClick={saveApiKey} className="w-full py-1.5 text-[10px] text-white bg-red-600 hover:bg-red-700 rounded">
                        保存
                    </button>
                    <p className="text-[8px] text-gray-600 mt-2">
                        Google Cloud Console → APIs → YouTube Data API v3 を有効化 → 認証情報でAPIキー作成
                    </p>
                </div>
            </div>
        );
    }

    // Search mode
    if (mode === "search") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span>検索</span>
                    <button onClick={() => setMode("player")} className="text-gray-500 hover:text-white"><ChevronLeft size={14} /></button>
                </div>
                <div className="p-2 border-b border-[#2a2a2a]">
                    <div className="flex gap-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchVideos()}
                            placeholder="動画を検索..."
                            className="flex-1 px-2 py-1 text-[10px] bg-[#1a1a1a] border border-[#3a3a3a] rounded"
                        />
                        <button onClick={searchVideos} disabled={searching} className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded">
                            <Search size={12} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto min-h-0">
                    {searching && <p className="text-[10px] text-gray-500 p-2">検索中...</p>}
                    {searchResults.map((video) => (
                        <div key={video.id} className="flex items-center gap-2 p-2 hover:bg-[#1a1a1a] border-b border-[#222]">
                            <img src={video.thumbnail} alt="" className="w-16 h-9 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-gray-300 line-clamp-2">{video.title}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => playVideo(video)} className="p-1 text-gray-400 hover:text-white" title="再生">
                                    <Play size={12} />
                                </button>
                                <button onClick={() => addToPlaylist(video)} className="p-1 text-gray-400 hover:text-green-400" title="リストに追加">
                                    <Plus size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Playlist mode
    if (mode === "playlist") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span>プレイリスト ({playlist.length})</span>
                    <button onClick={() => setMode("player")} className="text-gray-500 hover:text-white"><ChevronLeft size={14} /></button>
                </div>
                <div className="flex-1 overflow-auto min-h-0">
                    {playlist.length === 0 && <p className="text-[10px] text-gray-500 p-3 text-center">プレイリストは空です</p>}
                    {playlist.map((video) => (
                        <div key={video.id} className={`flex items-center gap-2 p-2 hover:bg-[#1a1a1a] border-b border-[#222] ${video.id === videoId ? "bg-red-900/20" : ""}`}>
                            <img src={video.thumbnail} alt="" className="w-12 h-7 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] text-gray-300 line-clamp-2">{video.title}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => playVideo(video)} className="p-1 text-gray-400 hover:text-white"><Play size={10} /></button>
                                <button onClick={() => removeFromPlaylist(video.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={10} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Player mode - no video
    if (!videoId) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span>YOUTUBE</span>
                    <button onClick={() => setMode("settings")} className="text-[8px] text-gray-500 hover:text-white">設定</button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
                    <Play size={24} className="text-red-500" />
                    <div className="flex gap-2">
                        <button onClick={() => setMode("search")} className="px-3 py-1.5 text-[10px] text-white bg-red-600 hover:bg-red-700 rounded flex items-center gap-1">
                            <Search size={12} />検索
                        </button>
                        {playlist.length > 0 && (
                            <button onClick={() => setMode("playlist")} className="px-3 py-1.5 text-[10px] text-gray-300 bg-[#333] hover:bg-[#444] rounded flex items-center gap-1">
                                <List size={12} />リスト
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Player mode - with video
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between gap-1">
                <span className="truncate text-[9px]" title={currentTitle}>{currentTitle || "YOUTUBE"}</span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => setMode("search")} className="p-0.5 text-gray-500 hover:text-white" title="検索"><Search size={11} /></button>
                    <button onClick={() => setMode("playlist")} className="p-0.5 text-gray-500 hover:text-white" title="プレイリスト"><List size={11} /></button>
                    <button onClick={handleClear} className="p-0.5 text-gray-500 hover:text-red-500" title="クリア"><X size={11} /></button>
                </div>
            </div>
            <div className="flex-1 relative min-h-0">
                <iframe
                    ref={playerRef}
                    src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            {playlist.length > 1 && playlist.findIndex(v => v.id === videoId) < playlist.length - 1 && (
                <button onClick={playNext} className="absolute bottom-2 right-2 px-2 py-1 text-[8px] bg-black/70 hover:bg-black/90 text-white rounded z-10">
                    次へ ▶
                </button>
            )}
        </div>
    );
}
