"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Send, Lightbulb, Volume2, ChevronRight, BookOpen, Plus, Trash2, X, Filter, Trophy, Target, ThumbsUp, ThumbsDown } from "lucide-react";

// Common English phrases and words that native speakers use
const FLASHCARD_DATA = [
    // === EVERYDAY EXPRESSIONS ===
    { word: "I mean", type: "expression", category: "everyday", example: "I mean, it's not that bad." },
    { word: "You know", type: "expression", category: "everyday", example: "It's like, you know, complicated." },
    { word: "kind of", type: "expression", category: "everyday", example: "I kind of like it." },
    { word: "sort of", type: "expression", category: "everyday", example: "It's sort of weird." },
    { word: "actually", type: "adverb", category: "everyday", example: "Actually, I changed my mind." },
    { word: "basically", type: "adverb", category: "everyday", example: "Basically, it means yes." },
    { word: "literally", type: "adverb", category: "everyday", example: "I literally can't even." },
    { word: "honestly", type: "adverb", category: "everyday", example: "Honestly, I don't care." },
    { word: "apparently", type: "adverb", category: "everyday", example: "Apparently, he quit his job." },
    { word: "definitely", type: "adverb", category: "everyday", example: "I'll definitely be there." },
    { word: "probably", type: "adverb", category: "everyday", example: "I'll probably be late." },
    { word: "obviously", type: "adverb", category: "everyday", example: "Obviously, that's wrong." },
    { word: "eventually", type: "adverb", category: "everyday", example: "Eventually, it worked out." },
    { word: "anyway", type: "transition", category: "everyday", example: "Anyway, let's move on." },
    { word: "by the way", type: "transition", category: "everyday", example: "By the way, did you hear?" },
    { word: "I guess", type: "filler", category: "everyday", example: "I guess you're right." },
    { word: "like", type: "filler", category: "everyday", example: "It was like really cool." },
    { word: "so", type: "connector", category: "everyday", example: "So, what happened next?" },
    { word: "well", type: "filler", category: "everyday", example: "Well, let me think about it." },
    { word: "right", type: "confirmation", category: "everyday", example: "This is correct, right?" },
    { word: "though", type: "contrast", category: "everyday", example: "It's expensive though." },
    { word: "still", type: "contrast", category: "everyday", example: "I still don't get it." },
    { word: "yet", type: "contrast", category: "everyday", example: "Have you eaten yet?" },
    { word: "just", type: "emphasis", category: "everyday", example: "I just want to help." },
    { word: "really", type: "emphasis", category: "everyday", example: "Do you really think so?" },
    // More everyday expressions
    { word: "a lot", type: "expression", category: "everyday", example: "I like it a lot." },
    { word: "a bit", type: "expression", category: "everyday", example: "I'm a bit tired." },
    { word: "pretty much", type: "expression", category: "everyday", example: "It's pretty much done." },
    { word: "for sure", type: "agreement", category: "everyday", example: "For sure, I'll be there." },
    { word: "of course", type: "agreement", category: "everyday", example: "Of course, no problem!" },
    { word: "I see", type: "understanding", category: "everyday", example: "I see, that makes sense." },
    { word: "I think so", type: "opinion", category: "everyday", example: "I think so, but I'm not sure." },
    { word: "I don't think so", type: "opinion", category: "everyday", example: "I don't think so." },
    { word: "I hope so", type: "hope", category: "everyday", example: "I hope so!" },
    { word: "Let me see", type: "thinking", category: "everyday", example: "Let me see... yes, I have it." },
    { word: "Let me think", type: "thinking", category: "everyday", example: "Let me think about it." },
    { word: "What do you mean?", type: "question", category: "everyday", example: "What do you mean by that?" },
    { word: "How come?", type: "question", category: "everyday", example: "How come you're late?" },
    { word: "What's wrong?", type: "question", category: "everyday", example: "What's wrong? You look sad." },
    { word: "What happened?", type: "question", category: "everyday", example: "What happened to you?" },
    { word: "Are you sure?", type: "question", category: "everyday", example: "Are you sure about that?" },
    { word: "Is that so?", type: "question", category: "everyday", example: "Is that so? I didn't know." },
    { word: "Really?", type: "surprise", category: "everyday", example: "Really? That's amazing!" },
    { word: "Seriously?", type: "surprise", category: "everyday", example: "Seriously? No way!" },
    { word: "Exactly!", type: "agreement", category: "everyday", example: "Exactly! That's what I meant." },
    { word: "Absolutely!", type: "strong agreement", category: "everyday", example: "Absolutely! 100%." },
    { word: "Not really", type: "soft negative", category: "everyday", example: "Not really, I'm just okay." },
    { word: "Not at all", type: "strong negative", category: "everyday", example: "Not at all, don't worry." },
    { word: "I don't mind", type: "neutral", category: "everyday", example: "I don't mind either way." },
    { word: "I don't care", type: "indifference", category: "everyday", example: "I don't care what they say." },
    { word: "It depends", type: "conditional", category: "everyday", example: "It depends on the weather." },
    { word: "That's true", type: "agreement", category: "everyday", example: "That's true, you're right." },
    { word: "I'm not sure", type: "uncertainty", category: "everyday", example: "I'm not sure about that." },
    { word: "I have no idea", type: "uncertainty", category: "everyday", example: "I have no idea what to do." },
    { word: "No problem", type: "response", category: "everyday", example: "No problem, happy to help." },
    { word: "Never mind", type: "dismissal", category: "everyday", example: "Never mind, forget it." },
    { word: "It's fine", type: "reassurance", category: "everyday", example: "It's fine, don't worry." },
    { word: "It's okay", type: "reassurance", category: "everyday", example: "It's okay, I understand." },
    { word: "Go ahead", type: "permission", category: "everyday", example: "Go ahead, I'll wait." },
    { word: "Sure thing", type: "agreement", category: "everyday", example: "Sure thing, I'll do it." },
    { word: "Sounds good", type: "agreement", category: "everyday", example: "Sounds good to me!" },
    { word: "That works", type: "agreement", category: "everyday", example: "That works for me." },
    { word: "Fair enough", type: "acceptance", category: "everyday", example: "Fair enough, I get it." },
    { word: "Good point", type: "agreement", category: "everyday", example: "Good point, I didn't think of that." },
    { word: "Guess what?", type: "attention", category: "everyday", example: "Guess what? I got the job!" },
    { word: "You know what?", type: "attention", category: "everyday", example: "You know what? Let's do it." },
    { word: "The thing is", type: "explanation", category: "everyday", example: "The thing is, I'm busy." },
    { word: "The point is", type: "emphasis", category: "everyday", example: "The point is, we need to act now." },
    { word: "To be honest", type: "honesty", category: "everyday", example: "To be honest, I don't like it." },
    { word: "To tell you the truth", type: "honesty", category: "everyday", example: "To tell you the truth, I was scared." },
    { word: "As far as I know", type: "knowledge", category: "everyday", example: "As far as I know, it's free." },
    { word: "As I said", type: "reference", category: "everyday", example: "As I said, we need more time." },
    { word: "In my opinion", type: "opinion", category: "everyday", example: "In my opinion, it's the best." },
    { word: "I was wondering", type: "polite question", category: "everyday", example: "I was wondering if you could help." },
    { word: "I was thinking", type: "suggestion", category: "everyday", example: "I was thinking we could go out." },
    { word: "How's it going?", type: "greeting", category: "everyday", example: "Hey, how's it going?" },
    { word: "What's going on?", type: "greeting", category: "everyday", example: "What's going on with you?" },
    { word: "Long time no see", type: "greeting", category: "everyday", example: "Long time no see! How are you?" },
    { word: "Take care", type: "farewell", category: "everyday", example: "See you later, take care!" },
    { word: "See you later", type: "farewell", category: "everyday", example: "I gotta go. See you later!" },
    { word: "Catch you later", type: "farewell", category: "everyday", example: "Alright, catch you later!" },
    { word: "Talk to you later", type: "farewell", category: "everyday", example: "I'll talk to you later, bye!" },
    { word: "Have a good one", type: "farewell", category: "everyday", example: "Thanks! Have a good one!" },
    { word: "I'm starving", type: "feeling", category: "everyday", example: "I'm starving, let's eat!" },
    { word: "I'm exhausted", type: "feeling", category: "everyday", example: "I'm exhausted from work." },
    { word: "I'm fed up", type: "frustration", category: "everyday", example: "I'm fed up with this." },
    { word: "I can't wait", type: "excitement", category: "everyday", example: "I can't wait for the weekend!" },
    { word: "I couldn't help it", type: "apology", category: "everyday", example: "I couldn't help it, I laughed." },
    { word: "That reminds me", type: "transition", category: "everyday", example: "That reminds me, I need to call mom." },
    { word: "Speaking of which", type: "transition", category: "everyday", example: "Speaking of which, did you hear?" },
    { word: "On second thought", type: "change of mind", category: "everyday", example: "On second thought, let's stay." },
    { word: "After all", type: "conclusion", category: "everyday", example: "It worked out after all." },
    { word: "As usual", type: "routine", category: "everyday", example: "He's late as usual." },
    { word: "At least", type: "consolation", category: "everyday", example: "At least we tried." },
    { word: "At first", type: "time", category: "everyday", example: "At first, I didn't like it." },
    { word: "In the end", type: "conclusion", category: "everyday", example: "In the end, everything was fine." },
    { word: "For now", type: "temporary", category: "everyday", example: "This is good enough for now." },
    { word: "So far", type: "progress", category: "everyday", example: "So far, so good." },
    { word: "All of a sudden", type: "surprise", category: "everyday", example: "All of a sudden, it started raining." },
    { word: "Little by little", type: "gradual", category: "everyday", example: "Little by little, I'm improving." },
    { word: "Once in a while", type: "frequency", category: "everyday", example: "I go there once in a while." },
    { word: "As soon as possible", type: "urgency", category: "everyday", example: "Please reply as soon as possible." },

    // === PHRASAL VERBS ===
    { word: "figure out", type: "phrasal verb", category: "phrasal", example: "I need to figure out the problem." },
    { word: "come up with", type: "phrasal verb", category: "phrasal", example: "Can you come up with an idea?" },
    { word: "look forward to", type: "phrasal verb", category: "phrasal", example: "I look forward to meeting you." },
    { word: "end up", type: "phrasal verb", category: "phrasal", example: "We ended up staying home." },
    { word: "turn out", type: "phrasal verb", category: "phrasal", example: "It turned out to be great." },
    { word: "get along", type: "phrasal verb", category: "phrasal", example: "Do you get along with him?" },
    { word: "catch up", type: "phrasal verb", category: "phrasal", example: "Let's catch up over coffee." },
    { word: "run into", type: "phrasal verb", category: "phrasal", example: "I ran into an old friend." },
    { word: "put off", type: "phrasal verb", category: "phrasal", example: "Don't put it off until tomorrow." },
    { word: "give up", type: "phrasal verb", category: "phrasal", example: "Never give up on your dreams." },
    { word: "work out", type: "phrasal verb", category: "phrasal", example: "Things will work out." },
    { word: "find out", type: "phrasal verb", category: "phrasal", example: "I just found out about it." },
    { word: "pick up", type: "phrasal verb", category: "phrasal", example: "Can you pick me up at 5?" },
    { word: "show up", type: "phrasal verb", category: "phrasal", example: "He didn't show up." },
    { word: "bring up", type: "phrasal verb", category: "phrasal", example: "Don't bring up that topic." },
    { word: "set up", type: "phrasal verb", category: "phrasal", example: "Let's set up a meeting." },
    { word: "take off", type: "phrasal verb", category: "phrasal", example: "The plane is taking off." },
    { word: "put up with", type: "phrasal verb", category: "phrasal", example: "I can't put up with this." },
    { word: "look into", type: "phrasal verb", category: "phrasal", example: "I'll look into it." },
    { word: "turn down", type: "phrasal verb", category: "phrasal", example: "They turned down my offer." },

    // === CASUAL / SLANG ===
    { word: "What's up?", type: "greeting", category: "slang", example: "Hey! What's up?" },
    { word: "No worries", type: "response", category: "slang", example: "No worries, I got it." },
    { word: "My bad", type: "apology", category: "slang", example: "My bad, I forgot." },
    { word: "I'm down", type: "agreement", category: "slang", example: "Movie tonight? I'm down." },
    { word: "That's fair", type: "agreement", category: "slang", example: "That's fair, I understand." },
    { word: "Makes sense", type: "understanding", category: "slang", example: "Oh, that makes sense now." },
    { word: "Same here", type: "agreement", category: "slang", example: "I'm tired. — Same here." },
    { word: "For real", type: "emphasis", category: "slang", example: "For real? That's crazy!" },
    { word: "No way", type: "surprise", category: "slang", example: "No way! I can't believe it." },
    { word: "big deal", type: "expression", category: "slang", example: "It's not a big deal." },
    { word: "chill", type: "adjective", category: "slang", example: "Just chill, it's okay." },
    { word: "legit", type: "adjective", category: "slang", example: "This is legit amazing." },
    { word: "lowkey", type: "adverb", category: "slang", example: "I lowkey want to go." },
    { word: "vibe", type: "noun", category: "slang", example: "I'm just vibing." },
    { word: "ghost", type: "verb", category: "slang", example: "He ghosted me." },
    { word: "flex", type: "verb", category: "slang", example: "Stop flexing on us." },
    { word: "I'm so done", type: "frustration", category: "slang", example: "I'm so done with this." },
    { word: "that's insane", type: "surprise", category: "slang", example: "That's insane! How?" },
    { word: "I'm obsessed", type: "love", category: "slang", example: "I'm obsessed with this song." },
    { word: "it hits different", type: "special", category: "slang", example: "Coffee at 6AM hits different." },
    { word: "bet", type: "agreement", category: "slang", example: "See you at 8? Bet." },
    { word: "slay", type: "compliment", category: "slang", example: "You totally slayed that presentation!" },
    { word: "no cap", type: "truth", category: "slang", example: "No cap, this is the best pizza." },
    { word: "sus", type: "suspicious", category: "slang", example: "That seems kinda sus." },

    // === IDIOMS ===
    { word: "break the ice", type: "idiom", category: "idiom", example: "Let me break the ice with a joke." },
    { word: "piece of cake", type: "idiom", category: "idiom", example: "The test was a piece of cake." },
    { word: "cost an arm and a leg", type: "idiom", category: "idiom", example: "That car costs an arm and a leg." },
    { word: "hit the nail on the head", type: "idiom", category: "idiom", example: "You hit the nail on the head!" },
    { word: "under the weather", type: "idiom", category: "idiom", example: "I'm feeling under the weather." },
    { word: "once in a blue moon", type: "idiom", category: "idiom", example: "I go there once in a blue moon." },
    { word: "the last straw", type: "idiom", category: "idiom", example: "That was the last straw for me." },
    { word: "beat around the bush", type: "idiom", category: "idiom", example: "Stop beating around the bush." },
    { word: "get out of hand", type: "idiom", category: "idiom", example: "Things got out of hand quickly." },
    { word: "on the same page", type: "idiom", category: "idiom", example: "Are we on the same page?" },
    { word: "bite the bullet", type: "idiom", category: "idiom", example: "Just bite the bullet and do it." },
    { word: "spill the beans", type: "idiom", category: "idiom", example: "Don't spill the beans!" },
    { word: "break a leg", type: "idiom", category: "idiom", example: "Break a leg on your interview!" },
    { word: "hold your horses", type: "idiom", category: "idiom", example: "Hold your horses, I'm coming!" },
    { word: "let the cat out of the bag", type: "idiom", category: "idiom", example: "Who let the cat out of the bag?" },
    { word: "kill two birds with one stone", type: "idiom", category: "idiom", example: "Let's kill two birds with one stone." },
    { word: "the ball is in your court", type: "idiom", category: "idiom", example: "The ball is in your court now." },
    { word: "when pigs fly", type: "idiom", category: "idiom", example: "That'll happen when pigs fly." },
    { word: "a blessing in disguise", type: "idiom", category: "idiom", example: "It was a blessing in disguise." },
    { word: "get cold feet", type: "idiom", category: "idiom", example: "I'm getting cold feet about it." },

    // === BUSINESS ENGLISH ===
    { word: "touch base", type: "business", category: "business", example: "Let's touch base next week." },
    { word: "circle back", type: "business", category: "business", example: "I'll circle back on this." },
    { word: "moving forward", type: "business", category: "business", example: "Moving forward, we'll focus on X." },
    { word: "reach out", type: "business", category: "business", example: "Feel free to reach out anytime." },
    { word: "follow up", type: "business", category: "business", example: "I'll follow up on that." },
    { word: "leverage", type: "business", category: "business", example: "We can leverage this opportunity." },
    { word: "synergy", type: "business", category: "business", example: "There's great synergy here." },
    { word: "bandwidth", type: "business", category: "business", example: "I don't have the bandwidth for that." },
    { word: "deep dive", type: "business", category: "business", example: "Let's do a deep dive on this." },
    { word: "low-hanging fruit", type: "business", category: "business", example: "Start with the low-hanging fruit." },
    { word: "think outside the box", type: "business", category: "business", example: "We need to think outside the box." },
    { word: "get the ball rolling", type: "business", category: "business", example: "Let's get the ball rolling." },
    { word: "take it offline", type: "business", category: "business", example: "Let's take this offline." },
    { word: "move the needle", type: "business", category: "business", example: "This will move the needle." },
    { word: "pivot", type: "business", category: "business", example: "We need to pivot our strategy." },
    { word: "scalable", type: "business", category: "business", example: "Is this solution scalable?" },
    { word: "streamline", type: "business", category: "business", example: "We need to streamline the process." },
    { word: "pain point", type: "business", category: "business", example: "What's your main pain point?" },

    // === PRONUNCIATION TRICKY ===
    { word: "comfortable", type: "pronunciation", category: "pronunciation", example: "Make yourself comfortable. [KUMF-ter-bul]" },
    { word: "wednesday", type: "pronunciation", category: "pronunciation", example: "See you Wednesday. [WENZ-day]" },
    { word: "vegetable", type: "pronunciation", category: "pronunciation", example: "Eat your vegetables. [VEJ-tuh-bul]" },
    { word: "February", type: "pronunciation", category: "pronunciation", example: "My birthday is in February. [FEB-yoo-air-ee]" },
    { word: "jewelry", type: "pronunciation", category: "pronunciation", example: "Nice jewelry! [JOO-ul-ree]" },
    { word: "colonel", type: "pronunciation", category: "pronunciation", example: "He's a colonel. [KER-nul]" },
    { word: "often", type: "pronunciation", category: "pronunciation", example: "I often go there. [OFF-en or OFF-ten]" },
    { word: "clothes", type: "pronunciation", category: "pronunciation", example: "Nice clothes! [KLOHZ]" },
    { word: "salmon", type: "pronunciation", category: "pronunciation", example: "I'll have the salmon. [SAM-un]" },
    { word: "receipt", type: "pronunciation", category: "pronunciation", example: "Keep the receipt. [ri-SEET]" },
];

