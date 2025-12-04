"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, ExternalLink, Settings, X, Plus, Sparkles } from "lucide-react";

interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    description?: string;
    summary?: string;
    loadingSummary?: boolean;
}

interface RssFeed {
    id: string;
    name: string;
    url: string;
}

const STORAGE_KEY = "dashboard-rss-feeds";
const SETTINGS_KEY = "dashboard-rss-settings";

// Default AI news feeds
const DEFAULT_FEEDS: RssFeed[] = [
    { id: "1", name: "MIT AI News", url: "https://news.mit.edu/rss/topic/artificial-intelligence2" },
    { id: "2", name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
];

// CORS proxy to fetch RSS feeds
const PROXY_URL = "https://api.allorigins.win/raw?url=";

export default function RSSWidget() {
    const [feeds, setFeeds] = useState<RssFeed[]>(DEFAULT_FEEDS);
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [enableSummary, setEnableSummary] = useState(false);
    const summarizingRef = useRef(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setFeeds(JSON.parse(saved));
        }
        const settings = localStorage.getItem(SETTINGS_KEY);
        if (settings) {
            const parsed = JSON.parse(settings);
            setEnableSummary(parsed.enableSummary || false);
        }
    }, []);

    const saveSettings = (summary: boolean) => {
        setEnableSummary(summary);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ enableSummary: summary }));
    };

    const summarizeItem = async (item: FeedItem): Promise<string> => {
        try {
            const response = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: item.title,
                    content: item.description?.replace(/<[^>]*>/g, "").slice(0, 1000),
                }),
            });
            const data = await response.json();
            if (data.summary && data.summary.trim()) {
                return data.summary;
            }
            // Fallback: create simple summary from title
            return `・${item.title}`;
        } catch {
            return `・${item.title}`;
        }
    };

    const summarizeAllItems = async (itemsToSummarize: FeedItem[]) => {
        if (summarizingRef.current) return;
        summarizingRef.current = true;

        for (let i = 0; i < itemsToSummarize.length; i++) {
            const item = itemsToSummarize[i];
            if (!item.summary) {
                setItems(prev => prev.map((it, idx) =>
                    idx === i ? { ...it, loadingSummary: true } : it
                ));

                const summary = await summarizeItem(item);

                setItems(prev => prev.map((it, idx) =>
                    idx === i ? { ...it, summary, loadingSummary: false } : it
                ));

                // Small delay between API calls
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        summarizingRef.current = false;
    };

    const fetchFeeds = async () => {
        if (feeds.length === 0) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        const allItems: FeedItem[] = [];

        for (const feed of feeds) {
            try {
                const response = await fetch(PROXY_URL + encodeURIComponent(feed.url));
                const text = await response.text();

                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const itemNodes = xml.querySelectorAll("item");

                itemNodes.forEach((item, index) => {
                    if (index < 3) { // Limit to 3 items per feed for summaries
                        const title = item.querySelector("title")?.textContent || "";
                        const link = item.querySelector("link")?.textContent || "";
                        const pubDate = item.querySelector("pubDate")?.textContent || "";
                        const description = item.querySelector("description")?.textContent || "";

                        if (title && link) {
                            allItems.push({ title, link, pubDate, description });
                        }
                    }
                });
            } catch (err) {
                console.error("Failed to fetch feed:", feed.name, err);
            }
        }

        allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        const limitedItems = allItems.slice(0, 5);
        setItems(limitedItems);
        setLoading(false);
        setLastUpdated(new Date());

        // Auto-summarize if enabled
        if (enableSummary) {
            summarizeAllItems(limitedItems);
        }
    };

    useEffect(() => {
        if (mounted) {
            fetchFeeds();
            const interval = setInterval(fetchFeeds, 3 * 60 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [feeds, mounted, enableSummary]);

    const saveFeeds = (newFeeds: RssFeed[]) => {
        setFeeds(newFeeds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFeeds));
    };

    const addFeed = () => {
        if (!newName.trim() || !newUrl.trim()) return;
        const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
        const newFeed: RssFeed = {
            id: Date.now().toString(),
            name: newName.trim(),
            url,
        };
        saveFeeds([...feeds, newFeed]);
        setNewName("");
        setNewUrl("");
    };

    const removeFeed = (id: string) => {
        saveFeeds(feeds.filter(f => f.id !== id));
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
            if (diffHours < 1) return "Just now";
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffHours < 48) return "Yesterday";
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch {
            return "";
        }
    };

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-1">
                    <span>RSS FEED</span>
                    {enableSummary && <Sparkles size={10} className="text-yellow-500" />}
                </div>
                {lastUpdated && (
                    <span className="text-[8px] text-gray-600 font-normal">
                        {lastUpdated.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                )}
            </div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {/* AI Summary Toggle */}
                    <div className="flex items-center justify-between mb-3 p-2 bg-[#252525] border border-[#3a3a3a]">
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-yellow-500" />
                            <span className="text-[10px] text-gray-300">AI要約 (Gemini)</span>
                        </div>
                        <button
                            onClick={() => saveSettings(!enableSummary)}
                            className={`w-8 h-4 rounded-full transition-colors ${enableSummary ? "bg-green-600" : "bg-gray-600"
                                }`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform mx-0.5 ${enableSummary ? "translate-x-4" : ""
                                }`} />
                        </button>
                    </div>

                    <p className="text-[9px] text-gray-500 mb-2">登録フィード:</p>
                    {feeds.map((feed) => (
                        <div
                            key={feed.id}
                            className="flex items-center justify-between text-[10px] p-1.5 mb-1 bg-[#252525] border border-[#3a3a3a]"
                        >
                            <span className="text-gray-300 truncate flex-1">{feed.name}</span>
                            <button
                                onClick={() => removeFeed(feed.id)}
                                className="ml-2 text-gray-500 hover:text-red-400"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    <div className="mt-2 space-y-1.5">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="フィード名"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                        />
                        <input
                            type="text"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="RSS URL"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                            onKeyDown={(e) => e.key === "Enter" && addFeed()}
                        />
                        <button
                            onClick={addFeed}
                            className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-gray-400 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                        >
                            <Plus size={10} />
                            追加
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {loading ? (
                        <p className="text-[10px] text-gray-600">読み込み中...</p>
                    ) : error ? (
                        <p className="text-[10px] text-red-400">{error}</p>
                    ) : items.length === 0 ? (
                        <p className="text-[10px] text-gray-600">記事なし</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="border-b border-[#2a2a2a] pb-2 last:border-0">
                                    {/* Summary or Title */}
                                    {enableSummary ? (
                                        <div className="mb-1.5">
                                            {item.loadingSummary ? (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <RefreshCw size={10} className="animate-spin" />
                                                    要約中...
                                                </p>
                                            ) : item.summary ? (
                                                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                                    {item.summary}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-400 line-clamp-2">
                                                    {item.title}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-1.5">
                                            {item.title}
                                        </p>
                                    )}

                                    {/* Link and Date */}
                                    <div className="flex items-center justify-between">
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[9px] text-blue-400 hover:text-blue-300"
                                        >
                                            <ExternalLink size={8} />
                                            <span>記事を読む</span>
                                        </a>
                                        <span className="text-[8px] text-gray-600">
                                            {formatDate(item.pubDate)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="p-1.5 border-t border-[#2a2a2a] flex gap-1 flex-shrink-0">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                >
                    {showSettings ? <X size={10} /> : <Settings size={10} />}
                    <span>{showSettings ? "完了" : "設定"}</span>
                </button>
                {!showSettings && (
                    <button
                        onClick={fetchFeeds}
                        disabled={loading}
                        className="px-2 py-1 text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                    </button>
                )}
            </div>
        </div>
    );
}
