"use client";

// ============================================================
// ChatMessage - 聊天消息气泡
// 用户消息靠右，智能体消息靠左，带头像和状态
// ============================================================

import { useState } from "react";
import { PROJECT_TYPE_LABELS, VISUAL_STYLE_LABELS } from "@/types/creative";
import type { AgentType, ProjectType, VisualStyle } from "@/types/creative";
import { KnowledgeSources } from "@/components/knowledge-sources";
import type { KnowledgeSource } from "@/types/knowledge";

interface Message {
  id: string;
  role: "user" | "agent";
  agentType?: AgentType;
  agentName?: string;
  content: string;
  cardData?: Record<string, unknown>;
  status: "complete" | "streaming" | "pending";
  timestamp: number;
  resultId?: string;
  knowledgeSources?: KnowledgeSource[];
}

const AGENT_CONFIG: Record<
  string,
  { icon: string; color: string; bgClass: string; borderClass: string }
> = {
  strategy: {
    icon: "\u{1F9E0}",
    color: "text-amber-400",
    bgClass: "bg-amber-500/5",
    borderClass: "border-amber-500/20",
  },
  visual: {
    icon: "\u{1F3A8}",
    color: "text-purple-400",
    bgClass: "bg-purple-500/5",
    borderClass: "border-purple-500/20",
  },
  prompt: {
    icon: "✨",
    color: "text-cyan-400",
    bgClass: "bg-cyan-500/5",
    borderClass: "border-cyan-500/20",
  },
  review: {
    icon: "\u{1F50D}",
    color: "text-emerald-400",
    bgClass: "bg-emerald-500/5",
    borderClass: "border-emerald-500/20",
  },
};

function getConfig(agentType?: string) {
  return AGENT_CONFIG[agentType || "strategy"] || AGENT_CONFIG.strategy;
}

export function ChatMessage({ message }: { message: Message }) {
  const { role, agentType, agentName, content, cardData, status } = message;

  // ---- User message ----
  if (role === "user") {
    const projectTypeLabel = cardData?.projectType
      ? (PROJECT_TYPE_LABELS[cardData.projectType as ProjectType] ??
        String(cardData.projectType))
      : null;

    const visualStyleLabel = cardData?.visualStyle
      ? (VISUAL_STYLE_LABELS[cardData.visualStyle as VisualStyle] ??
        String(cardData.visualStyle))
      : null;

    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%]">
          {cardData && (
            <div className="flex flex-wrap gap-1.5 justify-end mb-2">
              {projectTypeLabel && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-400">
                  {projectTypeLabel}
                </span>
              )}
              {visualStyleLabel && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-400">
                  {visualStyleLabel}
                </span>
              )}
            </div>
          )}

          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 rounded-2xl rounded-tr-md px-4 py-3">
            <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-xs flex-shrink-0 ring-1 ring-zinc-600">
          U
        </div>
      </div>
    );
  }

  // ---- Agent message ----
  const cfg = getConfig(agentType);
  const reviewData = cardData?.review as
    | Record<string, unknown>
    | undefined;
  const score = reviewData?.overallScore as number | undefined;

  return (
    <div className="flex gap-3">
      {/* Agent avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ring-1 transition-all duration-500 ${
          status === "streaming"
            ? "ring-cyan-400/50 bg-cyan-500/20 animate-pulse"
            : status === "pending"
              ? "ring-zinc-700 bg-zinc-800 opacity-40"
              : `ring-zinc-700 ${cfg.bgClass}`
        }`}
      >
        {status === "streaming" ? (
          <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        ) : status === "pending" ? (
          <span className="opacity-30">{cfg.icon}</span>
        ) : (
          cfg.icon
        )}
      </div>

      <div className="max-w-[85%] min-w-0">
        {/* Agent name & status */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-medium ${cfg.color}`}>
            {agentName}
          </span>
          {status === "streaming" && (
            <span className="text-[10px] text-cyan-400 animate-pulse">
              正在思考...
            </span>
          )}
          {status === "pending" && (
            <span className="text-[10px] text-zinc-600">等待中</span>
          )}
        </div>

        {/* Message content */}
        {status === "pending" ? (
          <PendingBubble />
        ) : (
          <div
            className={`rounded-2xl rounded-tl-md border px-4 py-3 ${cfg.bgClass} ${cfg.borderClass}`}
          >
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {content || "暂无输出"}
            </div>

            {/* Review score badge */}
            {agentType === "review" && score != null && (
              <div className="mt-3 flex items-center gap-2">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    score >= 85
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-yellow-500/50 bg-yellow-500/10"
                  }`}
                >
                  <span className="text-lg font-bold text-emerald-400">
                    {score}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">综合评分 / 100</span>
              </div>
            )}
          </div>
        )}

        {/* Copy buttons for prompt agent */}
        {agentType === "prompt" && status === "complete" && cardData && (
          <CopyPromptButtons cardData={cardData} />
        )}

        {/* Knowledge sources */}
        {message.knowledgeSources &&
          message.knowledgeSources.length > 0 && (
            <KnowledgeSources sources={message.knowledgeSources} />
          )}
      </div>
    </div>
  );
}

function PendingBubble() {
  return (
    <div className="rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-700"
            style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

/** 提示词复制按钮 */
function CopyPromptButtons({
  cardData,
}: {
  cardData: Record<string, unknown>;
}) {
  const [copiedCN, setCopiedCN] = useState(false);
  const [copiedEN, setCopiedEN] = useState(false);

  const copyCN = async () => {
    if (cardData.promptCN) {
      await navigator.clipboard.writeText(cardData.promptCN as string);
      setCopiedCN(true);
      setTimeout(() => setCopiedCN(false), 2000);
    }
  };

  const copyEN = async () => {
    if (cardData.promptEN) {
      await navigator.clipboard.writeText(cardData.promptEN as string);
      setCopiedEN(true);
      setTimeout(() => setCopiedEN(false), 2000);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={copyCN}
        className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
      >
        {copiedCN ? "✓ 已复制" : "📋 复制中文提示词"}
      </button>
      <button
        onClick={copyEN}
        className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
      >
        {copiedEN ? "✓ Copied" : "📋 Copy EN Prompt"}
      </button>
    </div>
  );
}
