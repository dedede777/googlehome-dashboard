"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Plus, X, Search, Lock, Unlock, Eye, EyeOff, Zap } from "lucide-react";
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
import MemoWidget, { Memo2Widget, Memo3Widget } from "./widgets/MemoWidget";
import QuoteWidget from "./widgets/QuoteWidget";
import RSSWidget from "./widgets/RSSWidget";
import WaterWidget from "./widgets/WaterWidget";
import PlantWidget from "./widgets/PlantWidget";
import ExpenseWidget from "./widgets/ExpenseWidget";
import ZenWidget from "./widgets/ZenWidget";
import HabitWidget from "./widgets/HabitWidget";
import ExchangeWidget from "./widgets/ExchangeWidget";
import FlashcardWidget from "./widgets/FlashcardWidget";
import DiaryWidget from "./widgets/DiaryWidget";
import ConversationWidget from "./widgets/ConversationWidget";
import ShadowingWidget from "./widgets/ShadowingWidget";
import LearningStatsWidget from "./widgets/LearningStatsWidget";
import AchievementsWidget from "./widgets/AchievementsWidget";
import GoogleAppsLauncher from "./GoogleAppsLauncher";
import DataManagementModal from "./DataManagementModal";
import AISettingsModal from "./AISettingsModal";
import CursorEffects from "./CursorEffects";
import { Database } from "lucide-react";
import { useAISettings } from "@/contexts/AISettingsContext";

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
    memo2: Memo2Widget,
    memo3: Memo3Widget,
    quote: QuoteWidget,
    rss: RSSWidget,
    water: WaterWidget,
    plant: PlantWidget,
    expense: ExpenseWidget,
    zen: ZenWidget,
    habit: HabitWidget,
    exchange: ExchangeWidget,
    flashcard: FlashcardWidget,
    diary: DiaryWidget,
    conversation: ConversationWidget,
    shadowing: ShadowingWidget,
    learningstats: LearningStatsWidget,
    achievements: AchievementsWidget,
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
    { id: "memo", name: "Memo 1", icon: "📝", category: "Productivity" },
    { id: "memo2", name: "Memo 2", icon: "📗", category: "Productivity" },
    { id: "memo3", name: "Memo 3", icon: "📘", category: "Productivity" },
    { id: "quote", name: "Quote", icon: "💬", category: "Productivity" },
    { id: "flashcard", name: "English", icon: "🎯", category: "Learning" },
    { id: "diary", name: "Diary", icon: "📔", category: "Learning" },
    { id: "conversation", name: "Conversation", icon: "💬", category: "Learning" },
    { id: "shadowing", name: "Shadowing", icon: "🎧", category: "Learning" },
    { id: "learningstats", name: "Stats", icon: "📊", category: "Learning" },
    { id: "achievements", name: "Achievements", icon: "🏆", category: "Learning" },
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

const copyLayout = (layout: Layout[]) => layout.map(item => ({ ...item }));

const itemsOverlap = (a: Layout, b: Layout) => {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
};

const repairOverlappingLayout = (layout: Layout[]) => {
    const repaired = copyLayout(layout).sort((a, b) => a.y - b.y || a.x - b.x);

    repaired.forEach((item, index) => {
        let overlapping = repaired.slice(0, index).find(other => itemsOverlap(item, other));
        while (overlapping) {
            item.y = overlapping.y + overlapping.h;
            overlapping = repaired.slice(0, index).find(other => itemsOverlap(item, other));
        }
    });

    return repaired;
};

export default function Dashboard() {
    const { settings: aiSettings } = useAISettings();
    const [mounted, setMounted] = useState(false);
    const [widgets, setWidgets] = useState<WidgetInstance[]>(DEFAULT_WIDGETS);
    const [layouts, setLayouts] = useState<{ lg: Layout[] }>({ lg: DEFAULT_LAYOUT });
    const widgetIdCounterRef = useRef(0);
    const [showPanel, setShowPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [coverImage, setCoverImage] = useState(DEFAULT_COVER);
    const [title, setTitle] = useState("Command Center");
    const [subtitle, setSubtitle] = useState("Your personal dashboard");
    const [headerHidden, setHeaderHidden] = useState(false);
    const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedWidgets = localStorage.getItem(WIDGETS_KEY);
        const savedLayout = localStorage.getItem(STORAGE_KEY);
        const savedCover = localStorage.getItem(COVER_KEY);
        const savedTitle = localStorage.getItem(TITLE_KEY);

        if (savedWidgets) setWidgets(JSON.parse(savedWidgets));
        if (savedLayout) {
            const parsedLayout = JSON.parse(savedLayout) as Layout[];
            const repairedLayout = repairOverlappingLayout(parsedLayout);
            setLayouts({ lg: repairedLayout });
            if (JSON.stringify(repairedLayout) !== JSON.stringify(parsedLayout)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(repairedLayout));
            }
        }
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
            const repairedLayout = repairOverlappingLayout(currentLayout);
            setLayouts({ lg: repairedLayout });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(repairedLayout));
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

    const createWidgetId = (type: string) => {
        let id = `${type}-${widgetIdCounterRef.current}`;
        while (widgets.some(widget => widget.id === id)) {
            widgetIdCounterRef.current += 1;
            id = `${type}-${widgetIdCounterRef.current}`;
        }
        widgetIdCounterRef.current += 1;
        return id;
    };

    const addWidget = (type: string) => {
        const id = createWidgetId(type);
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
        const updatedLayout = repairOverlappingLayout([...layouts.lg, newLayoutItem]);

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
                        onClick={() => setIsAISettingsOpen(true)}
                        className={`p-3 bg-[#1a1a1a] border transition-colors ${aiSettings.provider === 'groq' ? 'border-cyan-500/30 text-cyan-400' : 'border-purple-500/30 text-purple-400'} hover:border-[#3a3a3a]`}
                        title="AI Settings"
                    >
                        <Zap size={18} />
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
                draggableHandle=".widget-card"
                draggableCancel="button,input,textarea,select,a,.react-resizable-handle"
                isDraggable={!isLocked}
                isResizable={!isLocked}
                compactType={null}
                preventCollision={true}
                allowOverlap={false}
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
            {/* AI Settings Modal */}
            <AISettingsModal
                isOpen={isAISettingsOpen}
                onClose={() => setIsAISettingsOpen(false)}
            />
            {/* Cursor Effects */}
            <CursorEffects />
        </div>
    );
}
