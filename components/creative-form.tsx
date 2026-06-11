"use client";

// ============================================================
// CreativeForm - 创意输入表单（中间面板）
// ============================================================

import { useState, useRef, useEffect } from "react";
import {
  PROJECT_TYPE_LABELS,
  VISUAL_STYLE_LABELS,
  TARGET_AUDIENCE_LABELS,
} from "@/types/creative";
import type { ProjectType, VisualStyle, TargetAudience } from "@/types/creative";

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

interface CreativeFormProps {
  onGenerate: (params: {
    topic: string;
    projectType: ProjectType;
    visualStyle: VisualStyle;
    targetAudience: TargetAudience;
  }) => void;
  isGenerating: boolean;
}

export function CreativeForm({ onGenerate, isGenerating }: CreativeFormProps) {
  const [topic, setTopic] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("brand-visual");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("tech-futuristic");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("gen-z");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [topic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate({ topic: topic.trim(), projectType, visualStyle, targetAudience });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 主题输入 */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          创意主题
        </label>
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述你的视觉创意主题，例如：为校园咖啡品牌设计一套年轻化视觉方案..."
          rows={3}
          maxLength={200}
          className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-[11px] text-zinc-500">
            ⌘ + Enter 快速生成
          </p>
          <p className="text-[11px] text-zinc-500">
            {topic.length}/200
          </p>
        </div>
      </div>

      {/* 项目类型 */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          项目类型
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {PROJECT_TYPES.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setProjectType(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all text-[11px] ${
                projectType === key
                  ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                  : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              <span className="text-base">{PROJECT_ICONS[key]}</span>
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 视觉风格 */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          视觉风格
        </label>
        <div className="flex flex-wrap gap-1.5">
          {VISUAL_STYLES.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setVisualStyle(key)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                visualStyle === key
                  ? "border-purple-400/50 bg-purple-500/10 text-purple-300"
                  : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 目标受众 */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
          目标受众
        </label>
        <select
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
          className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer"
        >
          {TARGET_AUDIENCES.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 生成按钮 */}
      <button
        type="submit"
        disabled={!topic.trim() || isGenerating}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
          !topic.trim() || isGenerating
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98]"
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            智能体协作中...
          </>
        ) : (
          <>
            <span className="text-base">⚡</span>
            生成视觉方案
          </>
        )}
      </button>
    </form>
  );
}
