// ============================================================
// API: POST /api/knowledge/scan
// 扫描 Obsidian Vault 或返回 Mock 数据
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { scanVault, clearCache } from "@/lib/obsidian";
import { MOCK_NOTES } from "@/lib/mock-knowledge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRescan = searchParams.get("force") === "true";

    if (forceRescan) {
      clearCache();
    }

    const result = scanVault(forceRescan);

    if (!result.success && result.error?.includes("未配置")) {
      // 未配置真实路径，返回 Mock 数据
      const allTags = new Set<string>();
      MOCK_NOTES.forEach((n) => n.tags.forEach((t) => allTags.add(t)));

      return NextResponse.json({
        success: true,
        status: {
          connected: false,
          vaultPath: "",
          noteCount: MOCK_NOTES.length,
          lastScannedAt: new Date().toISOString(),
          tagsCount: allTags.size,
        },
        notes: MOCK_NOTES,
        mockMode: true,
      });
    }

    return NextResponse.json({
      success: result.success,
      status: result.status,
      notes: result.notes,
      error: result.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "扫描失败",
      },
      { status: 500 }
    );
  }
}
