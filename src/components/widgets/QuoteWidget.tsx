"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

// Curated quotes for motivation
const QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "Move fast and break things.", author: "Mark Zuckerberg" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "継続は力なり。", author: "Japanese Proverb" },
    { text: "七転び八起き。", author: "Japanese Proverb" },
    { text: "一期一会。", author: "Japanese Proverb" },
    { text: "初心忘るべからず。", author: "世阿弥" },
];

const STORAGE_KEY = "dashboard-quote-index";

export default function QuoteWidget() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved index or use today's date to pick a quote
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            const today = new Date().toDateString();
            if (data.date === today) {
                setQuoteIndex(data.index);
            } else {
                // New day, pick a new random quote
                const newIndex = Math.floor(Math.random() * QUOTES.length);
                setQuoteIndex(newIndex);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: newIndex, date: today }));
            }
        } else {
            const newIndex = Math.floor(Math.random() * QUOTES.length);
            setQuoteIndex(newIndex);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: newIndex, date: new Date().toDateString() }));
        }
    }, []);

    const refreshQuote = () => {
        const newIndex = (quoteIndex + 1) % QUOTES.length;
        setQuoteIndex(newIndex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: newIndex, date: new Date().toDateString() }));
    };

    if (!mounted) return null;

    const quote = QUOTES[quoteIndex];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">QUOTE</div>

            <div className="flex-1 p-3 flex flex-col justify-center min-h-0 overflow-auto">
                <p className="text-[11px] text-gray-300 leading-relaxed italic mb-2">
                    "{quote.text}"
                </p>
                <p className="text-[10px] text-gray-500 text-right">
                    — {quote.author}
                </p>
            </div>

            <div className="p-1.5 border-t border-[#2a2a2a] flex-shrink-0">
                <button
                    onClick={refreshQuote}
                    className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                >
                    <RefreshCw size={10} />
                    <span>次の名言</span>
                </button>
            </div>
        </div>
    );
}
