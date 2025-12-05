"use client";

import { useState, useEffect } from "react";
import { Plus, X, Check, RotateCcw } from "lucide-react";

interface Habit {
    id: string;
    name: string;
    emoji: string;
    completedDates: string[];
}

const STORAGE_KEY = "dashboard-habits";

const DEFAULT_HABITS: Habit[] = [
    { id: "1", name: "運動", emoji: "🏃", completedDates: [] },
    { id: "2", name: "読書", emoji: "📚", completedDates: [] },
    { id: "3", name: "瞑想", emoji: "🧘", completedDates: [] },
];

export default function HabitWidget() {
    const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmoji, setNewEmoji] = useState("✨");
    const [mounted, setMounted] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setHabits(JSON.parse(saved));
    }, []);

    const saveHabits = (h: Habit[]) => {
        setHabits(h);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
    };

    const toggleHabit = (id: string) => {
        const updated = habits.map(h => {
            if (h.id !== id) return h;
            const completed = h.completedDates.includes(today);
            return {
                ...h,
                completedDates: completed
                    ? h.completedDates.filter(d => d !== today)
                    : [...h.completedDates, today],
            };
        });
        saveHabits(updated);
    };

    const addHabit = () => {
        if (!newName.trim()) return;
        const newHabit: Habit = {
            id: Date.now().toString(),
            name: newName.trim(),
            emoji: newEmoji || "✨",
            completedDates: [],
        };
        saveHabits([...habits, newHabit]);
        setNewName("");
        setNewEmoji("✨");
        setShowAddForm(false);
    };

    const deleteHabit = (id: string) => {
        saveHabits(habits.filter(h => h.id !== id));
    };

    const getStreak = (habit: Habit): number => {
        let streak = 0;
        const sortedDates = [...habit.completedDates].sort().reverse();
        const checkDate = new Date();

        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split("T")[0];
            if (sortedDates.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i === 0) {
                // Today not completed, check from yesterday
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span>HABITS</span>
                <span className="text-[9px] text-gray-500">{completedToday}/{habits.length}</span>
            </div>

            <div className="flex-1 p-2 overflow-auto min-h-0">
                <div className="space-y-1.5">
                    {habits.map((habit) => {
                        const isCompleted = habit.completedDates.includes(today);
                        const streak = getStreak(habit);
                        return (
                            <div key={habit.id} className="flex items-center gap-2 group">
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`flex items-center gap-2 flex-1 p-2 border transition-all ${isCompleted
                                            ? "bg-green-900/30 border-green-600/50"
                                            : "bg-[#151515] border-[#2a2a2a] hover:border-[#3a3a3a]"
                                        }`}
                                >
                                    <span className="text-base">{habit.emoji}</span>
                                    <span className={`text-[10px] flex-1 text-left ${isCompleted ? "text-green-400" : "text-gray-400"}`}>
                                        {habit.name}
                                    </span>
                                    {streak > 0 && (
                                        <span className="text-[8px] text-orange-400">🔥{streak}</span>
                                    )}
                                    {isCompleted && <Check size={12} className="text-green-500" />}
                                </button>
                                <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {showAddForm ? (
                    <div className="mt-2 p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newEmoji}
                                onChange={(e) => setNewEmoji(e.target.value)}
                                className="w-10 bg-[#0a0a0a] border border-[#3a3a3a] text-center text-sm p-1.5 outline-none focus:border-[#555]"
                                maxLength={2}
                            />
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="習慣名"
                                className="flex-1 bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-1">
                            <button onClick={addHabit} className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]">追加</button>
                            <button onClick={() => { setShowAddForm(false); setNewName(""); }} className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]">キャンセル</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 bg-[#151515] border border-dashed border-[#3a3a3a] hover:border-[#555] transition-colors"
                    >
                        <Plus size={12} /><span>習慣を追加</span>
                    </button>
                )}
            </div>
        </div>
    );
}
