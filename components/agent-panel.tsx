"use client";

// ============================================================
// AgentPanel - 智能体协作流程面板
// 显示 4 个智能体的工作状态和进度
// ============================================================

import type { AgentInfo, AgentStatus } from "@/types/creative";

const AGENTS: AgentInfo[] = [
  {
    type: "strategy",
    name: "策划智能体",
    icon: "🧠",
    description: "分析主题、受众、传播目标",
  },
  {
    type: "visual",
    name: "视觉智能体",
    icon: "🎨",
    description: "视觉关键词、配色、构图",
  },
  {
    type: "prompt",
    name: "提示词智能体",
    icon: "✨",
    description: "生成 AI 生图提示词",
  },
  {
    type: "review",
    name: "评审智能体",
    icon: "🔍",
    description: "方案评估与优化建议",
  },
];

interface AgentPanelProps {
  /** 当前正在运行的智能体类型 */
  activeAgent: string | null;
  /** 已完成的智能体类型列表 */
  completedAgents: string[];
  /** 是否正在生成 */
  isGenerating: boolean;
}

export function AgentPanel({
  activeAgent,
  completedAgents,
  isGenerating,
}: AgentPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isGenerating ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
          }`}
        />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {isGenerating ? "智能体协作中..." : "智能体就绪"}
        </span>
      </div>

      <div className="space-y-2">
        {AGENTS.map((agent, index) => {
          const isActive = activeAgent === agent.type;
          const isCompleted = completedAgents.includes(agent.type);
          const isPending =
            isGenerating && !isActive && !isCompleted;

          return (
            <div
              key={agent.type}
              className={`relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isPending
                  ? "border-zinc-700/50 bg-zinc-800/30 opacity-50"
                  : "border-zinc-700/50 bg-zinc-800/20"
              }`}
            >
              {/* 连接线 */}
              {index < AGENTS.length - 1 && (
                <div
                  className={`absolute left-[26px] top-12 w-0.5 h-5 -translate-x-1/2 transition-colors duration-500 ${
                    isCompleted ? "bg-emerald-500/40" : "bg-zinc-700/40"
                  }`}
                />
              )}

              {/* 图标/状态 */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-500/20 ring-1 ring-cyan-400/50 scale-110"
                    : isCompleted
                    ? "bg-emerald-500/20 ring-1 ring-emerald-400/50"
                    : "bg-zinc-800 ring-1 ring-zinc-700"
                }`}
              >
                {isActive ? (
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : isCompleted ? (
                  <span className="text-emerald-400 text-xs">✓</span>
                ) : (
                  <span className="opacity-50">{agent.icon}</span>
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-cyan-300"
                        : isCompleted
                        ? "text-emerald-300"
                        : "text-zinc-400"
                    }`}
                  >
                    {agent.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium animate-pulse">
                      RUNNING
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      DONE
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {agent.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
