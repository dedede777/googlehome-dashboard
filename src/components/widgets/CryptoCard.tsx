"use client";

import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface CryptoData {
    id: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
}

const COINS = ["bitcoin", "ethereum", "solana"];

export default function CryptoCard() {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCrypto = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc`
            );
            if (!response.ok) throw new Error("API_ERROR");
            const data = await response.json();
            setCryptoData(data);
            setError(null);
        } catch (err) {
            setError("FETCH_FAILED");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCrypto();
        const interval = setInterval(fetchCrypto, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [fetchCrypto]);

    const getPriceIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="text-green-500" size={14} />;
        if (change < 0) return <TrendingDown className="text-red-500" size={14} />;
        return <Minus className="text-gray-500" size={14} />;
    };

    const formatPrice = (price: number) => {
        if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;
        return `$${price.toFixed(2)}`;
    };

    return (
        <div className="brutalist-card h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-wider text-[var(--accent)]">
                    CRYPTO::MARKET
                </h2>
                <button
                    onClick={fetchCrypto}
                    className="p-1 border-0 bg-transparent hover:bg-transparent"
                    disabled={loading}
                >
                    <RefreshCw
                        size={14}
                        className={`text-[var(--border-color)] hover:text-[var(--accent)] ${loading ? "animate-spin" : ""}`}
                    />
                </button>
            </div>

            {error ? (
                <div className="flex items-center justify-center h-24">
                    <span className="text-red-500 text-xs">ERROR: {error}</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {(loading ? Array(3).fill(null) : cryptoData).map((coin, index) => (
                        <div
                            key={coin?.id || index}
                            className="flex items-center justify-between p-2 border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors"
                        >
                            {loading ? (
                                <div className="w-full h-6 bg-[var(--hover-bg)] animate-pulse" />
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold uppercase">{coin.symbol}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{formatPrice(coin.current_price)}</span>
                                        <div className="flex items-center gap-1">
                                            {getPriceIcon(coin.price_change_percentage_24h)}
                                            <span
                                                className={`text-xs ${coin.price_change_percentage_24h > 0
                                                        ? "text-green-500"
                                                        : coin.price_change_percentage_24h < 0
                                                            ? "text-red-500"
                                                            : "text-gray-500"
                                                    }`}
                                            >
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
