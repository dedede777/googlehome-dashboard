"use client";

import { TrendingUp, TrendingDown, X, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface CryptoData {
    id: string;
    symbol: string;
    price: number;
    change: number;
}

interface CoinInfo {
    id: string;
    symbol: string;
    name: string;
}

const STORAGE_KEY = "dashboard-crypto-coins";
const DEFAULT_COINS: CoinInfo[] = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "solana", symbol: "SOL", name: "Solana" },
];

export default function CryptoWidget() {
    const [data, setData] = useState<CryptoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedCoins, setSelectedCoins] = useState<CoinInfo[]>(DEFAULT_COINS);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CoinInfo[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setSelectedCoins(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (!mounted || selectedCoins.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }

        const fetchData = () => {
            const ids = selectedCoins.map(c => c.id).join(",");
            fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc`)
                .then(res => res.json())
                .then(coins => {
                    if (Array.isArray(coins)) {
                        setData(coins.map((c: { id: string; symbol: string; current_price: number; price_change_percentage_24h: number }) => ({
                            id: c.id,
                            symbol: c.symbol.toUpperCase(),
                            price: c.current_price,
                            change: c.price_change_percentage_24h || 0
                        })));
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [selectedCoins, mounted]);

    const searchCoins = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.coins) {
                setSearchResults(data.coins.slice(0, 10).map((c: { id: string; symbol: string; name: string }) => ({
                    id: c.id,
                    symbol: c.symbol.toUpperCase(),
                    name: c.name
                })));
            }
        } catch {
            setSearchResults([]);
        }
        setSearching(false);
    };

    const addCoin = (coin: CoinInfo) => {
        if (selectedCoins.some(c => c.id === coin.id)) return;
        const updated = [...selectedCoins, coin];
        setSelectedCoins(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSearchQuery("");
        setSearchResults([]);
    };

    const removeCoin = (coinId: string) => {
        const updated = selectedCoins.filter(c => c.id !== coinId);
        setSelectedCoins(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const formatPrice = (p: number) => {
        if (p >= 1000) return `$${(p / 1000).toFixed(1)}K`;
        if (p >= 1) return `$${p.toFixed(2)}`;
        if (p >= 0.01) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(6)}`;
    };

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="widget-title flex-shrink-0">CRYPTO</div>

            {showSettings ? (
                <div className="flex-1 p-2 overflow-auto min-h-0">
                    {/* Search */}
                    <div className="flex gap-1 mb-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchCoins()}
                            placeholder="コイン検索..."
                            className="flex-1 bg-[#0a0a0a] border border-[#3a3a3a] text-[10px] text-gray-300 p-1.5 outline-none focus:border-[#555]"
                        />
                        <button
                            onClick={searchCoins}
                            disabled={searching}
                            className="px-2 bg-[#252525] border border-[#3a3a3a] hover:bg-[#2a2a2a] disabled:opacity-50"
                        >
                            <Search size={10} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mb-2 space-y-1">
                            <p className="text-[8px] text-gray-600">検索結果:</p>
                            {searchResults.map((coin) => (
                                <button
                                    key={coin.id}
                                    onClick={() => addCoin(coin)}
                                    disabled={selectedCoins.some(c => c.id === coin.id)}
                                    className="w-full flex items-center justify-between text-[10px] p-1.5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-gray-400 disabled:opacity-50"
                                >
                                    <span>{coin.symbol} - {coin.name}</span>
                                    <Plus size={10} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected Coins */}
                    <p className="text-[8px] text-gray-600 mb-1">登録コイン:</p>
                    <div className="space-y-1">
                        {selectedCoins.map((coin) => (
                            <div
                                key={coin.id}
                                className="flex items-center justify-between text-[10px] p-1.5 bg-[#252525] border border-[#3a3a3a] text-gray-300"
                            >
                                <span>{coin.symbol} - {coin.name}</span>
                                <button
                                    onClick={() => removeCoin(coin.id)}
                                    className="text-gray-500 hover:text-red-400"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-2 space-y-1 overflow-auto min-h-0">
                    {loading ? (
                        <p className="text-[10px] text-[#666]">読み込み中...</p>
                    ) : data.length === 0 ? (
                        <p className="text-[10px] text-[#666]">コイン未選択</p>
                    ) : (
                        data.map((coin) => (
                            <a
                                key={coin.id}
                                href={`https://coinmarketcap.com/currencies/${coin.id}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-[10px] hover:bg-[#1a1a1a] p-1 -mx-1 px-1 rounded transition-colors group"
                            >
                                <span className="text-[#888] font-semibold group-hover:text-cyan-400 transition-colors">{coin.symbol}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[#666] group-hover:text-gray-400">{formatPrice(coin.price)}</span>
                                    <span className={`text-[9px] ${coin.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(1)}%
                                    </span>
                                    {coin.change >= 0 ? (
                                        <TrendingUp size={10} className="text-green-500" />
                                    ) : (
                                        <TrendingDown size={10} className="text-red-500" />
                                    )}
                                </div>
                            </a>
                        ))
                    )}
                </div>
            )}

            <div className="p-1.5 border-t border-[#2a2a2a] flex-shrink-0">
                <button
                    onClick={() => {
                        setShowSettings(!showSettings);
                        setSearchResults([]);
                        setSearchQuery("");
                    }}
                    className="w-full flex items-center justify-center gap-1 py-1 text-[9px] text-gray-500 hover:text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                >
                    {showSettings ? <X size={10} /> : <Plus size={10} />}
                    <span>{showSettings ? "完了" : "追加"}</span>
                </button>
            </div>
        </div>
    );
}
