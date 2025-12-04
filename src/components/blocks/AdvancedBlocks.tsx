"use client";

import { Block, BlockContent, CategoryItem, TaskItem } from "@/lib/blocks";
import { useState } from "react";

interface CategoryCardsBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function CategoryCardsBlock({ block, onUpdate }: CategoryCardsBlockProps) {
    const categories = block.content.categories || [];

    const updateCategory = (id: string, updates: Partial<CategoryItem>) => {
        const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
        onUpdate({ ...block.content, categories: updated });
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
                <div
                    key={cat.id}
                    className="relative group overflow-hidden rounded-lg cursor-pointer"
                >
                    <div
                        className="h-24 bg-cover bg-center"
                        style={{ backgroundImage: `url(${cat.imageUrl})` }}
                    >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <span className="text-2xl mb-1">{cat.icon}</span>
                        <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => updateCategory(cat.id, { title: e.target.value })}
                            className="bg-transparent border-none text-center text-sm font-medium outline-none w-full px-2"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

interface TaskTableBlockProps {
    block: Block;
    onUpdate: (content: BlockContent) => void;
}

export function TaskTableBlock({ block, onUpdate }: TaskTableBlockProps) {
    const tasks = block.content.tasks || [];
    const [newTask, setNewTask] = useState("");

    const toggleTask = (id: string) => {
        const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        onUpdate({ ...block.content, tasks: updated });
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        const task: TaskItem = {
            id: Date.now().toString(),
            title: newTask.trim(),
            tag: 'Work',
            tagColor: '#8b5cf6',
            date: new Date().toISOString().split('T')[0],
            priority: 'medium',
            completed: false,
        };
        onUpdate({ ...block.content, tasks: [...tasks, task] });
        setNewTask("");
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter(t => t.id !== id);
        onUpdate({ ...block.content, tasks: updated });
    };

    const priorityColors = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-green-500/20 text-green-400',
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wider px-2">
                <div className="col-span-1"></div>
                <div className="col-span-5">Task</div>
                <div className="col-span-2">Tag</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Priority</div>
            </div>

            {/* Tasks */}
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="grid grid-cols-12 gap-2 items-center px-2 py-2 hover:bg-white/5 rounded group"
                >
                    <div className="col-span-1">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-transparent"
                        />
                    </div>
                    <div className={`col-span-5 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task.title}
                    </div>
                    <div className="col-span-2">
                        <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: task.tagColor + '30', color: task.tagColor }}
                        >
                            {task.tag}
                        </span>
                    </div>
                    <div className="col-span-2 text-xs text-gray-400">
                        {task.date}
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                            {task.priority === 'high' ? 'Hig' : task.priority === 'medium' ? 'Med' : 'Low'}
                        </span>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-sm"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}

            {/* Add Task */}
            <div className="flex gap-2 px-2 pt-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="+ New task..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-400 placeholder-gray-600"
                />
            </div>
        </div>
    );
}

interface CalendarBlockProps {
    block: Block;
}

export function CalendarBlock({ block }: CalendarBlockProps) {
    const [currentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = currentDate.getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300">
                    {monthNames[month]} {year}
                </h3>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs text-gray-500 py-1">{d}</div>
                ))}
                {days.map((day, i) => (
                    <div
                        key={i}
                        className={`text-sm py-2 rounded ${day === today
                                ? 'bg-purple-600 text-white'
                                : day
                                    ? 'text-gray-400 hover:bg-gray-700/50 cursor-pointer'
                                    : ''
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface UpcomingBlockProps {
    block: Block;
}

export function UpcomingBlock({ block }: UpcomingBlockProps) {
    const items = [
        { id: 1, title: 'Edit Website', priority: 'high', date: 'Today' },
        { id: 2, title: 'Write copy', priority: 'high', date: 'Today' },
        { id: 3, title: 'Edit Photo', priority: 'medium', date: 'Tomorrow' },
        { id: 4, title: 'Write blog post', priority: 'high', date: 'Tomorrow' },
    ];

    const grouped = items.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([date, tasks]) => (
                <div key={date}>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{date}</h4>
                    <div className="space-y-1">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="w-3 h-3 rounded border-gray-600 bg-transparent" />
                                <span className="text-gray-300 flex-1">{task.title}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {task.priority === 'high' ? 'Hig' : 'Med'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
