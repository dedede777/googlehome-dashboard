"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

type TimerMode = "work" | "break";

const WORK_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export default function PomodoroWidget() {
    const [mode, setMode] = useState<TimerMode>("work");
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element for notification
        audioRef.current = new Audio();
        audioRef.current.volume = 0.5;
    }, []);

    const playNotification = () => {
        // Use Web Audio API for a simple beep
        try {
            const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = "sine";
            gainNode.gain.value = 0.3;

            oscillator.start();

            // Beep pattern: beep-beep-beep
            setTimeout(() => { gainNode.gain.value = 0; }, 150);
            setTimeout(() => { gainNode.gain.value = 0.3; }, 250);
            setTimeout(() => { gainNode.gain.value = 0; }, 400);
            setTimeout(() => { gainNode.gain.value = 0.3; }, 500);
            setTimeout(() => { gainNode.gain.value = 0; }, 650);
            setTimeout(() => {
                oscillator.stop();
                audioContext.close();
            }, 700);
        } catch {
            console.log("Audio not available");
        }
    };

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Timer finished
            playNotification();

            if (mode === "work") {
                setSessions((prev) => prev + 1);
                setMode("break");
                setTimeLeft(BREAK_TIME);
            } else {
                setMode("work");
                setTimeLeft(WORK_TIME);
            }
            setIsRunning(false);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, mode]);

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === "work" ? WORK_TIME : BREAK_TIME);
    };

    const switchMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === "work" ? WORK_TIME : BREAK_TIME);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = mode === "work"
        ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
        : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex items-center justify-between flex-shrink-0">
                <span>POMODORO</span>
                <span className="text-[9px] text-gray-600 font-normal">{sessions} sessions</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-0">
                {/* Mode Toggle */}
                <div className="flex gap-1 mb-2">
                    <button
                        onClick={() => switchMode("work")}
                        className={`flex items-center gap-1 px-2 py-1 text-[9px] border transition-colors ${mode === "work"
                            ? "bg-[#252525] border-[#3a3a3a] text-gray-300"
                            : "bg-transparent border-[#2a2a2a] text-gray-600 hover:border-[#3a3a3a]"
                            }`}
                    >
                        <Brain size={10} />
                        作業
                    </button>
                    <button
                        onClick={() => switchMode("break")}
                        className={`flex items-center gap-1 px-2 py-1 text-[9px] border transition-colors ${mode === "break"
                            ? "bg-[#252525] border-[#3a3a3a] text-gray-300"
                            : "bg-transparent border-[#2a2a2a] text-gray-600 hover:border-[#3a3a3a]"
                            }`}
                    >
                        <Coffee size={10} />
                        休憩
                    </button>
                </div>

                {/* Timer Display */}
                <div className="relative mb-2">
                    <div className="text-2xl font-mono text-gray-300 tracking-wider">
                        {formatTime(timeLeft)}
                    </div>
                    {/* Progress bar */}
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2a2a2a]">
                        <div
                            className={`h-full transition-all ${mode === "work" ? "bg-red-500/50" : "bg-green-500/50"}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={toggleTimer}
                        className={`p-2 border transition-colors ${isRunning
                            ? "bg-[#252525] border-[#3a3a3a] text-yellow-500"
                            : "bg-[#252525] border-[#3a3a3a] text-green-500 hover:bg-[#2a2a2a]"
                            }`}
                    >
                        {isRunning ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="p-2 bg-[#252525] border border-[#3a3a3a] text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
