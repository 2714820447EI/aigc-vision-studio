// ============================================================
// AIGC Vision Studio - Obsidian Vault Reader
// 读取本地 Obsidian Vault 中的 Markdown 文件
// 提取标题、frontmatter、标签、摘要、正文
// 仅在服务器端运行
// ============================================================

import "server-only";
import fs from "fs";
import path from "path";
import type { KnowledgeNote, KnowledgeStatus } from "@/types/knowledge";

/** 内存缓存：避免每次请求都重新扫描 */
let noteCache: KnowledgeNote[] | null = null;
let lastScanTime: string | null = null;
let cacheVaultPath: string | null = null;

/**
 * 获取 vault 路径
 */
function getVaultPath(): string {
  return process.env.OBSIDIAN_VAULT_PATH || "";
}

/**
 * 解析 YAML frontmatter
 * 简单实现，处理 --- 分隔的标准 frontmatter
 */
function parseFrontmatter(
  content: string
): {
  frontmatter: Record<string, string | string[]>;
  bodyStart: number;
} {
  const frontmatter: Record<string, string | string[]> = {};
  let bodyStart = 0;

  // 检查是否以 --- 开头
  const lines = content.split("\n");
  if (lines[0]?.trim() === "---") {
    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        endIndex = i;
        break;
      }
    }

    if (endIndex > 0) {
      const fmLines = lines.slice(1, endIndex);
      for (const line of fmLines) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim();
          let value: string | string[] = line.slice(colonIndex + 1).trim();

          // 处理引号包裹的值
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          // 处理 YAML 列表格式（下一行以 - 开头）
          if (value === "" && endIndex + 1 < lines.length) {
            const listItems: string[] = [];
            let j = endIndex + 1;
            while (j < lines.length && lines[j].trim().startsWith("- ")) {
              listItems.push(lines[j].trim().slice(2));
              j++;
            }
            if (listItems.length > 0) {
              frontmatter[key] = listItems;
              continue;
            }
          }

          // 处理方括号列表 [a, b, c]
          if (value.startsWith("[") && value.endsWith("]")) {
            const inner = value.slice(1, -1);
            frontmatter[key] = inner
              .split(",")
              .map((s) => s.trim().replace(/['"]/g, ""));
          } else {
            frontmatter[key] = value;
          }
        }
      }
      bodyStart = endIndex + 1;
    }
  }

  return { frontmatter, bodyStart };
}

/**
 * 提取标签
 * 从 frontmatter.tags 和正文中的 #tag 提取
 */
function extractTags(
  content: string,
  frontmatter: Record<string, string | string[]>,
  bodyStart: number
): string[] {
  const tags = new Set<string>();

  // 从 frontmatter 提取
  const fmTags = frontmatter.tags;
  if (Array.isArray(fmTags)) {
    fmTags.forEach((t) => tags.add(t.toLowerCase()));
  } else if (typeof fmTags === "string") {
    tags.add(fmTags.toLowerCase());
  }

  // 从正文中提取 #tag（排除代码块内的）
  const body = content.slice(bodyStart > 0 ? bodyStart : 0);
  // 简单移除代码块
  const cleanedBody = body.replace(/```[\s\S]*?```/g, "");
  const tagMatches = cleanedBody.match(/#([\w一-鿿\-/]+)/g);
  if (tagMatches) {
    tagMatches.forEach((t) => {
      const tag = t.slice(1).toLowerCase();
      // 过滤掉纯数字和太短的标签
      if (tag.length >= 2 && !/^\d+$/.test(tag)) {
        tags.add(tag);
      }
    });
  }

  return Array.from(tags);
}

/**
 * 提取标题
 * 优先级：frontmatter.title > 首个 # 标题 > 文件名
 */
function extractTitle(
  content: string,
  frontmatter: Record<string, string | string[]>,
  filePath: string
): string {
  const fmTitle = frontmatter.title;
  if (typeof fmTitle === "string" && fmTitle) return fmTitle;

  // 找首个 # 标题
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)/);
    if (match) return match[1].trim();
  }

  // fallback: 文件名
  return path.basename(filePath, ".md");
}

/**
 * 生成摘要（前 300 字）
 */
function generateSummary(content: string, bodyStart: number): string {
  const body = content.slice(bodyStart > 0 ? bodyStart : 0);
  // 移除 Markdown 格式符号
  const plainText = body
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/---+/g, "")
    .replace(/>\s+/g, "")
    .trim();

  const summary = plainText.slice(0, 300).replace(/\n+/g, " ");
  return summary.length >= 300 ? summary + "..." : summary;
}

