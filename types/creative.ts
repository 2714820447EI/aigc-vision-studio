// ============================================================
// AIGC Vision Studio - Type Definitions
// ============================================================

/** 项目类型 */
export type ProjectType =
  | "brand-visual"
  | "poster-design"
  | "cultural-tourism"
  | "ip-character"
  | "package-design";

/** 视觉风格 */
export type VisualStyle =
  | "minimalist"
  | "tech-futuristic"
  | "chinese-ink"
  | "pop-art"
  | "retro-vintage"
  | "nature-organic";

/** 目标受众 */
export type TargetAudience =
  | "gen-z"
  | "millennials"
  | "professionals"
  | "families"
  | "students"
  | "luxury";

/** 智能体类型 */
export type AgentType = "strategy" | "visual" | "prompt" | "review";

/** 智能体状态 */
export type AgentStatus = "idle" | "running" | "completed" | "error";

/** 项目类型标签映射 */
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  "brand-visual": "品牌视觉",
  "poster-design": "海报设计",
  "cultural-tourism": "文旅宣传",
  "ip-character": "IP 形象",
  "package-design": "包装设计",
};

export const VISUAL_STYLE_LABELS: Record<VisualStyle, string> = {
  minimalist: "极简主义",
  "tech-futuristic": "科技未来感",
  "chinese-ink": "中国水墨风",
  "pop-art": "波普艺术",
  "retro-vintage": "复古怀旧",
  "nature-organic": "自然有机",
};

export const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
  "gen-z": "Z 世代 (15-25)",
  millennials: "千禧一代 (26-40)",
  professionals: "职场精英",
  families: "家庭用户",
  students: "在校学生",
  luxury: "高端消费群体",
};

/** 智能体定义 */
export interface AgentInfo {
  type: AgentType;
  name: string;
  icon: string;
  description: string;
}

/** 单个智能体输出 */
export interface AgentOutput {
  agentType: AgentType;
  content: string;
  /** 结构化数据 */
  data?: Record<string, unknown>;
}

/** 视觉方案完整结果 */
export interface CreativeResult {
  id: string;
  /** 项目主题 */
  topic: string;
  /** 项目类型 */
  projectType: ProjectType;
  /** 视觉风格 */
  visualStyle: VisualStyle;
  /** 目标受众 */
  targetAudience: TargetAudience;
  /** 创建时间 */
  createdAt: string;
  /** 各智能体输出 */
  agentOutputs: AgentOutput[];
  /** 方案摘要 */
  summary: string;
  /** 创意概念 */
  creativeConcept: string;
  /** 目标用户画像 */
  targetUser: string;
  /** 视觉关键词 */
  visualKeywords: string[];
  /** 配色方案 */
  colorPalette: ColorPalette;
  /** 构图建议 */
  compositionAdvice: string;
  /** 中文提示词 */
  promptCN: string;
  /** 英文提示词 */
  promptEN: string;
  /** 方案评审 */
  review: ReviewResult;
  /** 作品集展示说明 */
  portfolioNotes: string;
  /** 知识库引用来源（可选） */
  knowledgeRefs?: import("./knowledge").KnowledgeReference;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  names: string[];
  hexCodes: string[];
}

export interface ReviewResult {
  aesthetics: string;
  communication: string;
  feasibility: string;
  professionalism: string;
  suggestions: string[];
  overallScore: number;
}

/** API 请求 */
export interface GenerateRequest {
  topic: string;
  projectType: ProjectType;
  visualStyle: VisualStyle;
  targetAudience: TargetAudience;
}

/** API 响应 */
export interface GenerateResponse {
  success: boolean;
  data?: CreativeResult;
  error?: string;
}
