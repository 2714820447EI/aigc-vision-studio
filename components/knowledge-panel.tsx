"use client";

// ============================================================
// KnowledgePanel - 知识库侧栏面板
// 离线模式：直接 import 本地 Mock 数据，无需网络请求
// ============================================================

import { useState, useCallback, useMemo } from "react";
import { MOCK_NOTES } from "@/lib/mock-knowledge";
import { searchKnowledge } from "@/lib/knowledge-search";
import type { KnowledgeStatus, SearchResult, KnowledgeNote } from "@/types/knowledge";

const STATUS: KnowledgeStatus = (() => {
  const allTags = new Set<string>();
  MOCK_NOTES.forEach((n) => n.tags.forEach((t) => allTags.add(t)));
  return {
    connected: false,
    vaultPath: "",
    noteCount: MOCK_NOTES.length,
    lastScannedAt: new Date().toISOString(),
    tagsCount: allTags.size,
  };
})();

interface KnowledgePanelProps {
  onSearchResultClick?: (note: KnowledgeNote) => void;
}

export function KnowledgePanel({ onSearchResultClick }: KnowledgePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const results = searchKnowledge(searchQuery.trim(), MOCK_NOTES, {
      maxResults: 8,
      minRelevance: 0.03,
    });
    setSearchResults(results);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-4">
      {/* 知识库状态 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            知识库
          </h2>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="min-w-0">
            <span className="text-[11px] text-zinc-300">离线模式 (内置知识库)</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {STATUS.noteCount} 篇笔记 · {STATUS.tagsCount} 个标签
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <div className="px-2 py-1.5 rounded-lg bg-zinc-800/20 border border-zinc-800">
            <p className="text-[10px] text-zinc-500">笔记数</p>
            <p className="text-sm font-semibold text-zinc-300">{STATUS.noteCount}</p>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-zinc-800/20 border border-zinc-800">
            <p className="text-[10px] text-zinc-500">标签数</p>
            <p className="text-sm font-semibold text-zinc-300">{STATUS.tagsCount}</p>
          </div>
        </div>

        {/* All notes quick list */}
        <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
          {MOCK_NOTES.map((note) => (
            <button
              key={note.id}
              onClick={() => onSearchResultClick?.(note)}
              className="w-full text-left p-2 rounded-lg bg-zinc-800/20 border border-zinc-700/20 hover:border-cyan-500/20 transition-colors"
            >
              <p className="text-[11px] font-medium text-zinc-400 truncate">{note.title}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {note.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[9px] px-1 py-0.5 rounded-full bg-zinc-700/50 text-zinc-500">
                    #{tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 知识库检索 */}
      <div>
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">检索知识</h3>
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
            disabled={!searchQuery.trim()}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors disabled:opacity-40"
          >
            搜索
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-1.5 max-h-[300px] overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.note.id}
                onClick={() => onSearchResultClick?.(result.note)}
                className="w-full text-left p-2.5 rounded-lg bg-zinc-800/20 border border-zinc-700/30 hover:border-cyan-500/20 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-medium text-zinc-300 truncate">{result.note.title}</p>
                  <span className="text-[10px] text-cyan-400 flex-shrink-0">{Math.round(result.relevance * 100)}%</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400">#{tag}</span>
                  ))}
                </div>
                {result.snippets[0] && (
                  <p className="text-[10px] text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{result.snippets[0]}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {hasSearched && searchResults.length === 0 && (
          <p className="text-[10px] text-zinc-600 mt-2 text-center">未找到匹配的笔记</p>
        )}
      </div>
    </div>
  );
}
