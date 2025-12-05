"use client";

import { useState, useEffect } from "react";
import { RotateCcw, ExternalLink, ChevronUp, ChevronDown, Edit2, X, CheckSquare, Square } from "lucide-react";

interface Task {
    id: number;
    name: string;
    url?: string;
    done: boolean;
}

const STORAGE_KEY = "dashboard-tasks-v2";

const DEFAULT_TASKS: Task[] = [
    { id: 1, name: "Morning routine", done: false },
    { id: 2, name: "Review emails", done: false },
    { id: 3, name: "Daily standup", done: false },
];

export default function TasksWidget() {
    const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskUrl, setNewTaskUrl] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setTasks(JSON.parse(saved));
        } else {
            // Migrate from old format
            const oldSaved = localStorage.getItem("dashboard-tasks");
            if (oldSaved) {
                const oldTasks = JSON.parse(oldSaved);
                const migrated = oldTasks.map((t: { id: number; text: string; done: boolean }) => {
                    const urlMatch = t.text.match(/(https?:\/\/[^\s]+)/);
                    const nameOnly = t.text.replace(/(https?:\/\/[^\s]+)/g, '').trim();
                    return {
                        id: t.id,
                        name: nameOnly || t.text,
                        url: urlMatch ? urlMatch[1] : undefined,
                        done: t.done,
                    };
                });
                setTasks(migrated);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            }
        }
    }, []);

    const saveTasks = (newTasks: Task[]) => {
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    };

    const toggleTask = (id: number) => {
        saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const addTask = () => {
        if (!newTaskName.trim()) return;
        const newUrl = newTaskUrl.trim() ? (newTaskUrl.startsWith("http") ? newTaskUrl : `https://${newTaskUrl}`) : undefined;
        saveTasks([...tasks, { id: Date.now(), name: newTaskName.trim(), url: newUrl, done: false }]);
        setNewTaskName("");
        setNewTaskUrl("");
        setShowAddForm(false);
    };

    const resetAllTasks = () => {
        saveTasks(tasks.map(t => ({ ...t, done: false })));
    };

    const checkAllTasks = () => {
        saveTasks(tasks.map(t => ({ ...t, done: true })));
    };

    const deleteTask = (id: number) => {
        saveTasks(tasks.filter(t => t.id !== id));
    };

    const startEdit = (task: Task) => {
        setEditId(task.id);
        setEditName(task.name);
        setEditUrl(task.url || "");
    };

    const updateTask = () => {
        if (!editId || !editName.trim()) return;
        const newUrl = editUrl.trim() ? (editUrl.startsWith("http") ? editUrl : `https://${editUrl}`) : undefined;
        saveTasks(tasks.map(t => t.id === editId ? { ...t, name: editName.trim(), url: newUrl } : t));
        setEditId(null);
        setEditName("");
        setEditUrl("");
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
        setEditUrl("");
    };

    const moveTask = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tasks.length) return;
        const newTasks = [...tasks];
        [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];
        saveTasks(newTasks);
    };

    const hasCompletedTasks = tasks.some(t => t.done);
    const hasUncompletedTasks = tasks.some(t => !t.done);

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">DAILY TASKS</div>
            <div className="flex-1 p-2 overflow-auto min-h-0 space-y-1">
                {tasks.map((task, index) => (
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
                            {task.name}
                            {task.url && (
                                <a
                                    href={task.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className={`inline-flex items-center ml-1 ${task.done ? 'text-cyan-700' : 'text-cyan-500 hover:text-cyan-400'}`}
                                    title={task.url}
                                >
                                    <ExternalLink size={10} />
                                </a>
                            )}
                        </span>
                        {/* Action buttons on hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => moveTask(index, 'up')}
                                disabled={index === 0}
                                className={`p-0 ${index === 0 ? 'text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <ChevronUp size={12} />
                            </button>
                            <button
                                onClick={() => moveTask(index, 'down')}
                                disabled={index === tasks.length - 1}
                                className={`p-0 ${index === tasks.length - 1 ? 'text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <ChevronDown size={12} />
                            </button>
                            <button
                                onClick={() => startEdit(task)}
                                className="p-0.5 text-gray-600 hover:text-gray-300"
                            >
                                <Edit2 size={10} />
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-0.5 text-gray-600 hover:text-red-400"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Edit Form */}
                {editId && (
                    <div className="mt-2 p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="タスク名"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="URL（任意）"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                            onKeyDown={(e) => e.key === "Enter" && updateTask()}
                        />
                        <div className="flex gap-1">
                            <button
                                onClick={updateTask}
                                className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                            >
                                更新
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Form */}
                {showAddForm && !editId && (
                    <div className="mt-2 p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="タスク名"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newTaskUrl}
                            onChange={(e) => setNewTaskUrl(e.target.value)}
                            placeholder="URL（任意）"
                            className="w-full bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                            onKeyDown={(e) => e.key === "Enter" && addTask()}
                        />
                        <div className="flex gap-1">
                            <button
                                onClick={addTask}
                                className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                            >
                                追加
                            </button>
                            <button
                                onClick={() => { setShowAddForm(false); setNewTaskName(""); setNewTaskUrl(""); }}
                                className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-[#2a2a2a] space-y-1.5 flex-shrink-0">
                {!showAddForm && !editId && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                    >
                        <span>+ タスク追加</span>
                    </button>
                )}
                {hasCompletedTasks && !showAddForm && !editId && (
                    <button
                        onClick={resetAllTasks}
                        className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                        title="全てのチェックを外す"
                    >
                        <Square size={10} />
                        <span>全て未完了</span>
                    </button>
                )}
                {hasUncompletedTasks && !showAddForm && !editId && (
                    <button
                        onClick={checkAllTasks}
                        className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-green-400 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                        title="全てにチェックを付ける"
                    >
                        <CheckSquare size={10} />
                        <span>全て完了</span>
                    </button>
                )}
            </div>
        </div>
    );
}
