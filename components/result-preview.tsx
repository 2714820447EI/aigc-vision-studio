"use client";

// ============================================================
// ResultPreview - 生成结果预览（右侧面板）
// ============================================================

import { useState } from "react";
import type { CreativeResult, AgentOutput } from "@/types/creative";
import { PROJECT_TYPE_LABELS } from "@/types/creative";

interface ResultPreviewProps {
  result: CreativeResult | null;
  activeTab?: string;
}

type PreviewTab =
  | "summary"
  | "strategy"
  | "visual"
  | "prompt"
  | "review"
  | "portfolio";

const TABS: { key: PreviewTab; label: string; icon: string }[] = [
  { key: "summary", label: "方案摘要", icon: "📋" },
  { key: "strategy", label: "策略分析", icon: "🧠" },
  { key: "visual", label: "视觉方案", icon: "🎨" },
  { key: "prompt", label: "生图提示词", icon: "✨" },
  { key: "review", label: "方案评审", icon: "🔍" },
  { key: "portfolio", label: "作品展示", icon: "📁" },
];

export function ResultPreview({ result }: ResultPreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("summary");

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <div className="text-6xl mb-4 opacity-30">🎨</div>
        <p className="text-sm">在左侧输入创意主题</p>
        <p className="text-xs mt-1 opacity-60">生成结果将在此展示</p>
      </div>
    );
  }

  const agentOutput = (type: string): AgentOutput | undefined =>
    result.agentOutputs.find((o) => o.agentType === type);

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {activeTab === "summary" && <SummaryTab result={result} />}
        {activeTab === "strategy" && (
          <AgentOutputTab output={agentOutput("strategy")} />
        )}
        {activeTab === "visual" && (
          <VisualTab result={result} output={agentOutput("visual")} />
        )}
        {activeTab === "prompt" && (
          <PromptTab output={agentOutput("prompt")} />
        )}
        {activeTab === "review" && (
          <ReviewTab result={result} output={agentOutput("review")} />
        )}
        {activeTab === "portfolio" && (
          <PortfolioTab result={result} />
        )}
      </div>
    </div>
  );
}

// ---- 子 Tab 组件 ----

function SummaryTab({ result }: { result: CreativeResult }) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">📋 项目摘要</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{result.summary}</p>
      </div>

      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">💡 创意概念</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {result.creativeConcept}
        </p>
      </div>

      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">👥 目标用户</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {result.targetUser}
        </p>
      </div>

      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">🏷️ 基本信息</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-zinc-500">项目类型</div>
          <div className="text-zinc-300">
            {PROJECT_TYPE_LABELS[result.projectType]}
          </div>
          <div className="text-zinc-500">视觉风格</div>
          <div className="text-zinc-300">{result.visualStyle}</div>
          <div className="text-zinc-500">目标受众</div>
          <div className="text-zinc-300">{result.targetAudience}</div>
          <div className="text-zinc-500">生成时间</div>
          <div className="text-zinc-300">
            {new Date(result.createdAt).toLocaleString("zh-CN")}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualTab({
  result,
  output,
}: {
  result: CreativeResult;
  output?: AgentOutput;
}) {
  return (
    <div className="space-y-4">
      {/* Visual Keywords */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">🔑 视觉关键词</h3>
        <div className="flex flex-wrap gap-1.5">
          {result.visualKeywords.map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">🎨 配色方案</h3>
        <div className="flex gap-2 mb-3">
          {result.colorPalette.hexCodes.map((hex, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className="w-full aspect-square rounded-lg border border-zinc-600 mb-1"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[10px] text-zinc-400">
                {result.colorPalette.names[i]}
              </span>
              <br />
              <span className="text-[10px] text-zinc-500">{hex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Composition */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">📐 构图建议</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {result.compositionAdvice}
        </p>
      </div>

      {output?.content && (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">📝 视觉智能体完整输出</h3>
          <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {output.content}
          </div>
        </div>
      )}
    </div>
  );
}

function PromptTab({ output }: { output?: AgentOutput }) {
  const [copiedCN, setCopiedCN] = useState(false);
  const [copiedEN, setCopiedEN] = useState(false);

  const copyText = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!output?.data) return null;
  const promptCN = output.data.promptCN as string;
  const promptEN = output.data.promptEN as string;

  return (
    <div className="space-y-4">
      {/* 中文提示词 */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-200">
            🇨🇳 中文提示词
          </h3>
          <button
            onClick={() => copyText(promptCN, setCopiedCN)}
            className="text-xs px-2 py-1 rounded-md bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copiedCN ? "✓ 已复制" : "📋 复制"}
          </button>
        </div>
        <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30 font-mono text-xs max-h-64 overflow-y-auto">
          {promptCN}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          适配工具：即梦 / 通义万相 / 文心一言
        </p>
      </div>

      {/* 英文提示词 */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-200">
            🌍 英文提示词
          </h3>
          <button
            onClick={() => copyText(promptEN, setCopiedEN)}
            className="text-xs px-2 py-1 rounded-md bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copiedEN ? "✓ Copied" : "📋 Copy"}
          </button>
        </div>
        <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30 font-mono text-xs max-h-64 overflow-y-auto">
          {promptEN}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          Compatible: Midjourney / Stable Diffusion / DALL-E / ComfyUI
        </p>
      </div>
    </div>
  );
}

function ReviewTab({
  result,
  output,
}: {
  result: CreativeResult;
  output?: AgentOutput;
}) {
  const review = result.review;

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">综合评分</h3>
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-cyan-500/50 bg-cyan-500/10">
          <span className="text-3xl font-bold text-cyan-400">
            {review.overallScore}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-2">满分 100 分</p>
      </div>

      {/* Reviews */}
      {[
        { title: "🎨 美学分析", content: review.aesthetics },
        { title: "📢 传播效果", content: review.communication },
        { title: "⚙️ 可执行性", content: review.feasibility },
        { title: "💼 专业表达", content: review.professionalism },
      ].map((item) => (
        <div
          key={item.title}
          className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {item.content}
          </p>
        </div>
      ))}

      {/* Suggestions */}
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          💡 优化建议
        </h3>
        <ul className="space-y-2">
          {review.suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-zinc-400"
            >
              <span className="text-cyan-400 mt-0.5 flex-shrink-0">▸</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PortfolioTab({ result }: { result: CreativeResult }) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          📁 作品集展示建议
        </h3>
        <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
          {result.portfolioNotes}
        </div>
      </div>
    </div>
  );
}

function AgentOutputTab({ output }: { output?: AgentOutput }) {
  if (!output?.content) {
    return (
      <div className="text-sm text-zinc-500 p-4">暂无数据</div>
    );
  }
  return (
    <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
      <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
        {output.content}
      </div>
    </div>
  );
}
