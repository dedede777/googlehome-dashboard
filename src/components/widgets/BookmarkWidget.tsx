"use client";

import { useState, useEffect } from "react";
import { Plus, X, ExternalLink, Edit2 } from "lucide-react";

interface Bookmark {
    id: number;
    name: string;
    url: string;
    icon?: string;
}

const STORAGE_KEY = "dashboard-bookmarks";

const DEFAULT_BOOKMARKS: Bookmark[] = [
    { id: 1, name: "GitHub", url: "https://github.com" },
    { id: 2, name: "Notion", url: "https://notion.so" },
    { id: 3, name: "Figma", url: "https://figma.com" },
];

export default function BookmarkWidget() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(DEFAULT_BOOKMARKS);
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setBookmarks(JSON.parse(saved));
        }
    }, []);

    const saveBookmarks = (newBookmarks: Bookmark[]) => {
        setBookmarks(newBookmarks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
    };

    const addBookmark = () => {
        if (!name.trim() || !url.trim()) return;

        const newUrl = url.startsWith("http") ? url : `https://${url}`;
        const newBookmark: Bookmark = {
            id: Date.now(),
            name: name.trim(),
            url: newUrl,
        };

        saveBookmarks([...bookmarks, newBookmark]);
        setName("");
        setUrl("");
        setShowAdd(false);
    };

    const updateBookmark = () => {
        if (!editId || !name.trim() || !url.trim()) return;

        const newUrl = url.startsWith("http") ? url : `https://${url}`;
        const updated = bookmarks.map(b =>
            b.id === editId ? { ...b, name: name.trim(), url: newUrl } : b
        );

        saveBookmarks(updated);
        setName("");
        setUrl("");
        setEditId(null);
    };

    const deleteBookmark = (id: number) => {
        saveBookmarks(bookmarks.filter(b => b.id !== id));
    };

    const startEdit = (bookmark: Bookmark) => {
        setEditId(bookmark.id);
        setName(bookmark.name);
        setUrl(bookmark.url);
        setShowAdd(false);
    };

    const getFavicon = (bookmarkUrl: string) => {
        try {
            const domain = new URL(bookmarkUrl).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return null;
        }
    };

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">BOOKMARKS</div>

            <div className="flex-1 p-2 overflow-auto min-h-0">
                {/* Bookmark List */}
                <div className="space-y-1">
                    {bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="group flex items-center gap-2 p-1.5 hover:bg-[#252525] transition-colors"
                        >
                            <img
                                src={getFavicon(bookmark.url) || ""}
                                alt=""
                                className="w-4 h-4 flex-shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-[10px] text-gray-400 hover:text-gray-200 truncate"
                            >
                                {bookmark.name}
                            </a>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                    onClick={() => startEdit(bookmark)}
                                    className="p-0.5 text-gray-600 hover:text-gray-300"
                                >
                                    <Edit2 size={10} />
                                </button>
                                <button
                                    onClick={() => deleteBookmark(bookmark.id)}
                                    className="p-0.5 text-gray-600 hover:text-red-400"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add/Edit Form */}
                {(showAdd || editId) && (
                    <div className="mt-2 p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                        />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="URL"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                            onKeyDown={(e) => e.key === "Enter" && (editId ? updateBookmark() : addBookmark())}
                        />
                        <div className="flex gap-1">
                            <button
                                onClick={editId ? updateBookmark : addBookmark}
                                className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                            >
                                {editId ? "更新" : "追加"}
                            </button>
                            <button
                                onClick={() => { setShowAdd(false); setEditId(null); setName(""); setUrl(""); }}
                                className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Button */}
            {!showAdd && !editId && (
                <div className="p-1.5 border-t border-[#2a2a2a] flex-shrink-0">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                    >
                        <Plus size={10} />
                        <span>追加</span>
                    </button>
                </div>
            )}
        </div>
    );
}
