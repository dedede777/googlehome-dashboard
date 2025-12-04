"use client";

import { useState, useEffect, useRef } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X, Search } from "lucide-react";

import { Block, BlockContent, BlockType, BLOCK_CATALOG, createBlock } from "@/lib/blocks";
import { CoverBlock, HeadingBlock, TextBlock, DividerBlock, ImageBlock, YouTubeBlock, SpotifyBlock } from "./blocks/BasicBlocks";
import { CategoryCardsBlock, TaskTableBlock, CalendarBlock, UpcomingBlock } from "./blocks/AdvancedBlocks";
import WeatherWidget from "./widgets/WeatherWidget";
import ClockWidget from "./widgets/ClockWidget";

const STORAGE_KEY = "notion-blocks";

// Default blocks
const DEFAULT_BLOCKS: Block[] = [
    { id: "cover-1", type: "cover", content: { imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop" } },
    { id: "heading-1", type: "heading1", content: { text: "Life Planner" } },
    { id: "text-1", type: "text", content: { text: "All your thoughts in one private place." } },
    {
        id: "categories-1", type: "categoryCards", content: {
            categories: [
                { id: "1", title: "Daily", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=150&fit=crop", icon: "📅", links: [] },
                { id: "2", title: "Planners", imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=200&h=150&fit=crop", icon: "📋", links: [] },
                { id: "3", title: "Personal", imageUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200&h=150&fit=crop", icon: "🏠", links: [] },
                { id: "4", title: "Goals", imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=200&h=150&fit=crop", icon: "🎯", links: [] },
            ]
        }
    },
    { id: "divider-1", type: "divider", content: {} },
    { id: "heading-2", type: "heading3", content: { text: "— Overview" } },
    {
        id: "tasks-1", type: "taskTable", content: {
            tasks: [
                { id: "1", title: "Write blog post", tag: "Work", tagColor: "#8b5cf6", date: "2024-12-05", priority: "high", completed: false },
                { id: "2", title: "Review code", tag: "Work", tagColor: "#8b5cf6", date: "2024-12-06", priority: "medium", completed: false },
                { id: "3", title: "Team meeting", tag: "Life", tagColor: "#ec4899", date: "2024-12-07", priority: "low", completed: true },
            ]
        }
    },
];

// Sortable Block Wrapper
function SortableBlock({
    block,
    onUpdate,
    onDelete
}: {
    block: Block;
    onUpdate: (content: BlockContent) => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const renderBlock = () => {
        switch (block.type) {
            case "cover":
                return <CoverBlock block={block} onUpdate={onUpdate} />;
            case "heading1":
                return <HeadingBlock block={block} level={1} onUpdate={onUpdate} />;
            case "heading2":
                return <HeadingBlock block={block} level={2} onUpdate={onUpdate} />;
            case "heading3":
                return <HeadingBlock block={block} level={3} onUpdate={onUpdate} />;
            case "text":
                return <TextBlock block={block} onUpdate={onUpdate} />;
            case "image":
                return <ImageBlock block={block} onUpdate={onUpdate} />;
            case "divider":
                return <DividerBlock />;
            case "categoryCards":
                return <CategoryCardsBlock block={block} onUpdate={onUpdate} />;
            case "taskTable":
                return <TaskTableBlock block={block} onUpdate={onUpdate} />;
            case "youtube":
                return <YouTubeBlock block={block} onUpdate={onUpdate} />;
            case "spotify":
                return <SpotifyBlock block={block} onUpdate={onUpdate} />;
            case "calendar":
                return <CalendarBlock block={block} />;
            case "upcoming":
                return <UpcomingBlock block={block} />;
            case "weather":
                return <div className="bg-gray-800/30 rounded-lg"><WeatherWidget /></div>;
            case "clock":
                return <div className="bg-gray-800/30 rounded-lg"><ClockWidget /></div>;
            default:
                return <div className="text-gray-500">Unknown block type</div>;
        }
    };

    // Cover block doesn't need wrapper
    if (block.type === "cover") {
        return (
            <div ref={setNodeRef} style={style}>
                {renderBlock()}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative"
        >
            <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={14} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1 text-gray-500 hover:text-red-400"
                >
                    <X size={14} />
                </button>
            </div>
            {renderBlock()}
        </div>
    );
}

// Add Block Menu
function AddBlockMenu({
    onAdd,
    onClose,
    position
}: {
    onAdd: (type: BlockType) => void;
    onClose: () => void;
    position: { x: number; y: number };
}) {
    const [search, setSearch] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    const filtered = BLOCK_CATALOG.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-64 max-h-80 overflow-hidden"
            style={{ left: position.x, top: position.y }}
        >
            <div className="p-2 border-b border-gray-700">
                <div className="flex items-center gap-2 bg-gray-900 rounded px-2 py-1">
                    <Search size={14} className="text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search blocks..."
                        className="bg-transparent border-none outline-none text-sm text-gray-300 w-full"
                        autoFocus
                    />
                </div>
            </div>
            <div className="overflow-y-auto max-h-60">
                {filtered.map((block) => (
                    <button
                        key={block.type}
                        onClick={() => {
                            onAdd(block.type);
                            onClose();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-700/50 flex items-center gap-3"
                    >
                        <span className="text-lg">{block.icon}</span>
                        <div>
                            <div className="text-sm text-gray-200">{block.name}</div>
                            <div className="text-xs text-gray-500">{block.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function NotionEditor() {
    const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
    const [mounted, setMounted] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState<{ x: number; y: number } | null>(null);
    const [addIndex, setAddIndex] = useState<number>(0);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setBlocks(JSON.parse(saved));
            } catch {
                // Use defaults
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
        }
    }, [blocks, mounted]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const updateBlock = (id: string, content: BlockContent) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const addBlock = (type: BlockType, index: number) => {
        const newBlock = createBlock(type);
        const updated = [...blocks];
        updated.splice(index, 0, newBlock);
        setBlocks(updated);
    };

    const handleAddClick = (e: React.MouseEvent, index: number) => {
        setAddIndex(index);
        setShowAddMenu({ x: e.clientX, y: e.clientY });
    };

    // Handle "/" command
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "/" && !showAddMenu) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setAddIndex(blocks.length);
                setShowAddMenu({ x: rect.left, y: rect.bottom + 10 });
            }
        }
        if (e.key === "Escape") {
            setShowAddMenu(null);
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showAddMenu, blocks.length]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="max-w-4xl mx-auto">
                        {blocks.map((block, index) => (
                            <div key={block.id}>
                                {/* Add button between blocks */}
                                {block.type !== "cover" && (
                                    <div className="group relative h-2 -my-1">
                                        <button
                                            onClick={(e) => handleAddClick(e, index)}
                                            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 hover:bg-purple-500 text-white rounded-full p-1 z-10"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className={block.type === "cover" ? "" : "px-8 md:px-16 py-1"}>
                                    <SortableBlock
                                        block={block}
                                        onUpdate={(content) => updateBlock(block.id, content)}
                                        onDelete={() => deleteBlock(block.id)}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add button at the end */}
                        <div className="px-8 md:px-16 py-4">
                            <button
                                onClick={(e) => handleAddClick(e, blocks.length)}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <Plus size={16} />
                                <span className="text-sm">Add a block</span>
                            </button>
                            <p className="text-xs text-gray-600 mt-2">
                                Press <kbd className="bg-gray-800 px-1 rounded">/</kbd> for commands
                            </p>
                        </div>
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Block Menu */}
            {showAddMenu && (
                <AddBlockMenu
                    position={showAddMenu}
                    onAdd={(type) => addBlock(type, addIndex)}
                    onClose={() => setShowAddMenu(null)}
                />
            )}
        </div>
    );
}
