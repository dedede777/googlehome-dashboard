"use client";

import { useState } from "react";
import { Download, Upload, X, Check, AlertCircle } from "lucide-react";

interface DataManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const handleExport = () => {
        try {
            const data: Record<string, string> = {};
            // Export all keys starting with "dashboard-"
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("dashboard-")) {
                    const value = localStorage.getItem(key);
                    if (value) data[key] = value;
                }
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus("success");
            setMessage("エクスポートが完了しました");
        } catch (e) {
            setStatus("error");
            setMessage("エクスポートに失敗しました");
        }
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

                // Restore data
                Object.entries(data).forEach(([key, value]) => {
                    if (key.startsWith("dashboard-") && typeof value === "string") {
                        localStorage.setItem(key, value);
                    }
                });

                setStatus("success");
                setMessage("インポートが完了しました。ページをリロードしてください。");

                // Reload after short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (e) {
                setStatus("error");
                setMessage("インポートに失敗しました。ファイル形式を確認してください。");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-2 text-white">データ管理</h2>
                <p className="text-sm text-gray-400 mb-6">
                    ダッシュボードの設定とデータをバックアップ・復元します。
                    別のデバイスやブラウザにデータを移行する際に使用してください。
                </p>

                <div className="space-y-4">
                    {/* Export */}
                    <div className="p-4 bg-[#252525] rounded border border-[#333]">
                        <h3 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Download size={16} />
                            エクスポート (バックアップ)
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                            現在のデータをJSONファイルとしてダウンロードします。
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                            データをダウンロード
                        </button>
                    </div>

                    {/* Import */}
                    <div className="p-4 bg-[#252525] rounded border border-[#333]">
                        <h3 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Upload size={16} />
                            インポート (復元)
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                            バックアップファイルを読み込んでデータを復元します。
                            <br />
                            <span className="text-red-400">※現在のデータは上書きされます</span>
                        </p>
                        <label className="block w-full">
                            <span className="sr-only">ファイルを選択</span>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="block w-full text-xs text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-[#333] file:text-white
                                    file:cursor-pointer hover:file:bg-[#444]"
                            />
                        </label>
                    </div>
                </div>

                {/* Status Message */}
                {status !== "idle" && (
                    <div className={`mt-4 p-3 rounded flex items-center gap-2 text-xs ${status === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                        }`}>
                        {status === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
