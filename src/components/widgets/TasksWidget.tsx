"use client";

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";

interface Task {
    id: number;
    text: string;
    done: boolean;
}

const STORAGE_KEY = "dashboard-tasks";

const DEFAULT_TASKS: Task[] = [
    { id: 1, text: "Morning routine", done: false },
    { id: 2, text: "Review emails", done: false },
    { id: 3, text: "Daily standup", done: false },
];

export default function TasksWidget() {
    const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
    const [newTask, setNewTask] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setTasks(JSON.parse(saved));
        }
    }, []);

    const saveTasks = (newTasks: Task[]) => {
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    };

    const toggleTask = (id: number) => {
        saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            saveTasks([...tasks, { id: Date.now(), text: newTask.trim(), done: false }]);
            setNewTask("");
        }
    };

    const resetAllTasks = () => {
        saveTasks(tasks.map(t => ({ ...t, done: false })));
    };

    const deleteTask = (id: number) => {
        saveTasks(tasks.filter(t => t.id !== id));
    };

    const hasCompletedTasks = tasks.some(t => t.done);

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">DAILY TASKS</div>
            <div className="flex-1 p-2 overflow-auto min-h-0 space-y-1">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center gap-2 group"
                    >
                        <div
                            className={`w-3 h-3 border border-[#555] flex items-center justify-center cursor-pointer hover:border-[#888] flex-shrink-0 ${task.done ? "bg-[#666]" : ""}`}
                            onClick={() => toggleTask(task.id)}
                        >
                            {task.done && <span className="text-[#1a1a1a] text-[8px]">✓</span>}
                        </div>
                        <span className={`text-[10px] flex-1 ${task.done ? "text-[#555] line-through" : "text-[#888]"}`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-[10px] text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-[#2a2a2a] space-y-1.5 flex-shrink-0">
                <form onSubmit={addTask}>
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add task..."
                        className="w-full bg-transparent border border-[#3a3a3a] text-[10px] text-[#888] p-1 outline-none focus:border-[#555]"
                    />
                </form>
                {hasCompletedTasks && (
                    <button
                        onClick={resetAllTasks}
                        className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                        title="Reset all checkboxes"
                    >
                        <RotateCcw size={10} />
                        <span>リセット</span>
                    </button>
                )}
            </div>
        </div>
    );
}
