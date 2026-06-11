// ============================================================
// AIGC Vision Studio - Knowledge Search Engine
// 基于关键词匹配的检索（后续可升级为向量检索）
// ============================================================

import type { KnowledgeNote, SearchResult } from "@/types/knowledge";

/**
 * 分词：简单的中文/英文分词
 */
function tokenize(text: string): string[] {
  // 英文：按空格和标点分词
  // 中文：按单字 + 2-gram 组合分词
  const cleaned = text.toLowerCase().replace(/[^\w一-鿿\s]/g, " ");
  const tokens: string[] = [];

  // 英文词
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2);
  tokens.push(...words);

  // 中文 2-gram
  const chineseChars = cleaned.replace(/[^一-鿿]/g, "");
  for (let i = 0; i < chineseChars.length - 1; i++) {
    tokens.push(chineseChars.slice(i, i + 2));
  }
  // 单个中文字
  for (const char of chineseChars) {
    tokens.push(char);
  }

  return tokens;
}

/**
 * 计算查询与笔记的相关性得分
 */
function calculateRelevance(
  query: string,
  note: KnowledgeNote
): { score: number; snippets: string[] } {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return { score: 0, snippets: [] };

  // 标题匹配权重
  const titleLower = note.title.toLowerCase();
  let titleHits = 0;
  for (const token of queryTokens) {
    if (titleLower.includes(token)) titleHits++;
  }
  const titleScore = titleHits / queryTokens.length;

  // 标签匹配
  let tagHits = 0;
  for (const tag of note.tags) {
    for (const token of queryTokens) {
      if (tag.includes(token)) tagHits++;
    }
  }
  const tagScore = Math.min(tagHits / Math.max(queryTokens.length, 1), 1);

  // 正文匹配
  const contentLower = note.content.toLowerCase();
  const bodyTokens = tokenize(contentLower);
  let bodyHits = 0;
  for (const qToken of queryTokens) {
    if (bodyTokens.some((bToken) => bToken.includes(qToken))) {
      bodyHits++;
    }
  }
  const bodyScore = bodyHits / queryTokens.length;

  // 摘要匹配
  const summaryLower = note.summary.toLowerCase();
  let summaryHits = 0;
  for (const token of queryTokens) {
    if (summaryLower.includes(token)) summaryHits++;
  }
  const summaryScore = summaryHits / queryTokens.length;

  // 综合得分：标题 0.4 + 标签 0.2 + 正文 0.25 + 摘要 0.15
  const score =
    titleScore * 0.4 +
    tagScore * 0.2 +
    bodyScore * 0.25 +
    summaryScore * 0.15;

  // 提取相关片段
  const snippets = extractSnippets(note.content, queryTokens, 3);

  return { score, snippets };
}

/**
 * 从笔记正文中提取与查询相关的片段
 */
function extractSnippets(
  content: string,
  queryTokens: string[],
  maxSnippets: number
): string[] {
  const snippets: string[] = [];
  const paragraphs = content.split(/\n\n+/);

  // 移除 YAML frontmatter 和代码块
  const cleanParagraphs = paragraphs.filter(
    (p) =>
      !p.startsWith("---") &&
      !p.startsWith("```") &&
      p.trim().length > 0
  );

  for (const para of cleanParagraphs) {
    const paraLower = para.toLowerCase();
    let hitCount = 0;
    for (const token of queryTokens) {
      if (paraLower.includes(token)) hitCount++;
    }

    if (hitCount > 0) {
      // 截取段落片段（最多 200 字）
      let snippet = para.trim();
      // 去除 markdown 格式
      snippet = snippet
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();

      if (snippet.length > 200) {
        snippet = snippet.slice(0, 200) + "...";
      }

      snippets.push(snippet);

      if (snippets.length >= maxSnippets) break;
    }
  }

  return snippets;
}

/**
 * 搜索知识库
 */
export function searchKnowledge(
  query: string,
  notes: KnowledgeNote[],
  options?: {
    maxResults?: number;
    filterTags?: string[];
    minRelevance?: number;
  }
): SearchResult[] {
  const maxResults = options?.maxResults || 10;
  const filterTags = options?.filterTags || [];
  const minRelevance = options?.minRelevance || 0.05;

  let results: SearchResult[] = [];

  for (const note of notes) {
    // 标签过滤
    if (filterTags.length > 0) {
      const hasMatchingTag = filterTags.some((ft) =>
        note.tags.some((t) => t.includes(ft.toLowerCase()))
      );
      if (!hasMatchingTag) continue;
    }

    const { score, snippets } = calculateRelevance(query, note);

    if (score >= minRelevance) {
      results.push({
        note,
        snippets,
        relevance: score,
      });
    }
  }

  // 按相关性排序
  results.sort((a, b) => b.relevance - a.relevance);

  // 限制结果数
  return results.slice(0, maxResults);
}

/**
 * 获取知识库中所有标签
 */
export function getAllTags(notes: KnowledgeNote[]): {
  tag: string;
  count: number;
}[] {
  const tagCount = new Map<string, number>();
  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 根据查询提取知识来源引用
 * 用于在生成方案时附加到结果中
 */
export function getKnowledgeSources(
  query: string,
  notes: KnowledgeNote[],
  agentType: "strategy" | "visual" | "prompt" | "review"
): {
  noteTitle: string;
  notePath: string;
  tags: string[];
  snippet: string;
  usedBy: typeof agentType;
}[] {
  const searchResults = searchKnowledge(query, notes, {
    maxResults: 3,
    minRelevance: 0.1,
  });

  return searchResults.map((r) => ({
    noteTitle: r.note.title,
    notePath: r.note.path,
    tags: r.note.tags,
    snippet: r.snippets[0] || r.note.summary,
    usedBy: agentType,
  }));
}
