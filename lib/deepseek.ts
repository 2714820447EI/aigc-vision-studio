// ============================================================
// AIGC Vision Studio - DeepSeek API 封装
// 预留真实 API 调用逻辑，当前使用 Mock 数据
// ============================================================

import type {
  GenerateRequest,
  CreativeResult,
} from "@/types/creative";
import { generateMockResult } from "./mock-data";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * 调用 DeepSeek API 生成视觉创意方案
 * 当 DEEPSEEK_API_KEY 未配置时，自动使用 Mock 数据
 */
export async function generateCreativeVision(
  request: GenerateRequest
): Promise<CreativeResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  // 如果没有配置 API Key，使用 Mock 数据
  if (!apiKey || apiKey.trim() === "") {
    console.log("[DeepSeek] No API key configured, using mock data");
    // 模拟网络延迟，让智能体流程动画更自然
    await sleep(1200);
    return generateMockResult(
      request.topic,
      request.projectType,
      request.visualStyle,
      request.targetAudience
    );
  }

  // ---- 真实 DeepSeek API 调用 ----
  try {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(request);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from DeepSeek API");
    }

    // 解析 JSON 响应
    const parsed = JSON.parse(content);
    return {
      id: `AIGC-${Date.now()}`,
      ...parsed,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[DeepSeek] API call failed:", error);
    // 失败时回退到 Mock 数据
    console.log("[DeepSeek] Falling back to mock data");
    return generateMockResult(
      request.topic,
      request.projectType,
      request.visualStyle,
      request.targetAudience
    );
  }
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(): string {
  return `你是一个专业的 AIGC 视觉创意智能体系统。你需要根据用户的输入，模拟 4 个智能体协作，生成完整的视觉创意方案。

你需要以 JSON 格式返回以下内容：

{
  "summary": "项目摘要（200字以内）",
  "creativeConcept": "创意概念（100字以内）",
  "targetUser": "目标用户画像描述",
  "visualKeywords": ["关键词1", "关键词2", ...],
  "colorPalette": {
    "primary": "主色",
    "secondary": "辅色",
    "accent": "点缀色",
    "background": "背景色",
    "text": "文字色",
    "names": ["色名1", "色名2", ...],
    "hexCodes": ["#HEX1", "#HEX2", ...]
  },
  "compositionAdvice": "构图建议",
  "promptCN": "中文 AI 生图提示词",
  "promptEN": "英文 AI 生图提示词",
  "review": {
    "aesthetics": "美学分析",
    "communication": "传播效果分析",
    "feasibility": "可执行性分析",
    "professionalism": "专业表达分析",
    "suggestions": ["建议1", "建议2", ...],
    "overallScore": 85
  },
  "portfolioNotes": "作品集展示说明"
}

请确保返回的是有效的 JSON 格式。`;
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(request: GenerateRequest): string {
  return `请为以下项目生成完整的视觉创意方案：

项目主题：${request.topic}
项目类型：${request.projectType}
视觉风格：${request.visualStyle}
目标受众：${request.targetAudience}

请模拟4个智能体协作：
1. 策划智能体：分析主题、目标受众和创意概念
2. 视觉智能体：生成视觉关键词、配色方案和构图建议
3. 提示词智能体：生成中英文AI生图提示词
4. 评审智能体：从美学、传播效果、可执行性和专业表达角度评审

请生成完整的JSON格式方案。`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
