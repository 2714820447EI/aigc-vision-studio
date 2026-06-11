import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "灵感工坊 - AIGC 视觉创意智能体平台",
  description:
    "面向智能工程与创意设计专业的 AIGC 视觉创意平台。通过多个智能体协作，生成完整的创意策划、视觉风格、AI 生图提示词和方案评审。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
