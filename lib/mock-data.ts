// ============================================================
// AIGC Vision Studio - Mock Data Generator
// 模拟 DeepSeek API 生成结果，用于演示和开发
// ============================================================

import type {
  ProjectType,
  VisualStyle,
  TargetAudience,
  CreativeResult,
  ColorPalette,
  AgentOutput,
  ReviewResult,
} from "@/types/creative";
import { MOCK_NOTES } from "./mock-knowledge";
import { getKnowledgeSources } from "./knowledge-search";

// ---- 配色方案库 ----
const COLOR_PALETTES: Record<string, ColorPalette> = {
  minimalist: {
    primary: "#1A1A1A",
    secondary: "#F5F5F5",
    accent: "#FF6B35",
    background: "#FFFFFF",
    text: "#2D2D2D",
    names: ["墨黑", "瓷白", "活力橙", "纯白", "深灰"],
    hexCodes: ["#1A1A1A", "#F5F5F5", "#FF6B35", "#FFFFFF", "#2D2D2D"],
  },
  "tech-futuristic": {
    primary: "#0A0E27",
    secondary: "#00F0FF",
    accent: "#FF006E",
    background: "#0D1117",
    text: "#E6EDF3",
    names: ["深空蓝", "赛博青", "霓虹粉", "暗黑背景", "浅灰白"],
    hexCodes: ["#0A0E27", "#00F0FF", "#FF006E", "#0D1117", "#E6EDF3"],
  },
  "chinese-ink": {
    primary: "#2C1810",
    secondary: "#C41E3A",
    accent: "#D4A574",
    background: "#F5F0E8",
    text: "#3C3C3C",
    names: ["墨棕", "中国红", "宣纸金", "米白", "炭灰"],
    hexCodes: ["#2C1810", "#C41E3A", "#D4A574", "#F5F0E8", "#3C3C3C"],
  },
  "pop-art": {
    primary: "#FFD700",
    secondary: "#FF1493",
    accent: "#00CED1",
    background: "#1C1C1C",
    text: "#FFFFFF",
    names: ["柠檬黄", "热粉红", "青绿", "暗黑", "纯白"],
    hexCodes: ["#FFD700", "#FF1493", "#00CED1", "#1C1C1C", "#FFFFFF"],
  },
  "retro-vintage": {
    primary: "#8B4513",
    secondary: "#DAA520",
    accent: "#2E8B57",
    background: "#FFF8DC",
    text: "#4A3728",
    names: ["鞍棕", "金菊黄", "海绿", "玉米白", "可可棕"],
    hexCodes: ["#8B4513", "#DAA520", "#2E8B57", "#FFF8DC", "#4A3728"],
  },
  "nature-organic": {
    primary: "#2D5A27",
    secondary: "#8BC34A",
    accent: "#FF9800",
    background: "#FAFAF5",
    text: "#2E3B2E",
    names: ["森林绿", "嫩芽绿", "蜜橙", "奶白", "深草绿"],
    hexCodes: ["#2D5A27", "#8BC34A", "#FF9800", "#FAFAF5", "#2E3B2E"],
  },
};

// ---- 视觉关键词库 ----
const KEYWORD_POOLS: Record<string, string[]> = {
  "brand-visual": [
    "品牌识别",
    "视觉系统",
    "年轻活力",
    "现代简约",
    "记忆符号",
    "品牌温度",
    "质感表达",
  ],
  "poster-design": [
    "视觉冲击",
    "层次构图",
    "字体张力",
    "色彩对比",
    "留白美学",
    "信息聚焦",
    "动态构图",
  ],
  "cultural-tourism": [
    "地域文化",
    "自然风光",
    "人文故事",
    "沉浸体验",
    "传统新生",
    "在地性表达",
    "情感共鸣",
  ],
  "ip-character": [
    "角色识别度",
    "情感投射",
    "延展性",
    "故事性",
    "萌系/潮酷",
    "符号简化",
    "动态表达",
  ],
  "package-design": [
    "货架吸引力",
    "材质触感",
    "结构创新",
    "信息层级",
    "环保理念",
    "开箱体验",
    "品牌延续",
  ],
};

