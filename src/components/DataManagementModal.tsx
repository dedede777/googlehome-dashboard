"use client";

import { useState } from "react";
import { Download, Upload, X, Check, AlertCircle, Copy } from "lucide-react";

interface DataManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [showJson, setShowJson] = useState(false);
    const [jsonData, setJsonData] = useState("");

    if (!isOpen) return null;

    const getExportData = () => {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("dashboard-")) {
                const value = localStorage.getItem(key);
                if (value) data[key] = value;
            }
        }
        return JSON.stringify(data, null, 2);
    };

    const handleExport = () => {
        try {
            const jsonString = getExportData();
            const filename = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;

            const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(jsonString);
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = filename;
            link.click();

            setStatus("success");
            setMessage(`ダウンロードを開始しました`);
        } catch (e) {
            console.error("Export failed:", e);
            setStatus("error");
            setMessage("エクスポートに失敗しました");
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            const jsonString = getExportData();
            await navigator.clipboard.writeText(jsonString);
            setStatus("success");
            setMessage("クリップボードにコピーしました！");
        } catch (e) {
            setStatus("error");
            setMessage("コピーに失敗しました");
        }
    };

    const handleShowJson = () => {
        const jsonString = getExportData();
        setJsonData(jsonString);
        setShowJson(true);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const data = JSON.parse(json);

                if (typeof data !== "object") throw new Error("Invalid format");

                Object.entries(data).forEach(([key, value]) => {
                    if (key.startsWith("dashboard-") && typeof value === "string") {
                        localStorage.setItem(key, value);
                    }
                });

                setStatus("success");
                setMessage("インポートが完了しました。ページをリロードします...");
                setTimeout(() => window.location.reload(), 1500);
            } catch (e) {
                setStatus("error");
                setMessage("インポートに失敗しました。ファイル形式を確認してください。");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-2 text-white">データ管理</h2>
                <p className="text-sm text-gray-400 mb-6">ダッシュボードの設定とデータをバックアップ・復元します。</p>

                <div className="space-y-4">
                    {/* Export */}
                    <div className="p-4 bg-[#252525] rounded border border-[#333]">
                        <h3 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Download size={16} />エクスポート (バックアップ)
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">JSONをコピーしてメモ帳などに保存してください。</p>
                        <button onClick={handleCopyToClipboard} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1">
                            <Copy size={12} />クリップボードにコピー
                        </button>
                        <button onClick={handleShowJson} className="w-full py-2 bg-[#333] hover:bg-[#444] text-gray-300 text-xs rounded transition-colors">
                            JSONを表示
                        </button>

                        {showJson && (
                            <textarea
                                value={jsonData}
                                readOnly
                                className="w-full h-32 mt-2 p-2 bg-[#0a0a0a] border border-[#444] text-[10px] text-gray-300 font-mono rounded resize-y"
                                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                            />
                        )}
                    </div>

                    {/* Import */}
                    <div className="p-4 bg-[#252525] rounded border border-[#333]">
                        <h3 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Upload size={16} />インポート (復元)
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                            <span className="text-red-400">※現在のデータは上書きされます</span>
                        </p>
                        <label className="block w-full">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#333] file:text-white file:cursor-pointer hover:file:bg-[#444]"
                            />
                        </label>
                    </div>
                </div>

                {status !== "idle" && (
                    <div className={`mt-4 p-3 rounded flex items-center gap-2 text-xs ${status === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                        {status === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
