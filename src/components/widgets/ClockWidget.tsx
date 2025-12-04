"use client";

import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function ClockWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">CLOCK</div>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <Clock size={24} className="text-[#555] mb-2" />
                <p className="text-2xl font-mono text-[#888]">
                    {time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-[10px] text-[#666] mt-1">
                    {time.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" })}
                </p>
            </div>
        </div>
    );
}
