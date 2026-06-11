"use client";

// ============================================================
// AIGC Vision Studio - 灵感工坊 对话式主页面
// 纯前端离线运行，无需网络请求
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { HistoryList } from "@/components/history-list";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { KnowledgePanel } from "@/components/knowledge-panel";
import { generateMockResult } from "@/lib/mock-data";
import type {
  ProjectType,
  VisualStyle,
  TargetAudience,
  CreativeResult,
  AgentType,
} from "@/types/creative";
import type { KnowledgeSource } from "@/types/knowledge";

const AGENT_SEQUENCE: AgentType[] = ["strategy", "visual", "prompt", "review"];

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<CreativeResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"history" | "knowledge">("history");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aigc-vision-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("aigc-vision-history", JSON.stringify(history));
    }
  }, [history]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  }, []);

  const updateMessage = useCallback(
    (id: string, updates: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  const handleSend = useCallback(
    async (params: {
      topic: string;
      projectType: ProjectType;
      visualStyle: VisualStyle;
      targetAudience: TargetAudience;
    }) => {
      if (isGenerating) return;
      setIsGenerating(true);

      // 1. User message
      addMessage({
        role: "user",
        content: params.topic,
        status: "complete",
        cardData: {
          topic: params.topic,
          projectType: params.projectType,
          visualStyle: params.visualStyle,
          targetAudience: params.targetAudience,
        },
      });

      // 2. Pending agent messages
      const agentMsgs: Message[] = AGENT_SEQUENCE.map((type, i) => {
        const names: Record<string, string> = {
          strategy: "策划智能体",
          visual: "视觉智能体",
          prompt: "提示词智能体",
          review: "评审智能体",
        };
        return addMessage({
          role: "agent",
          agentType: type,
          agentName: names[type],
          content: "",
          status: i === 0 ? "streaming" : "pending",
        });
      });

      // 3. Animate agent workflow
      for (let i = 0; i < AGENT_SEQUENCE.length; i++) {
        if (i > 0) {
          updateMessage(agentMsgs[i - 1].id, { status: "complete" });
          updateMessage(agentMsgs[i].id, { status: "streaming" });
        }
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
      }

      // 4. Generate result locally (no network)
      try {
        const result = generateMockResult(
          params.topic,
          params.projectType,
          params.visualStyle,
          params.targetAudience
        );

        setSelectedId(result.id);
        setHistory((prev) => [result, ...prev].slice(0, 20));

        // Build knowledge source lookup by agent type
        const sourcesByAgent = new Map<string, KnowledgeSource[]>();
        result.knowledgeRefs?.sources.forEach((s) => {
          const list = sourcesByAgent.get(s.usedBy) || [];
          list.push(s);
          sourcesByAgent.set(s.usedBy, list);
        });

        // Update agent messages with content + knowledge sources
        result.agentOutputs.forEach((output) => {
          const msg = agentMsgs.find(
            (m) => m.agentType === output.agentType
          );
          if (msg) {
            updateMessage(msg.id, {
              content: output.content,
              cardData: output.data,
              status: "complete",
              resultId: result.id,
              knowledgeSources: sourcesByAgent.get(output.agentType) || [],
            });
          }
        });
      } catch (error) {
        console.error("Generate error:", error);
        agentMsgs.forEach((m) =>
          updateMessage(m.id, {
            content: "生成失败，请重试",
            status: "complete",
          })
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, addMessage, updateMessage]
  );

  const handleSelectHistory = useCallback(
    (item: CreativeResult) => {
      setSelectedId(item.id);
      setMessages([]);

      setTimeout(() => {
        addMessage({
          role: "user",
          content: item.topic,
          status: "complete",
          cardData: {
            topic: item.topic,
            projectType: item.projectType,
            visualStyle: item.visualStyle,
            targetAudience: item.targetAudience,
          },
        });

        const sourcesByAgent = new Map<string, KnowledgeSource[]>();
        item.knowledgeRefs?.sources.forEach((s) => {
          const list = sourcesByAgent.get(s.usedBy) || [];
          list.push(s);
          sourcesByAgent.set(s.usedBy, list);
        });

        item.agentOutputs.forEach((output) => {
          const names: Record<string, string> = {
            strategy: "策划智能体",
            visual: "视觉智能体",
            prompt: "提示词智能体",
            review: "评审智能体",
          };
          addMessage({
            role: "agent",
            agentType: output.agentType,
            agentName: names[output.agentType],
            content: output.content,
            cardData: output.data,
            status: "complete",
            resultId: item.id,
            knowledgeSources: sourcesByAgent.get(output.agentType) || [],
          });
        });
      }, 50);
    },
    [addMessage]
  );

  const handleClearHistory = useCallback(() => {
    if (window.confirm("确定要清空所有历史方案吗？")) {
      setHistory([]);
      localStorage.removeItem("aigc-vision-history");
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSelectedId(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* ========== Header ========== */}
      <header className="flex-shrink-0 h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
            aria-label="菜单"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-zinc-100 leading-tight">
                AIGC Vision Studio
              </h1>
              <p className="text-[10px] text-zinc-500 leading-tight">
                灵感工坊 · 视觉创意智能体平台
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700/50"
            >
              + 新对话
            </button>
          )}
          <span className="text-[10px] text-zinc-600 hidden sm:inline">
            离线模式
          </span>
        </div>
      </header>

      {/* ========== Body ========== */}
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ---- Left Sidebar ---- */}
        <aside
          className={`flex-shrink-0 w-72 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 z-40 ${
            sidebarOpen ? "fixed inset-y-0 left-0 lg:relative lg:inset-auto" : "hidden lg:flex"
          }`}
        >
          <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 lg:hidden">
            <span className="text-sm font-medium text-zinc-300">菜单</span>
            <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-zinc-800">
            {(["history", "knowledge"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === tab
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab === "history" ? "📋 历史方案" : "📚 知识库"}
              </button>
            ))}
          </div>

          {sidebarTab === "history" ? (
            <div className="flex-1 overflow-hidden flex flex-col p-4">
              <div className="flex-1 overflow-y-auto">
                <HistoryList
                  history={history}
                  onSelect={(item) => { handleSelectHistory(item); setSidebarOpen(false); }}
                  selectedId={selectedId}
                  onClear={handleClearHistory}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <KnowledgePanel />
            </div>
          )}
        </aside>

        {/* ---- Main Chat Area ---- */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-cyan-500/20">
                  A
                </div>
                <h2 className="text-xl font-semibold text-zinc-200 mb-2">灵感工坊</h2>
                <p className="text-sm text-zinc-500 mb-2 text-center max-w-md">
                  描述你的视觉创意需求，AI 智能体将结合知识库协作生成完整方案
                </p>
                <p className="text-[10px] text-zinc-600 mb-6">
                  纯离线运行 · 无需网络 · 左侧可切换 📚 知识库
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {([
                    { text: "为校园咖啡品牌设计年轻化视觉", pt: "brand-visual" as ProjectType, vs: "tech-futuristic" as VisualStyle, ta: "gen-z" as TargetAudience },
                    { text: "设计一套国潮风文创海报", pt: "poster-design" as ProjectType, vs: "chinese-ink" as VisualStyle, ta: "gen-z" as TargetAudience },
                    { text: "为古镇做一套文旅宣传视觉", pt: "cultural-tourism" as ProjectType, vs: "nature-organic" as VisualStyle, ta: "millennials" as TargetAudience },
                  ]).map((hint) => (
                    <button
                      key={hint.text}
                      onClick={() => handleSend({ topic: hint.text, projectType: hint.pt, visualStyle: hint.vs, targetAudience: hint.ta })}
                      className="px-3 py-2 text-xs rounded-xl border border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors text-left"
                    >
                      {hint.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <ChatInput onSend={handleSend} isGenerating={isGenerating} />
        </div>
      </div>
    </div>
  );
}