const CATEGORIES = [
    { id: "all", name: "全て" },
    { id: "everyday", name: "日常" },
    { id: "phrasal", name: "句動詞" },
    { id: "slang", name: "スラング" },
    { id: "idiom", name: "イディオム" },
    { id: "business", name: "ビジネス" },
    { id: "pronunciation", name: "発音注意" },
    { id: "custom", name: "カスタム" },
];

const STORAGE_KEY = "dashboard-flashcard-v2";
const DAILY_GOAL = 5; // Daily word goal

interface WordProgress {
    word: string;
    level: number; // 0-5: higher = more mastered
    lastSeen: number; // timestamp
    nextReview: number; // timestamp when to review
    correct: number;
    incorrect: number;
}

interface DailyStats {
    date: string;
    practiced: number;
    streak: number;
}

interface CustomWord {
    word: string;
    type: string;
    category: string;
    example: string;
}

interface StorageData {
    progress: Record<string, WordProgress>;
    customWords: CustomWord[];
    dailyStats: DailyStats;
    totalStreak: number;
    selectedCategory: string;
}

// Spaced repetition intervals in hours
const SR_INTERVALS = [0, 1, 4, 24, 72, 168]; // 0h, 1h, 4h, 1d, 3d, 7d

export default function FlashcardWidget() {
    const [currentCard, setCurrentCard] = useState<typeof FLASHCARD_DATA[0] | null>(null);
    const [userSentence, setUserSentence] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [showExample, setShowExample] = useState(false);
    const [mode, setMode] = useState<"card" | "practice" | "settings" | "add" | "stats">("card");
    const [mounted, setMounted] = useState(false);

    // Progress tracking
    const [progress, setProgress] = useState<Record<string, WordProgress>>({});
    const [customWords, setCustomWords] = useState<CustomWord[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats>({ date: "", practiced: 0, streak: 0 });
    const [totalStreak, setTotalStreak] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [newWord, setNewWord] = useState({ word: "", type: "", example: "" });

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data: StorageData = JSON.parse(saved);
            setProgress(data.progress || {});
            setCustomWords(data.customWords || []);
            setTotalStreak(data.totalStreak || 0);
            setSelectedCategory(data.selectedCategory || "all");

            // Check if it's a new day
            const today = new Date().toDateString();
            if (data.dailyStats?.date === today) {
                setDailyStats(data.dailyStats);
            } else {
                // New day - reset daily stats, check streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const wasYesterday = data.dailyStats?.date === yesterday.toDateString();
                const newStreak = wasYesterday && data.dailyStats.practiced >= DAILY_GOAL
                    ? (data.totalStreak || 0) + 1
                    : (data.dailyStats?.practiced >= DAILY_GOAL ? data.totalStreak || 0 : 0);
                setTotalStreak(newStreak);
                setDailyStats({ date: today, practiced: 0, streak: newStreak });
            }
        }
        pickNextCard();
    };

    const saveData = (updates: Partial<StorageData>) => {
        const current: StorageData = {
            progress,
            customWords,
            dailyStats,
            totalStreak,
            selectedCategory,
            ...updates
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    };

    const getAllWords = () => {
        return [...FLASHCARD_DATA, ...customWords.map(w => ({ ...w, category: "custom" }))];
    };

    const getWordsDueForReview = () => {
        const now = Date.now();
        const allWords = getAllWords();
        const filtered = selectedCategory === "all"
            ? allWords
            : allWords.filter(w => w.category === selectedCategory);

        return filtered.filter(w => {
            const p = progress[w.word];
            if (!p) return true; // New word
            if (p.level >= 5) return false; // Mastered
            return now >= p.nextReview;
        }).sort((a, b) => {
            const pA = progress[a.word];
            const pB = progress[b.word];
            if (!pA) return -1;
            if (!pB) return 1;
            return pA.nextReview - pB.nextReview;
        });
    };

    const pickNextCard = (cat?: string, updatedProgress?: Record<string, WordProgress>) => {
        const category = cat || selectedCategory;
        const prog = updatedProgress || progress;
        const allWords = getAllWords();
        const filtered = category === "all"
            ? allWords
            : allWords.filter(w => w.category === category);

        const now = Date.now();

        // Priority: words due for review
        const dueWords = filtered.filter(w => {
            const p = prog[w.word];
            if (!p) return true;
            if (p.level >= 5) return false;
            return now >= p.nextReview;
        });

        if (dueWords.length > 0) {
            // Pick word with lowest level first (needs more practice)
            dueWords.sort((a, b) => {
                const pA = prog[a.word]?.level || 0;
                const pB = prog[b.word]?.level || 0;
                return pA - pB;
            });
            // Avoid same card
            const nextCard = dueWords.find(w => w.word !== currentCard?.word) || dueWords[0];
            setCurrentCard(nextCard);
        } else if (filtered.length > 0) {
            // No words due, pick random different from current
            const available = filtered.filter(w => w.word !== currentCard?.word);
            if (available.length > 0) {
                const randomIndex = Math.floor(Math.random() * available.length);
                setCurrentCard(available[randomIndex]);
            } else {
                const randomIndex = Math.floor(Math.random() * filtered.length);
                setCurrentCard(filtered[randomIndex]);
            }
        }

        setUserSentence("");
        setFeedback("");
        setShowExample(false);
        setMode("card");
    };

    const recordAnswer = (correct: boolean) => {
        if (!currentCard) return;

        const now = Date.now();
        const current = progress[currentCard.word] || {
            word: currentCard.word,
            level: 0,
            lastSeen: now,
            nextReview: now,
            correct: 0,
            incorrect: 0
        };

        let newLevel = current.level;
        if (correct) {
            newLevel = Math.min(5, current.level + 1);
            current.correct++;
        } else {
            newLevel = Math.max(0, current.level - 1);
            current.incorrect++;
        }

        const hoursUntilReview = SR_INTERVALS[newLevel] || SR_INTERVALS[SR_INTERVALS.length - 1];
        current.level = newLevel;
        current.lastSeen = now;
        current.nextReview = now + hoursUntilReview * 60 * 60 * 1000;

        const newProgress = { ...progress, [currentCard.word]: current };
        setProgress(newProgress);

        // Update daily stats
        const today = new Date().toDateString();
        const newDaily = {
            date: today,
            practiced: (dailyStats.date === today ? dailyStats.practiced : 0) + 1,
            streak: totalStreak
        };
        setDailyStats(newDaily);

        saveData({ progress: newProgress, dailyStats: newDaily });
        pickNextCard(undefined, newProgress);
    };

    const speakWord = () => {
        if (currentCard && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(currentCard.word);
            utterance.lang = "en-US";
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        saveData({ selectedCategory: cat });
        pickNextCard(cat);
    };

    const addCustomWord = () => {
        if (!newWord.word.trim()) return;
        const word: CustomWord = {
            word: newWord.word.trim(),
            type: newWord.type.trim() || "custom",
            category: "custom",
            example: newWord.example.trim() || `Example with "${newWord.word}"`
        };
        const updated = [...customWords, word];
        setCustomWords(updated);
        saveData({ customWords: updated });
        setNewWord({ word: "", type: "", example: "" });
        setMode("settings");
    };

    const deleteCustomWord = (index: number) => {
        const updated = customWords.filter((_, i) => i !== index);
        setCustomWords(updated);
        saveData({ customWords: updated });
    };

    const resetProgress = () => {
        setProgress({});
        setDailyStats({ date: new Date().toDateString(), practiced: 0, streak: 0 });
        setTotalStreak(0);
        saveData({ progress: {}, dailyStats: { date: new Date().toDateString(), practiced: 0, streak: 0 }, totalStreak: 0 });
    };

    const checkSentence = async () => {
        if (!userSentence.trim() || !currentCard) return;
        setLoading(true);
        setFeedback("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `英語の先生として、生徒の文をチェックしてください。

【学習中の表現】「${currentCard.word}」（${currentCard.type}）
【生徒の文】「${userSentence}」

以下のフォーマットで簡潔に回答（前置きなし）：
1. 使い方の評価（○正しい/△惜しい/×間違い）
2. フィードバック（1-2文で励まし）
3. より自然な例文（もしあれば）`,
                    history: []
                })
            });

            const data = await res.json();
            if (data.response) {
                setFeedback(data.response);
                // Record progress without switching cards
                const now = Date.now();
                const current = progress[currentCard.word] || {
                    word: currentCard.word,
                    level: 0,
                    lastSeen: now,
                    nextReview: now,
                    correct: 0,
                    incorrect: 0
                };
                const newLevel = Math.min(5, current.level + 1);
                const hoursUntilReview = SR_INTERVALS[newLevel] || SR_INTERVALS[SR_INTERVALS.length - 1];
                const updated = {
                    ...current,
                    level: newLevel,
                    lastSeen: now,
                    nextReview: now + hoursUntilReview * 60 * 60 * 1000,
                    correct: current.correct + 1
                };
                const newProgress = { ...progress, [currentCard.word]: updated };
                setProgress(newProgress);

                const today = new Date().toDateString();
                const newDaily = {
                    date: today,
                    practiced: (dailyStats.date === today ? dailyStats.practiced : 0) + 1,
                    streak: totalStreak
                };
                setDailyStats(newDaily);
                saveData({ progress: newProgress, dailyStats: newDaily });
            } else {
                setFeedback("エラーが発生しました。");
            }
        } catch {
            setFeedback("接続エラーが発生しました。");
        }
        setLoading(false);
    };

    // Stats calculation
    const getMasteredCount = () => Object.values(progress).filter(p => p.level >= 5).length;
    const getLearningCount = () => Object.values(progress).filter(p => p.level > 0 && p.level < 5).length;
    const getDueCount = () => getWordsDueForReview().length;

    if (!mounted) return null;

    // Daily progress bar
    const dailyProgress = Math.min(100, (dailyStats.practiced / DAILY_GOAL) * 100);
    const goalReached = dailyStats.practiced >= DAILY_GOAL;

    // Stats mode
    if (mode === "stats") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Trophy size={12} />統計</span>
                    <button onClick={() => setMode("card")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 overflow-auto space-y-3">
                    <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-400">🔥 {totalStreak}</p>
                        <p className="text-[9px] text-gray-400">連続日数</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-900/30 rounded p-2">
                            <p className="text-lg font-bold text-green-400">{getMasteredCount()}</p>
                            <p className="text-[8px] text-gray-400">マスター</p>
                        </div>
                        <div className="bg-yellow-900/30 rounded p-2">
                            <p className="text-lg font-bold text-yellow-400">{getLearningCount()}</p>
                            <p className="text-[8px] text-gray-400">学習中</p>
                        </div>
                        <div className="bg-blue-900/30 rounded p-2">
                            <p className="text-lg font-bold text-blue-400">{getDueCount()}</p>
                            <p className="text-[8px] text-gray-400">復習待ち</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded p-2">
                        <p className="text-[9px] text-gray-400 mb-1">今日の進捗</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all" style={{ width: `${dailyProgress}%` }} />
                            </div>
                            <span className="text-[9px] text-gray-300">{dailyStats.practiced}/{DAILY_GOAL}</span>
                        </div>
                    </div>
                    <button onClick={resetProgress} className="w-full py-1.5 text-[9px] text-red-400 border border-red-900 rounded hover:bg-red-900/30">
                        進捗をリセット
                    </button>
                </div>
            </div>
        );
    }

    // Settings mode
    if (mode === "settings") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span>設定</span>
                    <button onClick={() => setMode("card")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    <div className="mb-3">
                        <p className="text-[9px] text-gray-500 mb-1">カテゴリ:</p>
                        <div className="flex flex-wrap gap-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-2 py-1 text-[8px] rounded ${selectedCategory === cat.id ? "bg-cyan-600 text-white" : "bg-[#333] text-gray-400"}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-[#333] pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] text-gray-500">カスタム単語 ({customWords.length})</p>
                            <button onClick={() => setMode("add")} className="text-[8px] text-cyan-400 flex items-center gap-1">
                                <Plus size={10} />追加
                            </button>
                        </div>
                        {customWords.map((w, i) => (
                            <div key={i} className="flex items-center justify-between py-1 border-b border-[#222]">
                                <span className="text-[9px] text-gray-300">{w.word}</span>
                                <button onClick={() => deleteCustomWord(i)} className="text-gray-500 hover:text-red-400"><Trash2 size={10} /></button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[8px] text-gray-600 mt-3">収録数: {getAllWords().length} | 復習待ち: {getDueCount()}</p>
                </div>
            </div>
        );
    }

    // Add custom word mode
    if (mode === "add") {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span>単語追加</span>
                    <button onClick={() => setMode("settings")} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 p-2 space-y-2">
                    <input placeholder="単語/フレーズ" value={newWord.word} onChange={(e) => setNewWord({ ...newWord, word: e.target.value })} className="w-full px-2 py-1.5 text-[10px] bg-[#1a1a1a] border border-[#3a3a3a] rounded" />
                    <input placeholder="タイプ" value={newWord.type} onChange={(e) => setNewWord({ ...newWord, type: e.target.value })} className="w-full px-2 py-1.5 text-[10px] bg-[#1a1a1a] border border-[#3a3a3a] rounded" />
                    <input placeholder="例文" value={newWord.example} onChange={(e) => setNewWord({ ...newWord, example: e.target.value })} className="w-full px-2 py-1.5 text-[10px] bg-[#1a1a1a] border border-[#3a3a3a] rounded" />
                    <button onClick={addCustomWord} className="w-full py-2 text-[10px] text-white bg-green-600 hover:bg-green-700 rounded">追加</button>
                </div>
            </div>
        );
    }

    // Practice mode  
    if (mode === "practice" && currentCard) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="widget-title flex-shrink-0 flex items-center justify-between">
                    <span className="flex items-center gap-1"><BookOpen size={12} />練習</span>
                    <span className="text-[8px] text-orange-400">🔥 {totalStreak}</span>
                </div>
                <div className="flex-1 p-2 overflow-auto min-h-0 flex flex-col">
                    <div className="text-center mb-2 p-2 bg-[#1a1a1a] rounded">
                        <span className="text-[9px] text-gray-500">この単語を使って文を作ろう:</span>
                        <p className="text-sm font-bold text-cyan-400">{currentCard.word}</p>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <textarea
                            value={userSentence}
                            onChange={(e) => setUserSentence(e.target.value)}
                            placeholder="英語で文を書いてください..."
                            className="flex-1 w-full p-2 text-[11px] bg-[#0a0a0a] border border-[#3a3a3a] rounded resize-none focus:border-cyan-500 focus:outline-none mb-2"
                            disabled={loading}
                        />
                        <button onClick={checkSentence} disabled={loading || !userSentence.trim()} className="w-full py-2 text-[10px] text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded flex items-center justify-center gap-1">
                            {loading ? "チェック中..." : <><Send size={12} />AIにチェック</>}
                        </button>
                    </div>
                    {feedback && (
                        <div className="mt-2 p-2 bg-green-900/30 border border-green-700/50 rounded text-[10px] text-gray-300 max-h-28 overflow-auto whitespace-pre-wrap">
                            {feedback}
                        </div>
                    )}
                    <button onClick={() => { setMode("card"); setFeedback(""); }} className="mt-2 text-[9px] text-gray-500 hover:text-gray-300">← カードに戻る</button>
                </div>
            </div>
        );
    }

    if (!currentCard) {
        pickNextCard();
        return null;
    }

    const currentProgress = progress[currentCard.word];
    const level = currentProgress?.level || 0;

    // Card mode (default)
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span className="flex items-center gap-1"><BookOpen size={12} />ENGLISH</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setMode("stats")} className="p-0.5 text-gray-500 hover:text-white" title="統計"><Trophy size={10} /></button>
                    <button onClick={() => setMode("settings")} className="p-0.5 text-gray-500 hover:text-white" title="設定"><Filter size={10} /></button>
                </div>
            </div>

            {/* Daily Challenge Bar */}
            <div className="px-2 pt-1">
                <div className="flex items-center gap-2 text-[8px]">
                    <Target size={10} className={goalReached ? "text-green-400" : "text-gray-500"} />
                    <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${goalReached ? "bg-green-500" : "bg-cyan-500"}`} style={{ width: `${dailyProgress}%` }} />
                    </div>
                    <span className={goalReached ? "text-green-400" : "text-gray-500"}>{dailyStats.practiced}/{DAILY_GOAL}</span>
                    {totalStreak > 0 && <span className="text-orange-400">🔥{totalStreak}</span>}
                </div>
            </div>

            <div className="flex-1 p-2 overflow-auto min-h-0">
                <div className="h-full flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-3 mb-2">
                        <div className="flex items-center gap-1 mb-1">
                            <span className="text-[8px] text-gray-500">{currentCard.type}</span>
                            <span className="text-[8px] text-gray-600">•</span>
                            <span className="text-[8px] text-gray-500">Lv.{level}</span>
                            {level >= 5 && <span className="text-[8px]">⭐</span>}
                        </div>
                        <p className="text-lg font-bold text-white mb-2 text-center">{currentCard.word}</p>
                        <button onClick={speakWord} className="p-1 text-gray-400 hover:text-white mb-2"><Volume2 size={16} /></button>
                        {showExample ? (
                            <p className="text-[10px] text-gray-400 text-center italic">"{currentCard.example}"</p>
                        ) : (
                            <button onClick={() => setShowExample(true)} className="text-[9px] text-cyan-500 hover:text-cyan-400 flex items-center gap-1">
                                <Lightbulb size={10} />例文を見る
                            </button>
                        )}
                    </div>

                    {/* Quick rating buttons */}
                    <div className="flex gap-1 mb-1">
                        <button onClick={() => recordAnswer(false)} className="flex-1 py-2 text-[10px] text-red-400 bg-red-900/30 hover:bg-red-900/50 rounded flex items-center justify-center gap-1">
                            <ThumbsDown size={12} />わからない
                        </button>
                        <button onClick={() => recordAnswer(true)} className="flex-1 py-2 text-[10px] text-green-400 bg-green-900/30 hover:bg-green-900/50 rounded flex items-center justify-center gap-1">
                            <ThumbsUp size={12} />知ってる
                        </button>
                    </div>
                    <button onClick={() => setMode("practice")} className="w-full py-2 text-[10px] text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-1">
                        練習する <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}