// ---- 智能体输出 ----
function generateStrategyOutput(
  topic: string,
  projectType: string,
  targetAudience: string
): AgentOutput {
  const concepts: Record<string, string> = {
    "brand-visual": `围绕"${topic}"，以"青春共振·视觉破圈"为核心概念，构建一套具有强识别度的年轻化品牌视觉体系。核心理念：让品牌成为年轻消费者的"视觉伙伴"，通过大胆的色彩对比、动态的图形语言和真实的场景叙事，传递品牌的活力与温度。`,
    "poster-design": `围绕"${topic}"，以"一眼万年·瞬间共鸣"为核心概念，通过超现实视觉语言和情感化表达，在3秒内抓住受众注意力。核心理念：每张海报都是一次微型叙事，用视觉说故事，用色彩传递情绪。`,
    "cultural-tourism": `围绕"${topic}"，以"在地新生·文化解码"为核心概念，将地域文化符号进行现代化转译，打造具有沉浸感的文旅视觉体验。核心理念：让传统文化以年轻人喜欢的方式重新说话。`,
    "ip-character": `围绕"${topic}"，以"情感符号·超级记忆点"为核心概念，设计具有高辨识度和强情感连接的角色IP形象。核心理念：不是设计一个角色，而是创造一位能被记住的朋友。`,
    "package-design": `围绕"${topic}"，以"开箱即惊喜·物超所值"为核心概念，通过创新的包装结构和精致的视觉表达，提升产品感知价值。核心理念：包装不只是容器，是品牌体验的延续。`,
  };

  const audiences: Record<string, string> = {
    "gen-z": "Z世代 (15-25岁)：追求个性表达、社交货币和即时满足感，偏爱视觉冲击力强、有态度的品牌。活跃于抖音、小红书、B站。",
    millennials:
      "千禧一代 (26-40岁)：注重品质与体验的平衡，愿意为设计和品牌故事买单。活跃于微信、微博、小红书。",
    professionals:
      "职场精英 (25-45岁)：追求高效、专业和品质感，注重品牌调性和社会认同。活跃于微信、知乎、LinkedIn。",
    families:
      "家庭用户 (30-50岁)：关注健康、安全和性价比，偏好温暖、可信赖的品牌形象。活跃于微信、抖音。",
    students:
      "在校学生 (18-24岁)：预算有限但追求潮流，对新鲜事物充满好奇，容易被创意营销打动。活跃于小红书、抖音、B站。",
    luxury:
      "高端消费群体 (30-55岁)：追求独特性、稀缺性和极致的品质体验。关注细节、材质和文化内涵。活跃于微信、高端生活方式平台。",
  };

  return {
    agentType: "strategy",
    content: `### 创意策略分析\n\n**项目主题**：${topic}\n\n**项目类型**：${projectType}\n\n**目标受众分析**：${audiences[targetAudience] || audiences.genz}\n\n**创意概念**：${concepts[projectType] || concepts["brand-visual"]}\n\n**传播目标**：\n1. 建立强烈的品牌/视觉识别度\n2. 与目标受众建立情感连接\n3. 在社交媒体上形成传播势能\n4. 提升品牌年轻化和时尚感\n\n**差异化策略**：以"视觉叙事"取代"视觉展示"，让每个设计元素都讲述一个故事。`,
  };
}

