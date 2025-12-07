"use client";

import { useState, useEffect } from "react";
import { Zap, Cpu, Check, X, AlertCircle } from "lucide-react";
import { useAISettings, GROQ_MODELS, AIProvider } from "@/contexts/AISettingsContext";

interface AISettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
    const { settings, updateSettings } = useAISettings();
    const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
    const [testMessage, setTestMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTestStatus("idle");
            setTestMessage("");
        }
    }, [isOpen]);

    const testAPI = async () => {
        setTestStatus("testing");
        setTestMessage("接続テスト中...");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "Say OK",
                    history: [],
                    provider: settings.provider,
                    model: settings.groqModel,
                }),
            });

            const data = await res.json();

            if (data.response) {
                setTestStatus("success");
                setTestMessage("✓ 接続成功！");
            } else {
                setTestStatus("error");
                setTestMessage(data.error || "エラーが発生しました");
            }
        } catch (error) {
            setTestStatus("error");
            setTestMessage("接続に失敗しました");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 w-[320px] max-w-[90vw] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Zap size={16} className="text-cyan-400" />
                        AI設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Provider Selection */}
                <div className="mb-4">
                    <p className="text-[10px] text-gray-500 mb-2">AIプロバイダー</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => updateSettings({ provider: "groq" as AIProvider })}
                            className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${settings.provider === "groq"
                                    ? "border-cyan-500 bg-cyan-900/30 text-cyan-400"
                                    : "border-[#333] bg-[#0a0a0a] text-gray-400 hover:border-[#444]"
                                }`}
                        >
                            <Zap size={16} />
                            <div className="text-left">
                                <p className="text-[11px] font-medium">Groq</p>
                                <p className="text-[8px] opacity-70">高速・安定</p>
                            </div>
                            {settings.provider === "groq" && <Check size={14} className="ml-auto" />}
                        </button>
                        <button
                            onClick={() => updateSettings({ provider: "gemini" as AIProvider })}
                            className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${settings.provider === "gemini"
                                    ? "border-purple-500 bg-purple-900/30 text-purple-400"
                                    : "border-[#333] bg-[#0a0a0a] text-gray-400 hover:border-[#444]"
                                }`}
                        >
                            <Cpu size={16} />
                            <div className="text-left">
                                <p className="text-[11px] font-medium">Gemini</p>
                                <p className="text-[8px] opacity-70">Google AI</p>
                            </div>
                            {settings.provider === "gemini" && <Check size={14} className="ml-auto" />}
                        </button>
                    </div>
                </div>

                {/* Groq Model Selection */}
                {settings.provider === "groq" && (
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-500 mb-2">モデル</p>
                        <select
                            value={settings.groqModel}
                            onChange={(e) => updateSettings({ groqModel: e.target.value })}
                            className="w-full p-2.5 text-[11px] bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        >
                            {GROQ_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Test Result */}
                {testStatus !== "idle" && (
                    <div className={`mb-4 p-2 rounded-lg text-[10px] flex items-center gap-2 ${testStatus === "success"
                            ? "bg-green-900/30 border border-green-700/50 text-green-400"
                            : testStatus === "error"
                                ? "bg-red-900/30 border border-red-700/50 text-red-400"
                                : "bg-[#0a0a0a] border border-[#333] text-gray-400"
                        }`}>
                        {testStatus === "testing" && <span className="animate-spin">⟳</span>}
                        {testStatus === "success" && <Check size={12} />}
                        {testStatus === "error" && <AlertCircle size={12} />}
                        {testMessage}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={testAPI}
                        disabled={testStatus === "testing"}
                        className="flex-1 py-2.5 text-[11px] font-medium rounded-lg transition-all bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 disabled:opacity-50"
                    >
                        接続テスト
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-[11px] font-medium rounded-lg transition-all bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                        完了
                    </button>
                </div>

                {/* Current Status */}
                <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                    <p className="text-[9px] text-gray-500 text-center">
                        現在: {settings.provider === "groq" ? "🚀 Groq" : "✨ Gemini"}
                        {settings.provider === "groq" && ` / ${settings.groqModel.split("-").slice(0, 2).join(" ")}`}
                    </p>
                </div>
            </div>
        </div>
    );
}
