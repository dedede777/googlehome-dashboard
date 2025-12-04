"use client";

import {
    Lightbulb,
    Laptop,
    Youtube,
    Music,
    Home,
    Settings,
} from "lucide-react";

interface QuickLink {
    id: number;
    icon: React.ReactNode;
    label: string;
    action: () => void;
}

export default function QuickLinks() {
    const links: QuickLink[] = [
        {
            id: 1,
            icon: <Lightbulb size={24} />,
            label: "LIGHTS",
            action: () => console.log("Lights toggle"),
        },
        {
            id: 2,
            icon: <Laptop size={24} />,
            label: "WORK",
            action: () => window.open("https://github.com", "_blank"),
        },
        {
            id: 3,
            icon: <Youtube size={24} />,
            label: "YOUTUBE",
            action: () => window.open("https://youtube.com", "_blank"),
        },
        {
            id: 4,
            icon: <Music size={24} />,
            label: "MUSIC",
            action: () => window.open("https://spotify.com", "_blank"),
        },
        {
            id: 5,
            icon: <Home size={24} />,
            label: "HOME",
            action: () => console.log("Home action"),
        },
        {
            id: 6,
            icon: <Settings size={24} />,
            label: "CONFIG",
            action: () => console.log("Settings"),
        },
    ];

    return (
        <div className="brutalist-card h-full">
            <h2 className="text-sm font-bold tracking-wider text-[var(--accent)] mb-4">
                QUICK::ACCESS
            </h2>
            <div className="grid grid-cols-3 gap-2">
                {links.map((link) => (
                    <button
                        key={link.id}
                        onClick={link.action}
                        className="aspect-square flex flex-col items-center justify-center gap-1 p-2"
                    >
                        <span className="text-[var(--foreground)] group-hover:text-[var(--accent)]">
                            {link.icon}
                        </span>
                        <span className="text-[8px] tracking-wider">{link.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
