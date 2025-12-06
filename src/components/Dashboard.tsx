"use client";

import { useState, useCallback, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Plus, X, Search, GripVertical, Image as ImageIcon, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Widget imports
import WeatherWidget from "./widgets/WeatherWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import TasksWidget from "./widgets/TasksWidget";
import AIChatWidget from "./widgets/AIChatWidget";
import ClockWidget from "./widgets/ClockWidget";
import CryptoWidget from "./widgets/CryptoWidget";
import YouTubeWidget from "./widgets/YouTubeWidget";
import SpotifyWidget from "./widgets/SpotifyWidget";
import ImageWidget from "./widgets/ImageWidget";
import EmbedWidget from "./widgets/EmbedWidget";
import SNSWidget from "./widgets/SNSWidget";
import PomodoroWidget from "./widgets/PomodoroWidget";
import BookmarkWidget from "./widgets/BookmarkWidget";
import MemoWidget from "./widgets/MemoWidget";
import QuoteWidget from "./widgets/QuoteWidget";
import RSSWidget from "./widgets/RSSWidget";
import WaterWidget from "./widgets/WaterWidget";
import PlantWidget from "./widgets/PlantWidget";
import ExpenseWidget from "./widgets/ExpenseWidget";
import ZenWidget from "./widgets/ZenWidget";
import HabitWidget from "./widgets/HabitWidget";
import ExchangeWidget from "./widgets/ExchangeWidget";
import FlashcardWidget from "./widgets/FlashcardWidget";
import GoogleAppsLauncher from "./GoogleAppsLauncher";
import DataManagementModal from "./DataManagementModal";
import CursorEffects from "./CursorEffects";
import { Database } from "lucide-react";

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
    weather: WeatherWidget,
    calendar: CalendarWidget,
    tasks: TasksWidget,
    aichat: AIChatWidget,
    clock: ClockWidget,
    crypto: CryptoWidget,
    youtube: YouTubeWidget,
    spotify: SpotifyWidget,
    image: ImageWidget,
    embed: EmbedWidget,
    sns: SNSWidget,
    pomodoro: PomodoroWidget,
    bookmark: BookmarkWidget,
    memo: MemoWidget,
    quote: QuoteWidget,
    rss: RSSWidget,
    water: WaterWidget,
    plant: PlantWidget,
    expense: ExpenseWidget,
    zen: ZenWidget,
    habit: HabitWidget,
    exchange: ExchangeWidget,
    flashcard: FlashcardWidget,
};

const WIDGET_CATALOG = [
    { id: "weather", name: "Weather", icon: "🌤️", category: "Info" },
    { id: "calendar", name: "Calendar", icon: "📅", category: "Info" },
    { id: "clock", name: "Clock", icon: "🕐", category: "Info" },
    { id: "crypto", name: "Crypto", icon: "₿", category: "Info" },
    { id: "rss", name: "RSS Feed", icon: "📰", category: "Info" },
    { id: "water", name: "Water", icon: "🧋", category: "Lifestyle" },
    { id: "plant", name: "Plant", icon: "🌱", category: "Lifestyle" },
    { id: "expense", name: "Expense", icon: "💰", category: "Lifestyle" },
    { id: "zen", name: "Zen", icon: "🧘", category: "Lifestyle" },
    { id: "habit", name: "Habit", icon: "✨", category: "Lifestyle" },
    { id: "exchange", name: "Exchange", icon: "💱", category: "Info" },
    { id: "tasks", name: "Tasks", icon: "✅", category: "Productivity" },
    { id: "pomodoro", name: "Pomodoro", icon: "🍅", category: "Productivity" },
    { id: "memo", name: "Memo", icon: "📝", category: "Productivity" },
    { id: "quote", name: "Quote", icon: "💬", category: "Productivity" },
    { id: "flashcard", name: "English", icon: "🎯", category: "Learning" },
    { id: "aichat", name: "AI", icon: "🤖", category: "Links" },
    { id: "sns", name: "SNS", icon: "📱", category: "Links" },
    { id: "bookmark", name: "Bookmarks", icon: "🔖", category: "Links" },
    { id: "youtube", name: "YouTube", icon: "📺", category: "Media" },
    { id: "spotify", name: "Spotify", icon: "🎵", category: "Media" },
    { id: "image", name: "Image", icon: "🖼️", category: "Media" },
    { id: "embed", name: "Embed", icon: "🌐", category: "Media" },
];

