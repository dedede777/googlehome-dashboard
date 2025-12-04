"use client";

import { useState, useRef, useEffect } from "react";
import { Grid3X3 } from "lucide-react";

const GOOGLE_SERVICES = [
    { id: "search", name: "Search", url: "https://www.google.com", color: "#4285F4" },
    { id: "gmail", name: "Gmail", url: "https://mail.google.com", color: "#EA4335" },
    { id: "drive", name: "Drive", url: "https://drive.google.com", color: "#FBBC04" },
    { id: "docs", name: "Docs", url: "https://docs.google.com", color: "#4285F4" },
    { id: "sheets", name: "Sheets", url: "https://sheets.google.com", color: "#34A853" },
    { id: "slides", name: "Slides", url: "https://slides.google.com", color: "#FBBC04" },
    { id: "calendar", name: "Calendar", url: "https://calendar.google.com", color: "#4285F4" },
    { id: "meet", name: "Meet", url: "https://meet.google.com", color: "#34A853" },
    { id: "photos", name: "Photos", url: "https://photos.google.com", color: "#EA4335" },
    { id: "youtube", name: "YouTube", url: "https://youtube.com", color: "#FF0000" },
    { id: "maps", name: "Maps", url: "https://maps.google.com", color: "#34A853" },
    { id: "keep", name: "Keep", url: "https://keep.google.com", color: "#FBBC04" },
];

// SVG icons for each service
const SERVICE_ICONS: Record<string, React.ReactNode> = {
    search: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    ),
    gmail: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
        </svg>
    ),
    drive: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#FBBC04" d="M6.59 21.41l2.36-4.09h12.18l-2.36 4.09z" />
            <path fill="#4285F4" d="L8.95 17.32L2.82 6.68l2.36-4.09 6.14 10.64z" />
            <path fill="#34A853" d="M21.13 17.32H8.95l2.36-4.09 6.14-10.64 2.36 4.09-4.82 8.36z" />
        </svg>
    ),
    docs: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#4285F4" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            <path fill="#4285F4" d="M8 12h8v2H8zm0 4h8v2H8z" />
        </svg>
    ),
    sheets: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#34A853" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            <path fill="#34A853" d="M8 12h3v2H8zm5 0h3v2h-3zm-5 4h3v2H8zm5 0h3v2h-3z" />
        </svg>
    ),
    slides: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#FBBC04" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            <rect fill="#FBBC04" x="7" y="11" width="10" height="6" rx="1" />
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            <path fill="#4285F4" d="M9 14h2v2H9zm4 0h2v2h-2z" />
        </svg>
    ),
    meet: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#34A853" d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
            <path fill="#34A853" d="M12 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            <path fill="#34A853" d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3z" />
        </svg>
    ),
    photos: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#EA4335" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    ),
    maps: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#34A853" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
    ),
    keep: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path fill="#FBBC04" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zm3-3H9V9h6v5z" />
        </svg>
    ),
};

export default function GoogleAppsLauncher() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="p-2.5 hover:bg-[#252525] transition-colors rounded-full"
                title="Google Apps"
            >
                <Grid3X3 size={20} className="text-gray-400" />
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-50 bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl w-72 p-3">
                    <div className="grid grid-cols-3 gap-2">
                        {GOOGLE_SERVICES.map((service) => (
                            <a
                                key={service.id}
                                href={service.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-1.5 p-3 hover:bg-[#252525] transition-colors rounded"
                                onClick={() => setOpen(false)}
                            >
                                <div className="w-10 h-10 flex items-center justify-center">
                                    {SERVICE_ICONS[service.id] || (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: service.color }}
                                        >
                                            {service.name[0]}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 text-center">
                                    {service.name}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
