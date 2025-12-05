"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Settings, Plus, X, Check } from "lucide-react";

interface ExchangeRate {
    id: string;
    from: string;
    to: string;
    rate: number;
    change: number;
}

interface CurrencyPair {
    id: string;
    from: string;
    to: string;
}

const STORAGE_KEY = "dashboard-exchange-pairs";
const CACHE_KEY = "dashboard-exchange-cache";

const DEFAULT_PAIRS: CurrencyPair[] = [
    { id: "1", from: "USD", to: "JPY" },
    { id: "2", from: "EUR", to: "JPY" },
    { id: "3", from: "BTC", to: "USD" },
];

const CURRENCIES = ["USD", "JPY", "EUR", "GBP", "CNY", "KRW", "AUD", "CAD", "CHF", "HKD", "BTC", "ETH"];

export default function ExchangeWidget() {
    const [pairs, setPairs] = useState<CurrencyPair[]>(DEFAULT_PAIRS);
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFrom, setNewFrom] = useState("USD");
    const [newTo, setNewTo] = useState("JPY");
    const [mounted, setMounted] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    useEffect(() => {
        setMounted(true);
        const savedPairs = localStorage.getItem(STORAGE_KEY);
        if (savedPairs) setPairs(JSON.parse(savedPairs));

        // Load cached rates
        const cachedRates = localStorage.getItem(CACHE_KEY);
        if (cachedRates) {
            const { rates: cached, time } = JSON.parse(cachedRates);
            setRates(cached);
            setLastUpdate(time);
        }
    }, []);

    useEffect(() => {
        if (mounted && pairs.length > 0) {
            fetchRates();
        }
    }, [mounted, pairs]);

    const savePairs = (p: CurrencyPair[]) => {
        setPairs(p);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    };

    const fetchRates = async () => {
        setLoading(true);
        try {
            const newRates: ExchangeRate[] = [];

            for (const pair of pairs) {
                // Use free API for fiat currencies
                if (pair.from !== "BTC" && pair.from !== "ETH" && pair.to !== "BTC" && pair.to !== "ETH") {
                    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${pair.from}`);
                    const data = await res.json();
                    const rate = data.rates[pair.to] || 0;
                    const prevRate = rates.find(r => r.id === pair.id)?.rate || rate;
                    const change = prevRate ? ((rate - prevRate) / prevRate) * 100 : 0;
                    newRates.push({ id: pair.id, from: pair.from, to: pair.to, rate, change });
                } else {
                    // For crypto, use CoinGecko
                    const cryptoId = pair.from === "BTC" ? "bitcoin" : pair.from === "ETH" ? "ethereum" : "";
                    const vsCurrency = pair.to.toLowerCase();
                    if (cryptoId) {
                        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${vsCurrency}&include_24hr_change=true`);
                        const data = await res.json();
                        const rate = data[cryptoId]?.[vsCurrency] || 0;
                        const change = data[cryptoId]?.[`${vsCurrency}_24h_change`] || 0;
                        newRates.push({ id: pair.id, from: pair.from, to: pair.to, rate, change });
                    }
                }
            }

            setRates(newRates);
            const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            setLastUpdate(time);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: newRates, time }));
        } catch (error) {
            console.error("Failed to fetch rates:", error);
        }
        setLoading(false);
    };

    const addPair = () => {
        if (newFrom === newTo) return;
        const newPair: CurrencyPair = { id: Date.now().toString(), from: newFrom, to: newTo };
        savePairs([...pairs, newPair]);
        setShowAddForm(false);
    };

    const deletePair = (id: string) => {
        savePairs(pairs.filter(p => p.id !== id));
        setRates(rates.filter(r => r.id !== id));
    };

    const formatRate = (rate: number): string => {
        if (rate >= 1000) return rate.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
        if (rate >= 1) return rate.toLocaleString("ja-JP", { maximumFractionDigits: 2 });
        return rate.toLocaleString("ja-JP", { maximumFractionDigits: 6 });
    };

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0 flex items-center justify-between">
                <span>EXCHANGE</span>
                <div className="flex items-center gap-1">
                    {lastUpdate && <span className="text-[8px] text-gray-600">{lastUpdate}</span>}
                    <button onClick={fetchRates} disabled={loading} className="p-0.5 text-gray-600 hover:text-gray-400">
                        <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-0.5 text-gray-600 hover:text-gray-400">
                        <Settings size={10} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-2 overflow-auto min-h-0">
                {showSettings ? (
                    <div className="space-y-1">
                        <p className="text-[9px] text-gray-500 mb-2">通貨ペアを管理:</p>
                        {pairs.map((pair) => (
                            <div key={pair.id} className="flex items-center justify-between p-2 bg-[#151515] border border-[#2a2a2a]">
                                <span className="text-[10px] text-gray-300">{pair.from} → {pair.to}</span>
                                <button onClick={() => deletePair(pair.id)} className="text-gray-600 hover:text-red-400">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {showAddForm ? (
                            <div className="p-2 bg-[#151515] border border-[#2a2a2a] space-y-2">
                                <div className="flex items-center gap-2">
                                    <select value={newFrom} onChange={(e) => setNewFrom(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none">
                                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <span className="text-gray-500">→</span>
                                    <select value={newTo} onChange={(e) => setNewTo(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none">
                                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={addPair} className="flex-1 py-1 text-[10px] text-gray-300 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]">追加</button>
                                    <button onClick={() => setShowAddForm(false)} className="px-2 py-1 text-[10px] text-gray-500 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a]">キャンセル</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 bg-[#151515] border border-dashed border-[#3a3a3a] hover:border-[#555] transition-colors">
                                <Plus size={12} /><span>追加</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {rates.map((rate) => (
                            <div key={rate.id} className="p-2 bg-[#151515] border border-[#2a2a2a]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-gray-500">{rate.from}/{rate.to}</span>
                                    <div className={`flex items-center gap-1 text-[9px] ${rate.change > 0 ? "text-green-400" : rate.change < 0 ? "text-red-400" : "text-gray-500"}`}>
                                        {rate.change > 0 ? <TrendingUp size={10} /> : rate.change < 0 ? <TrendingDown size={10} /> : null}
                                        {rate.change !== 0 && <span>{rate.change > 0 ? "+" : ""}{rate.change.toFixed(2)}%</span>}
                                    </div>
                                </div>
                                <div className="text-lg font-mono text-gray-200">{formatRate(rate.rate)}</div>
                            </div>
                        ))}
                        {rates.length === 0 && !loading && (
                            <p className="text-[10px] text-gray-500 text-center py-4">通貨ペアを設定してください</p>
                        )}
                        {loading && rates.length === 0 && (
                            <p className="text-[10px] text-gray-500 text-center py-4">読み込み中...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
