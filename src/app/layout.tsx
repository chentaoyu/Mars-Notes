import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "云笔记 - 简洁高效的在线笔记",
  description: "一个基于 Next.js 的云笔记应用，支持 Markdown 编辑",
  keywords: ["笔记", "Markdown", "云笔记", "在线笔记"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

