"use client";

// ============================================================
// HistoryList - 历史方案列表（左侧面板底部）
// ============================================================

import type { CreativeResult } from "@/types/creative";
import { PROJECT_TYPE_LABELS } from "@/types/creative";

interface HistoryListProps {
  history: CreativeResult[];
  onSelect: (result: CreativeResult) => void;
  selectedId: string | null;
  onClear: () => void;
}

export function HistoryList({
  history,
  onSelect,
  selectedId,
  onClear,
}: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-8">
        <span className="text-2xl mb-2 opacity-40">📭</span>
        <p className="text-xs">暂无历史方案</p>
        <p className="text-[10px] mt-0.5 opacity-60">
          生成的方案将保存在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          历史方案 ({history.length})
        </span>
        <button
          onClick={onClear}
          className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
        >
          清空
        </button>
      </div>
      <div className="space-y-1 max-h-[280px] overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-2.5 rounded-lg transition-all border ${
              selectedId === item.id
                ? "border-cyan-500/50 bg-cyan-500/10"
                : "border-transparent hover:border-zinc-700/50 hover:bg-zinc-800/30"
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5 flex-shrink-0">
                {getProjectIcon(item.projectType)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-300 truncate leading-tight">
                  {item.topic}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-zinc-500">
                    {PROJECT_TYPE_LABELS[item.projectType]}
                  </span>
                  <span className="text-[10px] text-zinc-600">·</span>
                  <span className="text-[10px] text-zinc-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.review?.overallScore && (
                  <span
                    className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.review.overallScore >= 85
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.review.overallScore >= 70
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {item.review.overallScore}分
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getProjectIcon(type: string): string {
  const icons: Record<string, string> = {
    "brand-visual": "🏷️",
    "poster-design": "🖼️",
    "cultural-tourism": "🏯",
    "ip-character": "🎭",
    "package-design": "📦",
  };
  return icons[type] || "📋";
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}
