"use client";

import { Calendar, CheckSquare, Square, Plus, X } from "lucide-react";
import { useState } from "react";

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

const MOCK_EVENTS = [
    { id: 1, title: "Team Standup", time: "09:00" },
    { id: 2, title: "Project Review", time: "14:00" },
    { id: 3, title: "Client Call", time: "16:30" },
];

export default function CalendarTasks() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, text: "Review PR #42", completed: false },
        { id: 2, text: "Update documentation", completed: true },
    ]);
    const [newTask, setNewTask] = useState("");

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            setTasks([
                ...tasks,
                { id: Date.now(), text: newTask.trim(), completed: false },
            ]);
            setNewTask("");
        }
    };

    const toggleTask = (id: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    return (
        <div className="brutalist-card h-full flex flex-col">
            <div className="grid grid-cols-2 gap-4 h-full">
                {/* Calendar Section */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-[var(--accent)]" />
                        <h2 className="text-sm font-bold tracking-wider text-[var(--accent)]">
                            SCHEDULE
                        </h2>
                    </div>
                    <div className="space-y-2 flex-1">
                        {MOCK_EVENTS.map((event) => (
                            <div
                                key={event.id}
                                className="p-2 border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors"
                            >
                                <p className="text-xs text-[var(--accent)]">{event.time}</p>
                                <p className="text-sm truncate">{event.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckSquare size={14} className="text-[var(--accent)]" />
                        <h2 className="text-sm font-bold tracking-wider text-[var(--accent)]">
                            TASKS
                        </h2>
                    </div>
                    <div className="space-y-2 flex-1 overflow-auto max-h-32">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-2 p-2 border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors group"
                            >
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className="p-0 border-0 bg-transparent hover:bg-transparent"
                                >
                                    {task.completed ? (
                                        <CheckSquare size={14} className="text-[var(--accent)]" />
                                    ) : (
                                        <Square size={14} className="text-[var(--border-color)]" />
                                    )}
                                </button>
                                <span
                                    className={`text-xs flex-1 truncate ${task.completed ? "line-through text-[var(--border-color)]" : ""
                                        }`}
                                >
                                    {task.text}
                                </span>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-0 border-0 bg-transparent hover:bg-transparent opacity-0 group-hover:opacity-100"
                                >
                                    <X size={12} className="text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={addTask} className="mt-2 flex gap-2">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="new task..."
                            className="flex-1 text-xs p-1"
                        />
                        <button type="submit" className="p-1">
                            <Plus size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
