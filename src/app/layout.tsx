import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "洛克王国异色抓取统计工具",
  description: "用于记录洛克王国异色精灵抓取进度的本地 Web 工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