interface WidgetInstance {
    id: string;
    type: string;
    data?: Record<string, string>;
}

const STORAGE_KEY = "dashboard-layout";
const WIDGETS_KEY = "dashboard-widgets";
const COVER_KEY = "dashboard-cover";
const TITLE_KEY = "dashboard-title";
const HEADER_HIDDEN_KEY = "dashboard-header-hidden";

// Default layout
const DEFAULT_WIDGETS: WidgetInstance[] = [
    { id: "weather-1", type: "weather" },
    { id: "calendar-1", type: "calendar" },
    { id: "tasks-1", type: "tasks" },
    { id: "clock-1", type: "clock" },
];

const DEFAULT_LAYOUT: Layout[] = [
    { i: "weather-1", x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "calendar-1", x: 1, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "tasks-1", x: 2, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "clock-1", x: 3, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
];

const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop";

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [widgets, setWidgets] = useState<WidgetInstance[]>(DEFAULT_WIDGETS);
    const [layouts, setLayouts] = useState<{ lg: Layout[] }>({ lg: DEFAULT_LAYOUT });
    const [dragStartLayout, setDragStartLayout] = useState<Layout[] | null>(null);
    const [showPanel, setShowPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [coverImage, setCoverImage] = useState(DEFAULT_COVER);
    const [title, setTitle] = useState("Command Center");
    const [subtitle, setSubtitle] = useState("Your personal dashboard");
    const [headerHidden, setHeaderHidden] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedWidgets = localStorage.getItem(WIDGETS_KEY);
        const savedLayout = localStorage.getItem(STORAGE_KEY);
        const savedCover = localStorage.getItem(COVER_KEY);
        const savedTitle = localStorage.getItem(TITLE_KEY);

        if (savedWidgets) setWidgets(JSON.parse(savedWidgets));
        if (savedLayout) setLayouts({ lg: JSON.parse(savedLayout) });
        if (savedCover) setCoverImage(savedCover);
        if (savedTitle) {
            const parsed = JSON.parse(savedTitle);
            setTitle(parsed.title);
            setSubtitle(parsed.subtitle);
        }
        const savedHeaderHidden = localStorage.getItem(HEADER_HIDDEN_KEY);
        if (savedHeaderHidden) setHeaderHidden(JSON.parse(savedHeaderHidden));
    }, []);

    const saveWidgets = (w: WidgetInstance[]) => {
        setWidgets(w);
        localStorage.setItem(WIDGETS_KEY, JSON.stringify(w));
    };

    const handleLayoutChange = useCallback((currentLayout: Layout[]) => {
        if (mounted) {
            setLayouts({ lg: currentLayout });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLayout));
        }
    }, [mounted]);

    const saveCover = (url: string) => {
        setCoverImage(url);
        localStorage.setItem(COVER_KEY, url);
    };

    const saveTitle = (t: string, s: string) => {
        setTitle(t);
        setSubtitle(s);
        localStorage.setItem(TITLE_KEY, JSON.stringify({ title: t, subtitle: s }));
    };

    const addWidget = (type: string) => {
        const id = `${type}-${Date.now()}`;
        const newWidget: WidgetInstance = { id, type, data: {} };

        // Larger default size for media widgets and RSS
        const isMedia = ["youtube", "spotify", "image", "embed"].includes(type);
        const isRss = type === "rss";
        const w = isRss ? 3 : isMedia ? 2 : 2;
        const h = isRss ? 5 : isMedia ? 4 : 3;

        // Find the rightmost empty position in the grid
        let maxY = 0;
        layouts.lg.forEach(item => {
            const itemBottom = item.y + item.h;
            if (itemBottom > maxY) maxY = itemBottom;
        });

        const newLayoutItem: Layout = {
            i: id,
            x: (layouts.lg.length * 2) % 8, // Spread across columns
            y: maxY, // Place at bottom
            w,
            h,
            minW: 1,
            minH: 2
        };

        const updatedWidgets = [...widgets, newWidget];
        const updatedLayout = [...layouts.lg, newLayoutItem];

        saveWidgets(updatedWidgets);
        setLayouts({ lg: updatedLayout });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLayout));
        setShowPanel(false);
    };

    const removeWidget = (id: string) => {
        const updatedWidgets = widgets.filter(w => w.id !== id);
        const updatedLayout = layouts.lg.filter(l => l.i !== id);

        saveWidgets(updatedWidgets);
        setLayouts({ lg: updatedLayout });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLayout));
    };

    const updateWidgetData = (id: string, data: Record<string, string>) => {
        const updated = widgets.map(w => w.id === id ? { ...w, data: { ...w.data, ...data } } : w);
        saveWidgets(updated);
    };

    // Save layout when drag starts
    const handleDragStart = () => {
        setDragStartLayout([...layouts.lg]);
    };

    // Keep other widgets in place during drag
    const handleDrag = (layout: Layout[], _oldItem: Layout, newItem: Layout) => {
        if (!dragStartLayout) return;

        // Keep all widgets except the one being dragged at their original positions
        const correctedLayout = layout.map(item => {
            if (item.i === newItem.i) {
                return item; // Allow the dragged item to move freely
            }
            // Find original position
            const original = dragStartLayout.find(o => o.i === item.i);
            if (original) {
                return { ...item, x: original.x, y: original.y, w: original.w, h: original.h };
            }
            return item;
        });

        if (JSON.stringify(correctedLayout) !== JSON.stringify(layout)) {
            setLayouts({ lg: correctedLayout });
        }
    };

    // Swap two widgets when they overlap
    const handleDragStop = (_layout: Layout[], _oldItem: Layout, newItem: Layout) => {
        if (!dragStartLayout) return;

        // Find the original position of the dragged item
        const originalItem = dragStartLayout.find(item => item.i === newItem.i);
        if (!originalItem) return;

        // Find if we're overlapping with another widget based on saved positions
        const overlapping = dragStartLayout.find(item => {
            if (item.i === newItem.i) return false;

            // Check if newItem position overlaps with this item's saved position
            const xOverlap = newItem.x < item.x + item.w && newItem.x + newItem.w > item.x;
            const yOverlap = newItem.y < item.y + item.h && newItem.y + newItem.h > item.y;

            return xOverlap && yOverlap;
        });

        let newLayout: Layout[];

        if (overlapping && originalItem.w === overlapping.w && originalItem.h === overlapping.h) {
            // Same size - swap positions directly
            newLayout = dragStartLayout.map(item => {
                if (item.i === newItem.i) {
                    return { ...item, x: overlapping.x, y: overlapping.y };
                }
                if (item.i === overlapping.i) {
                    return { ...item, x: originalItem.x, y: originalItem.y };
                }
                return item;
            });
        } else if (overlapping) {
            // Different sizes - don't swap, return to original position
            newLayout = dragStartLayout;
        } else {
            // No overlap - keep widget at new position
            newLayout = dragStartLayout.map(item => {
                if (item.i === newItem.i) {
                    return { ...item, x: newItem.x, y: newItem.y };
                }
                return item;
            });
        }

        setLayouts({ lg: newLayout });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
        setDragStartLayout(null);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
            setSearchQuery("");
        }
    };

    const handleCoverChange = () => {
        const url = prompt("Enter image URL:", coverImage);
        if (url) saveCover(url);
    };

    // Group widgets by category
    const groupedWidgets = WIDGET_CATALOG.reduce((acc, w) => {
        if (!acc[w.category]) acc[w.category] = [];
        acc[w.category].push(w);
        return acc;
    }, {} as Record<string, typeof WIDGET_CATALOG>);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-4">
            {/* Toggle Header Button (always visible) */}
            {headerHidden && (
                <button
                    onClick={() => { setHeaderHidden(false); localStorage.setItem(HEADER_HIDDEN_KEY, "false"); }}
                    className="fixed top-4 right-4 z-50 p-2 bg-[#1a1a1a]/80 border border-[#2a2a2a] hover:border-cyan-500/50 transition-colors backdrop-blur-sm"
                    title="ヘッダーを表示"
                >
                    <Eye size={16} className="text-gray-400 hover:text-cyan-400" />
                </button>
            )}

            {/* Top Bar */}
            {!headerHidden && (
                <div className="flex items-center gap-2 mb-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3">
                            <Search size={16} className="text-gray-500 mr-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-300 text-sm"
                            />
                        </div>
                    </form>
                    <ThemeSwitcher />
                    <GoogleAppsLauncher />
                    <button
                        onClick={() => setIsDataModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[var(--accent)] transition-colors text-xs font-bold text-gray-400 hover:text-[var(--accent)]"
                        title="Data Management"
                    >
                        <Database size={16} />
                        <span className="hidden sm:inline">DATA</span>
                    </button>
                    <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={`p-3 bg-[#1a1a1a] border transition-colors ${isLocked
                            ? "border-cyan-500/50 text-cyan-400"
                            : "border-[#2a2a2a] hover:border-[#3a3a3a] text-gray-400"
                            }`}
                        title={isLocked ? "Unlock Layout" : "Lock Layout"}
                    >
                        {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                    <button
                        onClick={() => setShowPanel(!showPanel)}
                        className="p-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
                        title="Add Widget"
                    >
                        <Plus size={18} className="text-gray-400" />
                    </button>
                    <button
                        onClick={() => { setHeaderHidden(true); localStorage.setItem(HEADER_HIDDEN_KEY, "true"); }}
                        className="p-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
                        title="ヘッダーを隠す"
                    >
                        <EyeOff size={18} className="text-gray-400" />
                    </button>
                </div>
            )}

            {/* Widget Panel */}
            {showPanel && (
                <div className="fixed top-32 right-4 z-50 bg-[#1a1a1a] border border-[#2a2a2a] p-4 w-64 shadow-2xl max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-300 font-semibold">Add Widget</span>
                        <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-[#2a2a2a] rounded">
                            <X size={14} className="text-gray-500" />
                        </button>
                    </div>

                    {Object.entries(groupedWidgets).map(([category, items]) => (
                        <div key={category} className="mb-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{category}</div>
                            <div className="space-y-1">
                                {items.map((widget) => (
                                    <button
                                        key={widget.id}
                                        onClick={() => addWidget(widget.id)}
                                        className="w-full text-left p-3 text-sm text-gray-300 bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white flex items-center gap-3 transition-colors"
                                    >
                                        <span className="text-lg">{widget.icon}</span>
                                        <span>{widget.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid Layout */}
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 900, sm: 600 }}
                cols={{ lg: 8, md: 6, sm: 4 }}
                rowHeight={60}
                onLayoutChange={handleLayoutChange}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragStop={handleDragStop}
                draggableHandle=".widget-title"
                isDraggable={!isLocked}
                isResizable={!isLocked}
                compactType={null}
                preventCollision={false}
                margin={[16, 16]}
            >
                {widgets.map((widget) => {
                    const WidgetComponent = WIDGET_COMPONENTS[widget.type];
                    return (
                        <div key={widget.id} className="widget-wrapper overflow-visible">
                            <div className="widget-card bg-[#1a1a1a] border border-[#2a2a2a] overflow-visible group h-full relative">
                                <div className="absolute -top-2 -right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => removeWidget(widget.id)}
                                        className="w-4 h-4 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full shadow-lg"
                                    >
                                        <X size={8} className="text-white" />
                                    </button>
                                </div>
                                {WidgetComponent && (
                                    <WidgetComponent
                                        {...widget.data}
                                        onUpdate={(key: string, value: string) => updateWidgetData(widget.id, { [key]: value })}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </ResponsiveGridLayout>
            {/* Data Management Modal */}
            <DataManagementModal
                isOpen={isDataModalOpen}
                onClose={() => setIsDataModalOpen(false)}
            />
            {/* Cursor Effects */}
            <CursorEffects />
        </div>
    );
}
