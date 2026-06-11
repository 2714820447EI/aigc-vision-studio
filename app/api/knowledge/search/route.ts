// ============================================================
// API: POST /api/knowledge/search
// 搜索 Obsidian 知识库
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { scanVault } from "@/lib/obsidian";
import { searchKnowledge } from "@/lib/knowledge-search";
import { MOCK_NOTES } from "@/lib/mock-knowledge";
import type { SearchRequest } from "@/types/knowledge";

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "请输入搜索关键词", results: [], totalFound: 0 },
        { status: 400 }
      );
    }

    // 尝试获取真实 vault 数据
    let notes = scanVault().notes;

    // 如果真实 vault 为空，使用 Mock 数据
    if (notes.length === 0) {
      notes = MOCK_NOTES;
    }

    // 执行搜索
    const results = searchKnowledge(body.query.trim(), notes, {
      maxResults: body.maxResults || 10,
      filterTags: body.filterTags,
      minRelevance: 0.03,
    });

    return NextResponse.json({
      success: true,
      results,
      totalFound: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "搜索失败",
        results: [],
        totalFound: 0,
      },
      { status: 500 }
    );
  }
}
