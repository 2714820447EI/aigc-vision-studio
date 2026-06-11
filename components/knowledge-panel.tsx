"use client";

// ============================================================
// KnowledgePanel - 知识库侧栏面板
// 显示连接状态、笔记统计、关键词检索
// ============================================================

import { useState, useEffect, useCallback } from "react";
import type { KnowledgeStatus, SearchResult } from "@/types/knowledge";

interface KnowledgePanelProps {
  onSearchResultClick?: (note: SearchResult["note"]) => void;
}

export function KnowledgePanel({ onSearchResultClick }: KnowledgePanelProps) {
  const [status, setStatus] = useState<KnowledgeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  // 初始化：扫描知识库
  const scanKnowledgeBase = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const url = force
        ? "/api/knowledge/scan?force=true"
        : "/api/knowledge/scan";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        setMockMode(data.mockMode || false);
      }
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    scanKnowledgeBase();
  }, [scanKnowledgeBase]);

  // 搜索
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), maxResults: 8 }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // 回车搜索
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* 知识库状态 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            知识库
          </h2>
          <button
            onClick={() => scanKnowledgeBase(true)}
            disabled={isLoading}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isLoading ? "扫描中..." : "⟳ 刷新"}
          </button>
        </div>

        {/* Connection status badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
          <div
            className={`w-2 h-2 rounded-full ${
              status?.connected
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                : mockMode
                  ? "bg-amber-400"
                  : "bg-zinc-600"
            }`}
          />
          <div className="min-w-0">
            <span className="text-[11px] text-zinc-300">
              {status?.connected
                ? "已连接 Obsidian"
                : mockMode
                  ? "演示模式 (Mock 数据)"
                  : "未连接"}
            </span>
            {status && (
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {status.noteCount} 篇笔记 ·{" "}
                {status.lastScannedAt
                  ? formatTime(status.lastScannedAt)
                  : "未扫描"}
              </p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        {status && status.noteCount > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <div className="px-2 py-1.5 rounded-lg bg-zinc-800/20 border border-zinc-800">
              <p className="text-[10px] text-zinc-500">笔记数</p>
              <p className="text-sm font-semibold text-zinc-300">
                {status.noteCount}
              </p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-zinc-800/20 border border-zinc-800">
              <p className="text-[10px] text-zinc-500">标签数</p>
              <p className="text-sm font-semibold text-zinc-300">
                {status.tagsCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 知识库检索 */}
      <div>
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          检索知识
        </h3>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索笔记关键词..."
            className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors disabled:opacity-40"
          >
            {isSearching ? "..." : "搜索"}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-1.5 max-h-[340px] overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.note.id}
                onClick={() => onSearchResultClick?.(result.note)}
                className="w-full text-left p-2.5 rounded-lg bg-zinc-800/20 border border-zinc-700/30 hover:border-cyan-500/20 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-medium text-zinc-300 truncate">
                    {result.note.title}
                  </p>
                  <span className="text-[10px] text-cyan-400 flex-shrink-0">
                    {Math.round(result.relevance * 100)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {result.snippets[0] && (
                  <p className="text-[10px] text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {result.snippets[0]}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            未找到匹配的笔记
          </p>
        )}
      </div>
    </div>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;

  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
