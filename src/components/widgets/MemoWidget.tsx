"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

const STORAGE_KEY = "dashboard-memo";

export default function MemoWidget() {
    const [memo, setMemo] = useState("");
    const [mounted, setMounted] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            setMemo(data.text || "");
            if (data.savedAt) {
                setLastSaved(new Date(data.savedAt));
            }
        }
    }, []);

    const saveMemo = (text: string) => {
        setMemo(text);
        const now = new Date();
        setLastSaved(now);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            text,
            savedAt: now.toISOString()
        }));
    };

    const clearMemo = () => {
        setMemo("");
        setLastSaved(new Date());
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            text: "",
            savedAt: new Date().toISOString()
        }));
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    };

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">MEMO</div>

            <div className="flex-1 p-2 min-h-0">
                <textarea
                    value={memo}
                    onChange={(e) => saveMemo(e.target.value)}
                    placeholder="メモを入力..."
                    className="w-full h-full bg-transparent text-[11px] text-gray-300 placeholder-gray-600 resize-none outline-none leading-relaxed"
                />
            </div>

            {/* Footer with save status and clear button */}
            <div className="px-2 py-1 border-t border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
                {lastSaved ? (
                    <span className="text-[9px] text-gray-600">
                        保存済 {formatTime(lastSaved)}
                    </span>
                ) : (
                    <span className="text-[9px] text-gray-700">未保存</span>
                )}
                {memo && (
                    <button
                        onClick={clearMemo}
                        className="flex items-center gap-1 text-[9px] text-gray-600 hover:text-red-400 transition-colors"
                        title="Clear memo"
                    >
                        <Trash2 size={10} />
                        <span>クリア</span>
                    </button>
                )}
            </div>
        </div>
    );
}
