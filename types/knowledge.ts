// ============================================================
// AIGC Vision Studio - Knowledge Base Type Definitions
// Obsidian Vault 知识库相关类型
// ============================================================

/** 知识库笔记 */
export interface KnowledgeNote {
  id: string;
  /** 笔记标题（从 # 标题或文件名推断） */
  title: string;
  /** 相对于 vault 根目录的路径 */
  path: string;
  /** 标签（从 frontmatter tags 或 #tag 提取） */
  tags: string[];
  /** YAML frontmatter 解析结果 */
  frontmatter: Record<string, string | string[]>;
  /** 正文摘要（前 300 字） */
  summary: string;
  /** 完整正文内容 */
  content: string;
  /** 文件修改时间 */
  updatedAt?: string;
}

/** 知识库状态 */
export interface KnowledgeStatus {
  connected: boolean;
  vaultPath: string;
  noteCount: number;
  lastScannedAt: string | null;
  tagsCount: number;
}

/** 检索结果 */
export interface SearchResult {
  note: KnowledgeNote;
  /** 匹配的相关片段 */
  snippets: string[];
  /** 相关性得分 (0-1) */
  relevance: number;
}

/** 扫描 API 响应 */
export interface ScanResponse {
  success: boolean;
  status: KnowledgeStatus;
  notes?: KnowledgeNote[];
  error?: string;
}

/** 搜索 API 请求 */
export interface SearchRequest {
  query: string;
  /** 最大返回结果数 */
  maxResults?: number;
  /** 按标签过滤 */
  filterTags?: string[];
}

/** 搜索 API 响应 */
export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  totalFound: number;
  error?: string;
}

/** 生成方案时附带的知识来源引用 */
export interface KnowledgeSource {
  noteTitle: string;
  notePath: string;
  tags: string[];
  /** 引用的相关片段 */
  snippet: string;
  /** 被哪个智能体引用 */
  usedBy: "strategy" | "visual" | "prompt" | "review";
}

/** 扩展 CreativeResult，加入知识来源 */
export interface KnowledgeReference {
  sources: KnowledgeSource[];
  queryUsed: string;
  totalNotesScanned: number;
}