/**
 * 生成唯一 ID
 */
function generateId(filePath: string): string {
  const hash = Buffer.from(filePath).toString("base64").slice(0, 12);
  return `note-${hash}`;
}

/**
 * 扫描单个 Markdown 文件
 */
function scanFile(filePath: string, vaultRoot: string): KnowledgeNote | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    if (!content.trim()) return null;

    const { frontmatter, bodyStart } = parseFrontmatter(content);
    const relativePath = path.relative(vaultRoot, filePath);
    const title = extractTitle(content, frontmatter, relativePath);
    const tags = extractTags(content, frontmatter, bodyStart);
    const summary = generateSummary(content, bodyStart);
    const stat = fs.statSync(filePath);

    return {
      id: generateId(relativePath),
      title,
      path: relativePath,
      tags,
      frontmatter,
      summary,
      content,
      updatedAt: stat.mtime.toISOString(),
    };
  } catch (err) {
    console.error(`[Obsidian] Failed to scan ${filePath}:`, err);
    return null;
  }
}

/**
 * 递归扫描 vault 目录下的所有 .md 文件
 */
function scanDirectory(dirPath: string, vaultRoot: string): KnowledgeNote[] {
  const notes: KnowledgeNote[] = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // 跳过隐藏文件和常见非笔记目录
      if (entry.name.startsWith(".")) continue;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // 跳过 .obsidian 和常见附件目录
        if (
          entry.name === ".obsidian" ||
          entry.name === ".trash" ||
          entry.name === "assets" ||
          entry.name === "attachments"
        ) {
          continue;
        }
        notes.push(...scanDirectory(fullPath, vaultRoot));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const note = scanFile(fullPath, vaultRoot);
        if (note) notes.push(note);
      }
    }
  } catch (err) {
    console.error(`[Obsidian] Failed to scan directory ${dirPath}:`, err);
  }

  return notes;
}

/**
 * 扫描 Obsidian Vault
 * 返回缓存结果或重新扫描
 */
export function scanVault(forceRescan = false): {
  success: boolean;
  notes: KnowledgeNote[];
  status: KnowledgeStatus;
  error?: string;
} {
  const vaultPath = getVaultPath();

  // 未配置路径
  if (!vaultPath || vaultPath.trim() === "") {
    return {
      success: false,
      notes: [],
      status: {
        connected: false,
        vaultPath: "",
        noteCount: 0,
        lastScannedAt: null,
        tagsCount: 0,
      },
      error: "未配置 OBSIDIAN_VAULT_PATH 环境变量",
    };
  }

  // 路径不存在
  if (!fs.existsSync(vaultPath)) {
    return {
      success: false,
      notes: [],
      status: {
        connected: false,
        vaultPath,
        noteCount: 0,
        lastScannedAt: null,
        tagsCount: 0,
      },
      error: `Vault 路径不存在: ${vaultPath}`,
    };
  }

  // 使用缓存（相同路径且未强制重新扫描）
  if (
    !forceRescan &&
    noteCache &&
    lastScanTime &&
    cacheVaultPath === vaultPath
  ) {
    const allTags = new Set<string>();
    noteCache.forEach((n) => n.tags.forEach((t) => allTags.add(t)));

    return {
      success: true,
      notes: noteCache,
      status: {
        connected: true,
        vaultPath,
        noteCount: noteCache.length,
        lastScannedAt: lastScanTime,
        tagsCount: allTags.size,
      },
    };
  }

  // 扫描
  try {
    const notes = scanDirectory(vaultPath, vaultPath);
    noteCache = notes;
    lastScanTime = new Date().toISOString();
    cacheVaultPath = vaultPath;

    const allTags = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => allTags.add(t)));

    return {
      success: true,
      notes,
      status: {
        connected: true,
        vaultPath,
        noteCount: notes.length,
        lastScannedAt: lastScanTime,
        tagsCount: allTags.size,
      },
    };
  } catch (err) {
    return {
      success: false,
      notes: [],
      status: {
        connected: false,
        vaultPath,
        noteCount: 0,
        lastScannedAt: null,
        tagsCount: 0,
      },
      error: `扫描失败: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * 获取笔记缓存（不重新扫描）
 */
export function getCachedNotes(): KnowledgeNote[] {
  return noteCache || [];
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  noteCache = null;
  lastScanTime = null;
  cacheVaultPath = null;
}
