"use client";

// ============================================================
// KnowledgeSources - 参考知识来源展示
// 在生成结果中显示引用了哪些 Obsidian 笔记
// ============================================================

import { useState } from "react";
import type { KnowledgeSource } from "@/types/knowledge";

interface KnowledgeSourcesProps {
  sources: KnowledgeSource[];
  collapsed?: boolean;
}

const AGENT_LABELS: Record<string, string> = {
  strategy: "策划",
  visual: "视觉",
  prompt: "提示词",
  review: "评审",
};

export function KnowledgeSources({
  sources,
  collapsed: initialCollapsed = true,
}: KnowledgeSourcesProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 border border-amber-500/20 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">📚</span>
          <span className="text-xs font-medium text-amber-300">
            参考知识来源
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
            {sources.length}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-zinc-500 transition-transform ${collapsed ? "" : "rotate-180"}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="px-3.5 py-3 space-y-2 border-t border-amber-500/10">
          {sources.map((source, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs">📝</span>
                  <span className="text-[11px] font-medium text-zinc-300 truncate">
                    {source.noteTitle}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 flex-shrink-0">
                  {AGENT_LABELS[source.usedBy] || source.usedBy} 智能体引用
                </span>
              </div>

              {/* Tags */}
              {source.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {source.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700/40 text-zinc-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Snippet */}
              <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                {source.snippet}
              </p>

              {/* Path */}
              <p className="text-[9px] text-zinc-600 mt-1 truncate font-mono">
                {source.notePath}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
