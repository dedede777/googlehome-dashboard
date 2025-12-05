"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, LogIn, LogOut, Loader2, Trash2, Pencil, Check, X } from "lucide-react";

interface CalendarEvent {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
}

export default function CalendarWidget() {
    const { data: session, status } = useSession();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ summary: "", start: "", end: "" });

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.accessToken) {
            fetchEvents();
        }
    }, [session]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/calendar/list");
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            } else {
                const err = await res.json();
                setError(err.error || "Failed to fetch events");
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const handleDateClick = (day: number) => {
        const newSelected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelected);
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("Delete this event?")) return;
        setProcessing(true);
        try {
            const res = await fetch("/api/calendar/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId }),
            });
            if (res.ok) {
                await fetchEvents();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete");
            }
        } catch (e) {
            alert("Failed to delete");
        } finally {
            setProcessing(false);
        }
    };

    const startEditing = (event: CalendarEvent) => {
        setEditingId(event.id);

        const formatForInput = (dateStr?: string) => {
            if (!dateStr) return "";
            const d = new Date(dateStr);
            // Adjust to local ISO string for input
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().slice(0, 16);
        };

        setEditForm({
            summary: event.summary,
            start: event.start.dateTime ? formatForInput(event.start.dateTime) : event.start.date || "",
            end: event.end.dateTime ? formatForInput(event.end.dateTime) : event.end.date || ""
        });
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setProcessing(true);
        try {
            const payload: any = {
                eventId: editingId,
                summary: editForm.summary,
            };

            // Only update time if it's a valid datetime string
            if (editForm.start.includes("T")) {
                payload.start = { dateTime: new Date(editForm.start).toISOString() };
            } else if (editForm.start) {
                payload.start = { date: editForm.start };
            }

            if (editForm.end.includes("T")) {
                payload.end = { dateTime: new Date(editForm.end).toISOString() };
            } else if (editForm.end) {
                payload.end = { date: editForm.end };
            }

            const res = await fetch("/api/calendar/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setEditingId(null);
                await fetchEvents();
            } else {
                const err = await res.json();
                const debugInfo = err.debug ? `\n\nDebug: ${JSON.stringify(err.debug, null, 2)}` : "";
                alert((err.error || "Failed to update") + debugInfo);
            }
        } catch (e) {
            alert("Failed to update");
        } finally {
            setProcessing(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <CalendarIcon className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-xs text-gray-400 mb-3">Connect Google Calendar</p>
                <button
                    onClick={() => signIn("google")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#333] border border-[#3a3a3a] rounded text-xs text-white transition-colors"
                >
                    <LogIn size={12} />
                    Connect
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden relative group">
            <div className="widget-title flex-shrink-0 flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span>CALENDAR</span>
                    <button
                        onClick={() => signOut()}
                        className="p-0.5 text-gray-500 hover:text-red-400 transition-colors"
                        title="Sign out"
                    >
                        <LogOut size={12} />
                    </button>
                    <span className="text-[10px] text-gray-500 ml-1">
                        {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => changeMonth(-1)} className="p-0.5 hover:text-cyan-400">&lt;</button>
                    <button onClick={() => changeMonth(1)} className="p-0.5 hover:text-cyan-400">&gt;</button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-2">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-[9px] text-[#666] text-center mb-1">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[9px] text-[#666]">
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map((day) => {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isToday = new Date().toDateString() === date.toDateString();
                        const isSelected = selectedDate.toDateString() === date.toDateString();

                        // Check for events on this day
                        const hasEvent = events.some(event => {
                            const eventDate = new Date(event.start.dateTime || event.start.date || "");
                            return eventDate.toDateString() === date.toDateString();
                        });

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`relative flex flex-col items-center justify-center h-7 rounded-md cursor-pointer transition-colors ${isSelected
                                    ? "bg-cyan-600 text-white"
                                    : isToday
                                        ? "bg-cyan-900/30 text-cyan-400 border border-cyan-800"
                                        : "hover:bg-[#252525]"
                                    }`}
                            >
                                <span>{day}</span>
                                {hasEvent && (
                                    <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-cyan-500"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Events List */}
                <div className="flex-1 overflow-auto min-h-0 border-t border-[#252525] pt-2">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-2 sticky top-0 bg-[#111] py-1">UPCOMING</h3>
                    {loading ? (
                        <div className="flex justify-center py-2"><Loader2 size={14} className="animate-spin text-gray-600" /></div>
                    ) : error ? (
                        <div className="text-[10px] text-red-400 text-center py-2 px-1 break-words">{error}</div>
                    ) : events.length > 0 ? (
                        <div className="space-y-2">
                            {events.map((event) => {
                                const startDate = new Date(event.start.dateTime || event.start.date || "");
                                const timeStr = event.start.dateTime
                                    ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : "All Day";
                                const isToday = startDate.toDateString() === new Date().toDateString();
                                const isEditing = editingId === event.id;

                                return (
                                    <div key={event.id} className={`rounded border ${isToday ? "bg-cyan-950/30 border-cyan-900/50" : "bg-[#1a1a1a] border-[#252525]"} hover:border-gray-600 transition-colors group/item overflow-hidden`}>
                                        {isEditing ? (
                                            <div className="p-2 flex flex-col gap-2 bg-[#151515]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-cyan-400">EDIT EVENT</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-gray-500 block">Title</label>
                                                    <input
                                                        value={editForm.summary}
                                                        onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                                                        className="w-full bg-[#222] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200 focus:border-cyan-500 focus:outline-none"
                                                        placeholder="Event title"
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] text-gray-500 block">Start</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={editForm.start}
                                                            onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                                                            className="w-full bg-[#222] border border-[#333] rounded px-1 py-1 text-[10px] text-gray-300 focus:border-cyan-500 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] text-gray-500 block">End</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={editForm.end}
                                                            onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                                                            className="w-full bg-[#222] border border-[#333] rounded px-1 py-1 text-[10px] text-gray-300 focus:border-cyan-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 mt-1">
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        disabled={processing}
                                                        className="px-3 py-1 rounded text-[10px] bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleUpdate}
                                                        disabled={processing}
                                                        className="px-3 py-1 rounded text-[10px] bg-cyan-900/50 text-cyan-400 hover:bg-cyan-900/80 border border-cyan-900 transition-colors flex items-center gap-1"
                                                    >
                                                        <Check size={10} /> Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-1.5 flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <span className={`text-[9px] font-mono ${isToday ? "text-cyan-400" : "text-gray-500"}`}>
                                                            {startDate.getMonth() + 1}/{startDate.getDate()} {timeStr}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] truncate text-gray-300">{event.summary}</div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity ml-1">
                                                    <button onClick={() => startEditing(event)} className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-[#252525] rounded transition-colors">
                                                        <Pencil size={10} />
                                                    </button>
                                                    <button onClick={() => handleDelete(event.id)} className="p-1 text-gray-500 hover:text-red-400 hover:bg-[#252525] rounded transition-colors">
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[9px] text-gray-600 text-center py-2">No upcoming events</p>
                    )}
                </div>

                {/* AI Input */}
                <div className="mt-auto pt-2 border-t border-[#252525]">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const input = e.currentTarget.elements.namedItem("eventText") as HTMLInputElement;
                            if (!input.value.trim()) return;

                            const text = input.value;
                            input.value = "";
                            setProcessing(true);

                            try {
                                const res = await fetch("/api/calendar/add", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ text }),
                                });

                                if (res.ok) {
                                    await fetchEvents();
                                    alert("Event added successfully!");
                                } else {
                                    const err = await res.json();
                                    alert(`Failed to add event: ${err.error || "Unknown error"}`);
                                }
                            } catch (error) {
                                console.error("Failed to add event", error);
                                alert("Error connecting to server");
                            } finally {
                                setProcessing(false);
                            }
                        }}
                        className="flex gap-1"
                    >
                        <input
                            name="eventText"
                            type="text"
                            placeholder="Ex: Dinner tomorrow 7pm"
                            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-cyan-500"
                            disabled={processing}
                        />
                        <button type="submit" disabled={processing} className="bg-[#252525] hover:bg-[#333] border border-[#333] rounded px-2 text-gray-400 hover:text-cyan-400 transition-colors">
                            {processing ? <Loader2 size={12} className="animate-spin" /> : "+"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
