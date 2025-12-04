// Block types for the Notion-style editor
export type BlockType =
    | 'cover'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'text'
    | 'image'
    | 'divider'
    | 'categoryCards'
    | 'taskTable'
    | 'youtube'
    | 'spotify'
    | 'calendar'
    | 'upcoming'
    | 'weather'
    | 'clock';

export interface Block {
    id: string;
    type: BlockType;
    content: BlockContent;
}

export interface BlockContent {
    text?: string;
    url?: string;
    imageUrl?: string;
    videoId?: string;
    spotifyUri?: string;
    categories?: CategoryItem[];
    tasks?: TaskItem[];
}

export interface CategoryItem {
    id: string;
    title: string;
    imageUrl: string;
    icon: string;
    links: { label: string; href: string }[];
}

export interface TaskItem {
    id: string;
    title: string;
    tag: string;
    tagColor: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

// Block catalog for the add menu
export const BLOCK_CATALOG = [
    { type: 'heading1' as BlockType, name: 'Heading 1', icon: 'H1', description: '大見出し' },
    { type: 'heading2' as BlockType, name: 'Heading 2', icon: 'H2', description: '中見出し' },
    { type: 'heading3' as BlockType, name: 'Heading 3', icon: 'H3', description: '小見出し' },
    { type: 'text' as BlockType, name: 'Text', icon: '¶', description: 'テキストブロック' },
    { type: 'image' as BlockType, name: 'Image', icon: '🖼️', description: '画像を追加' },
    { type: 'divider' as BlockType, name: 'Divider', icon: '—', description: '区切り線' },
    { type: 'categoryCards' as BlockType, name: 'Category Cards', icon: '📂', description: 'カテゴリカード' },
    { type: 'taskTable' as BlockType, name: 'Task Table', icon: '📋', description: 'タスクテーブル' },
    { type: 'youtube' as BlockType, name: 'YouTube', icon: '📺', description: 'YouTube埋め込み' },
    { type: 'spotify' as BlockType, name: 'Spotify', icon: '🎵', description: 'Spotify埋め込み' },
    { type: 'calendar' as BlockType, name: 'Calendar', icon: '📅', description: 'カレンダー' },
    { type: 'upcoming' as BlockType, name: 'Upcoming', icon: '⏰', description: '予定リスト' },
    { type: 'weather' as BlockType, name: 'Weather', icon: '🌤️', description: '天気' },
    { type: 'clock' as BlockType, name: 'Clock', icon: '🕐', description: '時計' },
];

// Helper to create new blocks with default content
export function createBlock(type: BlockType): Block {
    const id = `${type}-${Date.now()}`;

    const defaultContent: Record<BlockType, BlockContent> = {
        cover: { imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop' },
        heading1: { text: 'Untitled' },
        heading2: { text: 'Heading' },
        heading3: { text: 'Subheading' },
        text: { text: 'Start typing...' },
        image: { imageUrl: '' },
        divider: {},
        categoryCards: {
            categories: [
                { id: '1', title: 'Daily', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=150&fit=crop', icon: '📅', links: [] },
                { id: '2', title: 'Work', imageUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=200&h=150&fit=crop', icon: '💼', links: [] },
                { id: '3', title: 'Personal', imageUrl: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200&h=150&fit=crop', icon: '🏠', links: [] },
                { id: '4', title: 'Goals', imageUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=200&h=150&fit=crop', icon: '🎯', links: [] },
            ]
        },
        taskTable: {
            tasks: [
                { id: '1', title: 'Write blog post', tag: 'Work', tagColor: '#8b5cf6', date: '2024-12-05', priority: 'high', completed: false },
                { id: '2', title: 'Review code', tag: 'Work', tagColor: '#8b5cf6', date: '2024-12-06', priority: 'medium', completed: false },
                { id: '3', title: 'Team meeting', tag: 'Work', tagColor: '#8b5cf6', date: '2024-12-07', priority: 'low', completed: true },
            ]
        },
        youtube: { videoId: 'dQw4w9WgXcQ' },
        spotify: { spotifyUri: 'playlist/37i9dQZF1DXcBWIGoYBM5M' },
        calendar: {},
        upcoming: {},
        weather: {},
        clock: {},
    };

    return {
        id,
        type,
        content: defaultContent[type] || {},
    };
}
