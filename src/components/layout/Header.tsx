"use client";

import { Search, Terminal } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
            setSearchQuery("");
        }
    };

    return (
        <header className="brutalist-card flex items-center justify-between gap-4 col-span-full">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 border-2 border-[var(--border-color)] flex items-center justify-center bg-[var(--background)] hover:border-[var(--accent)] transition-colors">
                    <span className="text-2xl font-bold text-[var(--accent)]">G</span>
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-bold tracking-wider">COMMAND_CENTER</h1>
                    <p className="text-xs text-[var(--border-color)]">SYSTEM::ONLINE</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl flex items-center gap-2">
                <div className="flex items-center gap-2 text-[var(--accent)]">
                    <Terminal size={16} />
                    <span className="hidden sm:inline text-sm">$</span>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="search query..."
                    className="flex-1 bg-transparent text-sm"
                />
                <button type="submit" className="p-2 border-0 bg-transparent hover:bg-transparent">
                    <Search size={18} className="hover:text-[var(--accent)]" />
                </button>
            </form>
        </header>
    );
}
