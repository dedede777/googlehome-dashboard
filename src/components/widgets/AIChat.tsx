"use client";

import { MessageSquare, Send, X, Minus } from "lucide-react";
import { useState } from "react";

interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
}

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: "assistant",
            content: "SYSTEM READY. How can I assist you?",
        },
    ]);
    const [input, setInput] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            const userMessage: Message = {
                id: Date.now(),
                role: "user",
                content: input.trim(),
            };
            setMessages([...messages, userMessage]);

            // Mock AI response
            setTimeout(() => {
                const aiResponse: Message = {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: "Processing request... [AI integration pending]",
                };
                setMessages((prev) => [...prev, aiResponse]);
            }, 500);

            setInput("");
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 w-14 h-14 flex items-center justify-center bg-[var(--card-bg)] border-2 border-[var(--border-color)] hover:border-[var(--accent)] transition-colors z-50"
            >
                <MessageSquare size={24} className="text-[var(--accent)]" />
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-4 right-4 w-80 bg-[var(--card-bg)] border-2 border-[var(--border-color)] z-50 flex flex-col ${isMinimized ? "h-12" : "h-96"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b-2 border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-[var(--accent)]" />
                    <span className="text-xs font-bold tracking-wider text-[var(--accent)]">
                        AI::CHAT
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 border-0 bg-transparent hover:bg-transparent"
                    >
                        <Minus size={14} className="text-[var(--border-color)] hover:text-[var(--accent)]" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 border-0 bg-transparent hover:bg-transparent"
                    >
                        <X size={14} className="text-[var(--border-color)] hover:text-red-500" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`text-xs p-2 ${msg.role === "user"
                                        ? "bg-[var(--hover-bg)] ml-8"
                                        : "border border-[var(--border-color)] mr-8"
                                    }`}
                            >
                                <span className="text-[8px] text-[var(--accent)] block mb-1">
                                    {msg.role === "user" ? "USER" : "SYSTEM"}
                                </span>
                                {msg.content}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSend}
                        className="p-2 border-t-2 border-[var(--border-color)] flex gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter command..."
                            className="flex-1 text-xs p-1 bg-[var(--background)]"
                        />
                        <button type="submit" className="p-1">
                            <Send size={14} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
