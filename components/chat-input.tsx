"use client";

// ============================================================
// ChatInput - 聊天输入栏
// 固定在底部：主题输入 + 参数快捷选择 + 发送按钮
// ============================================================

import { useState, useRef, useEffect } from "react";
import {
  PROJECT_TYPE_LABELS,
  VISUAL_STYLE_LABELS,
  TARGET_AUDIENCE_LABELS,
} from "@/types/creative";
import type { ProjectType, VisualStyle, TargetAudience } from "@/types/creative";

interface ChatInputProps {
  onSend: (params: {
    topic: string;
    projectType: ProjectType;
    visualStyle: VisualStyle;
    targetAudience: TargetAudience;
  }) => void;
  isGenerating: boolean;
}

const PROJECT_TYPES = Object.entries(PROJECT_TYPE_LABELS) as [
  ProjectType,
  string
][];
const VISUAL_STYLES = Object.entries(VISUAL_STYLE_LABELS) as [
  VisualStyle,
  string
][];
const TARGET_AUDIENCES = Object.entries(TARGET_AUDIENCE_LABELS) as [
  TargetAudience,
  string
][];

const PROJECT_ICONS: Record<string, string> = {
  "brand-visual": "🏷️",
  "poster-design": "🖼️",
  "cultural-tourism": "🏯",
  "ip-character": "🎭",
  "package-design": "📦",
};

export function ChatInput({ onSend, isGenerating }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("brand-visual");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("tech-futuristic");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("gen-z");
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus
  useEffect(() => {
    if (!isGenerating) {
      inputRef.current?.focus();
    }
  }, [isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSend({
      topic: input.trim(),
      projectType,
      visualStyle,
      targetAudience,
    });
    setInput("");
    setShowSettings(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Settings panel */}
        {showSettings && (
          <div className="mb-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 animate-in slide-in-from-bottom-2">
            {/* Project type */}
            <div>
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
                项目类型
              </label>
              <div className="flex gap-1 flex-wrap">
                {PROJECT_TYPES.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setProjectType(key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                      projectType === key
                        ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                        : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-xs">{PROJECT_ICONS[key]}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual style */}
            <div>
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
                视觉风格
              </label>
              <div className="flex gap-1 flex-wrap">
                {VISUAL_STYLES.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setVisualStyle(key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                      visualStyle === key
                        ? "border-purple-400/50 bg-purple-500/10 text-purple-300"
                        : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target audience */}
            <div>
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
                目标受众
              </label>
              <select
                value={targetAudience}
                onChange={(e) =>
                  setTargetAudience(e.target.value as TargetAudience)
                }
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50 appearance-none"
              >
                {TARGET_AUDIENCES.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active chips */}
        {!showSettings && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            >
              <span className="text-xs">{PROJECT_ICONS[projectType]}</span>
              {PROJECT_TYPE_LABELS[projectType]}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-500">
              {VISUAL_STYLE_LABELS[visualStyle]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-500">
              {TARGET_AUDIENCE_LABELS[targetAudience]}
            </span>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              showSettings
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-zinc-700/50"
            }`}
            title="参数设置"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你的视觉创意需求..."
              rows={1}
              maxLength={500}
              disabled={isGenerating}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isGenerating
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50"
                : "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95"
            }`}
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-[10px] text-zinc-600 text-center mt-2">
          Enter 发送 · Shift + Enter 换行 · 点击 ⚙ 调整参数
        </p>
      </div>
    </div>
  );
}
