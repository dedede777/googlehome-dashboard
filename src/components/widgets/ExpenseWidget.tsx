"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingDown } from "lucide-react";

const STORAGE_KEY = "dashboard-expense-tracker";

interface Expense {
    id: string;
    amount: number;
    category: string;
    note: string;
    date: string;
    timestamp: number;
}

interface ExpenseData {
    expenses: Expense[];
    monthlyBudget: number;
}

const CATEGORIES = [
    { id: "food", name: "食費", icon: "🍔", color: "#FF6B6B" },
    { id: "transport", name: "交通", icon: "🚃", color: "#4ECDC4" },
    { id: "shopping", name: "買物", icon: "🛍️", color: "#FFE66D" },
    { id: "entertainment", name: "娯楽", icon: "🎮", color: "#A855F7" },
    { id: "cafe", name: "カフェ", icon: "☕", color: "#8B5CF6" },
    { id: "other", name: "他", icon: "📦", color: "#6B7280" },
];

export default function ExpenseWidget() {
    const [data, setData] = useState<ExpenseData>({
        expenses: [],
        monthlyBudget: 50000,
    });
    const [mounted, setMounted] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("food");
    const [note, setNote] = useState("");

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setData(JSON.parse(saved));
        }
    }, []);

    const saveData = (newData: ExpenseData) => {
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    const addExpense = () => {
        const amountNum = parseInt(amount);
        if (!amountNum || amountNum <= 0) return;

        const newExpense: Expense = {
            id: Date.now().toString(),
            amount: amountNum,
            category,
            note,
            date: new Date().toDateString(),
            timestamp: Date.now(),
        };

        saveData({
            ...data,
            expenses: [...data.expenses, newExpense],
        });

        setAmount("");
        setNote("");
        setShowAdd(false);
    };

    const deleteExpense = (id: string) => {
        saveData({
            ...data,
            expenses: data.expenses.filter(e => e.id !== id),
        });
    };

    // Calculate totals
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const todayTotal = data.expenses
        .filter(e => e.date === today)
        .reduce((sum, e) => sum + e.amount, 0);

    const monthlyTotal = data.expenses
        .filter(e => {
            const d = new Date(e.timestamp);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const budgetPercent = Math.min((monthlyTotal / data.monthlyBudget) * 100, 100);
    const remaining = data.monthlyBudget - monthlyTotal;

    // Category breakdown for this month
    const categoryTotals = CATEGORIES.map(cat => {
        const total = data.expenses
            .filter(e => {
                const d = new Date(e.timestamp);
                return e.category === cat.id && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
        return { ...cat, total };
    }).filter(c => c.total > 0);

    // Recent expenses (today)
    const recentExpenses = data.expenses
        .filter(e => e.date === today)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);

    const getCategoryInfo = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[5];

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1520] to-[#0a0a0a]">
            {/* Header */}
            <div className="widget-title flex items-center justify-between flex-shrink-0">
                <span className="flex items-center gap-1.5">
                    <span className="text-yellow-400">💰</span>
                    EXPENSE
                </span>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="text-gray-500 hover:text-yellow-400 transition-colors"
                >
                    <Plus size={12} />
                </button>
            </div>

            {showAdd ? (
                /* Add expense form */
                <div className="flex-1 p-2 flex flex-col gap-2">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="金額 (円)"
                        className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#333] rounded text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                        autoFocus
                    />

                    <div className="grid grid-cols-6 gap-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`p-1.5 rounded text-center transition-all ${category === cat.id
                                        ? "ring-2 ring-yellow-400 bg-[#252525]"
                                        : "bg-[#1a1a1a] hover:bg-[#252525]"
                                    }`}
                                title={cat.name}
                            >
                                <span className="text-sm">{cat.icon}</span>
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="メモ (任意)"
                        className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#333] rounded text-xs text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                    />

                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={() => setShowAdd(false)}
                            className="flex-1 py-1.5 text-[10px] text-gray-400 bg-[#252525] rounded"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={addExpense}
                            className="flex-1 py-1.5 text-[10px] text-white bg-yellow-600 hover:bg-yellow-700 rounded"
                        >
                            追加
                        </button>
                    </div>
                </div>
            ) : (
                /* Main view */
                <div className="flex-1 flex flex-col p-2 min-h-0 gap-2">
                    {/* Today's spending */}
                    <div className="text-center flex-shrink-0">
                        <div className="text-[9px] text-gray-500">今日の支出</div>
                        <div className="text-xl font-bold text-yellow-400">
                            ¥{todayTotal.toLocaleString()}
                        </div>
                    </div>

                    {/* Monthly budget bar */}
                    <div className="flex-shrink-0">
                        <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
                            <span>月間 ¥{monthlyTotal.toLocaleString()}</span>
                            <span className={remaining < 0 ? "text-red-400" : ""}>
                                残 ¥{remaining.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${budgetPercent > 80 ? "bg-red-500" : budgetPercent > 50 ? "bg-yellow-500" : "bg-green-500"
                                    }`}
                                style={{ width: `${budgetPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Category breakdown */}
                    {categoryTotals.length > 0 && (
                        <div className="flex-shrink-0">
                            <div className="flex gap-1 flex-wrap">
                                {categoryTotals.slice(0, 4).map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px]"
                                        style={{ backgroundColor: cat.color + "20", color: cat.color }}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>¥{cat.total.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent expenses */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {recentExpenses.length > 0 ? (
                            <div className="space-y-1">
                                {recentExpenses.map((expense) => {
                                    const cat = getCategoryInfo(expense.category);
                                    return (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between p-1.5 bg-[#151515] rounded group"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm">{cat.icon}</span>
                                                <div>
                                                    <div className="text-[10px] text-white">
                                                        ¥{expense.amount.toLocaleString()}
                                                    </div>
                                                    {expense.note && (
                                                        <div className="text-[8px] text-gray-500 truncate max-w-[80px]">
                                                            {expense.note}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <TrendingDown size={24} className="mb-1 opacity-50" />
                                <div className="text-[9px]">今日の支出なし</div>
                            </div>
                        )}
                    </div>

                    {/* Quick add button */}
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex-shrink-0 w-full py-1.5 text-[10px] text-gray-400 hover:text-yellow-400 bg-[#151515] hover:bg-[#1a1a1a] rounded border border-[#252525] hover:border-yellow-500/30 transition-all flex items-center justify-center gap-1"
                    >
                        <Plus size={12} />
                        支出を追加
                    </button>
                </div>
            )}
        </div>
    );
}
