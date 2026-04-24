import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RockWorld 异色抓取记录台",
  description: "用于记录 RockWorld 异色精灵抓取、存档与图鉴进度的本地工具。",
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