function generateVisualOutput(visualStyle: string): AgentOutput {
  const palette = COLOR_PALETTES[visualStyle] || COLOR_PALETTES.minimalist;

  const compositions: Record<string, string> = {
    minimalist:
      "采用大片留白配合精准的文字排版，运用黄金分割和网格系统，让视觉元素在空间中「呼吸」。重点元素置于视觉中心，辅以微妙的阴影和层次。",
    "tech-futuristic":
      "采用非对称构图和赛博朋克美学，利用发光线条、数据化图形和透明叠层创造深度感。重点区域使用霓虹色高光吸引视线。",
    "chinese-ink":
      "借鉴中国传统书画的散点透视和留白哲学，运用水墨渲染、毛笔笔触和印章元素，营造东方意境。构图讲究「疏可走马，密不透风」。",
    "pop-art":
      "采用波普艺术的重复、放大和强烈对比手法，使用大胆的色块分割、网点纹理和漫画式边框，创造视觉冲击力。",
    "retro-vintage":
      "借鉴上世纪的版式设计，运用复古字体、做旧纹理、邮票边框和暖色调照片滤镜，营造怀旧氛围。采用居中对称或经典的三分法构图。",
    "nature-organic":
      "采用流动的有机曲线和不规则布局，模拟自然界的生长形态。运用渐变叠加、毛玻璃效果和植物纹理，创造亲和自然的视觉感受。",
  };

  return {
    agentType: "visual",
    content: `### 视觉风格方案\n\n**风格定位**：${visualStyle}\n\n**视觉关键词**：\n- 主色调：${palette.names[0]} ${palette.hexCodes[0]}\n- 辅助色：${palette.names[1]} ${palette.hexCodes[1]}\n- 点缀色：${palette.names[2]} ${palette.hexCodes[2]}\n- 背景色：${palette.names[3]} ${palette.hexCodes[3]}\n- 文字色：${palette.names[4]} ${palette.hexCodes[4]}\n\n**字体建议**：\n- 标题字体：选择具有个性化和识别度的展示字体\n- 正文字体：选用易读性高的无衬线字体\n- 装饰字体：配合整体风格选择相应的艺术字体\n\n**材质与氛围**：\n- 建议使用带有微妙纹理的纸质/布质基底\n- 可加入金属烫印或 UV 工艺提升质感\n- 数字端可加入微动效和渐变叠加\n\n**构图建议**：\n${compositions[visualStyle] || compositions.minimalist}`,
    data: { palette },
  };
}

function generatePromptOutput(
  topic: string,
  visualStyle: string,
  palette: ColorPalette
): AgentOutput {
  const cnPrompt = `【AI 生图提示词 - 中文版】

主题：${topic}

画面描述：
一幅高品质商业视觉设计作品，风格为${visualStyle}。画面以${palette.names[0]}和${palette.names[1]}为主色调，点缀以${palette.names[2]}。背景采用${palette.names[3]}，整体氛围高级、有质感。构图精心设计，视觉焦点突出，光影柔和自然，细节精致丰富。适合品牌宣传和商业展示使用。

技术参数建议：
- 画幅比例：16:9 或 4:3
- 分辨率：4K / 8K
- 渲染风格：超写实 / 商业摄影级质感

适配工具：Midjourney / Stable Diffusion / 即梦 / 通义万相`;

  const enPrompt = `[AI Image Generation Prompt - English]

Subject: ${topic}

Scene Description:
A high-quality commercial visual design with a ${visualStyle} aesthetic. The color palette features ${palette.names[0]} and ${palette.names[1]} as dominant colors, accented with ${palette.names[2]}. The background is ${palette.names[3]}, creating a premium, sophisticated atmosphere. Meticulously composed with a strong focal point, soft and natural lighting, and exquisite attention to detail. Suitable for brand promotion and commercial display.

Technical Parameters:
--ar 16:9
--quality 2
--style refined
--lighting studio-quality
--detail high

Compatible with: Midjourney / Stable Diffusion / DALL-E / ComfyUI`;

  return {
    agentType: "prompt",
    content: `### AI 生图提示词\n\n**中文提示词（适配即梦/通义万相）**：\n${cnPrompt}\n\n---\n\n**英文提示词（适配 Midjourney/Stable Diffusion）**：\n${enPrompt}`,
    data: { promptCN: cnPrompt, promptEN: enPrompt },
  };
}

