// ============================================================
// AIGC Vision Studio - API Route: /api/generate
// 接收用户输入并返回生成结果
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateCreativeVision } from "@/lib/deepseek";
import type { GenerateRequest } from "@/types/creative";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // 参数校验
    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "请输入创意主题" },
        { status: 400 }
      );
    }

    if (body.topic.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "创意主题至少需要4个字符" },
        { status: 400 }
      );
    }

    const validProjectTypes = [
      "brand-visual",
      "poster-design",
      "cultural-tourism",
      "ip-character",
      "package-design",
    ];
    if (!validProjectTypes.includes(body.projectType)) {
      return NextResponse.json(
        { success: false, error: "请选择有效的项目类型" },
        { status: 400 }
      );
    }

    // 生成视觉创意方案
    const result = await generateCreativeVision(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[API] Generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "生成失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}