function generateReviewOutput(): AgentOutput {
  const review: ReviewResult = {
    aesthetics: "整体视觉方案美学层级清晰，色彩搭配和谐且具有辨识度，构图建议专业且可执行性强。视觉元素之间的比例关系和空间节奏处理得当，符合设计基本原则。建议在实际执行时注意色彩在不同媒介上的还原度。",
    communication:
      "方案精准把握了目标受众的审美偏好和传播场景，视觉语言具有强烈的社交传播潜力。创意概念与品牌/项目定位高度契合，信息传递简洁有力。建议在社交媒体端增加互动性视觉元素的设计考量。",
    feasibility:
      "方案提供的技术参数和在工具建议均为行业标准，具有高度可执行性。提示词结构完整、描述精准，可直接用于主流 AI 生图工具。建议在实际生成时进行 3-5 轮迭代优化以获得最佳效果。",
    professionalism:
      "方案的专业表达符合行业标准，从策略分析到视觉执行形成了完整的逻辑闭环。视觉方案的呈现方式和术语使用展现了专业设计素养。建议增加竞品视觉分析和差异化说明以增强方案的深度。",
    suggestions: [
      "建议补充视觉方案的竞品分析，突出差异化优势",
      "可在配色方案中增加 60-30-10 的配比说明",
      "建议为移动端和印刷端分别准备适配方案",
      "可增加动态视觉（视频/H5）的设计延展建议",
      "建议为不同投放渠道准备视觉变体方案",
    ],
    overallScore: 88,
  };

  return {
    agentType: "review",
    content: `### 方案评审\n\n**美学评分**：${review.overallScore}/100\n\n**美学分析**：${review.aesthetics}\n\n**传播效果分析**：${review.communication}\n\n**可执行性分析**：${review.feasibility}\n\n**专业表达分析**：${review.professionalism}\n\n**优化建议**：\n${review.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    data: { review },
  };
}

// ---- 主生成函数 ----
export function generateMockResult(
  topic: string,
  projectType: ProjectType,
  visualStyle: VisualStyle,
  targetAudience: TargetAudience
): CreativeResult {
  const id = `AIGC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const palette =
    COLOR_PALETTES[visualStyle] || COLOR_PALETTES.minimalist;

  const strategyOutput = generateStrategyOutput(topic, projectType, targetAudience);
  const visualOutput = generateVisualOutput(visualStyle);
  const promptOutput = generatePromptOutput(topic, visualStyle, palette);
  const reviewOutput = generateReviewOutput();

  const keywords =
    KEYWORD_POOLS[projectType] || KEYWORD_POOLS["brand-visual"];

  // 从 Mock 知识库中搜索相关内容作为知识来源
  const allSources = [
    ...getKnowledgeSources(topic, MOCK_NOTES, "strategy"),
    ...getKnowledgeSources(visualStyle, MOCK_NOTES, "visual"),
    ...getKnowledgeSources("prompt AI生图", MOCK_NOTES, "prompt"),
    ...getKnowledgeSources("设计评审 美学", MOCK_NOTES, "review"),
  ];

  // 去重
  const seen = new Set<string>();
  const uniqueSources = allSources.filter((s) => {
    const key = s.noteTitle;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const knowledgeRefs = {
    sources: uniqueSources.slice(0, 6),
    queryUsed: topic,
    totalNotesScanned: MOCK_NOTES.length,
  };

  return {
    id,
    topic,
    projectType,
    visualStyle,
    targetAudience,
    createdAt: new Date().toISOString(),
    agentOutputs: [strategyOutput, visualOutput, promptOutput, reviewOutput],
    summary: `本项目围绕"${topic}"展开，采用${visualStyle}风格，面向${targetAudience}群体。通过策略分析、视觉设计、提示词生成和方案评审四个智能体的协作，形成了一套完整的视觉创意方案。`,
    creativeConcept:
      strategyOutput.content.split("**创意概念**：")[1]?.split("\n")[0] ||
      "创意概念待定",
    targetUser: strategyOutput.content
      .split("**目标受众分析**：")[1]
      ?.split("\n\n")[0] || "",
    visualKeywords: keywords,
    colorPalette: palette,
    compositionAdvice:
      visualOutput.content.split("**构图建议**：\n")[1] ||
      "构图建议待定",
    promptCN: promptOutput.data?.promptCN as string,
    promptEN: promptOutput.data?.promptEN as string,
    review: (reviewOutput.data?.review as ReviewResult) || {
      aesthetics: "",
      communication: "",
      feasibility: "",
      professionalism: "",
      suggestions: [],
      overallScore: 0,
    },
    portfolioNotes: `### 作品集展示说明\n\n1. **主视觉展示**：将最终生成的图像作为作品集首页\n2. **过程展示**：展示从创意概念到最终成品的完整流程\n3. **色板展示**：展示配色方案色块和比例关系\n4. **应用场景**：展示设计在不同载体上的应用效果\n\n**排版建议**：采用大面积留白配合网格系统，让每页只聚焦一个核心信息。每页配简短的设计说明，帮助评审老师理解设计思路和创意过程。`,
    knowledgeRefs,
  };
}
