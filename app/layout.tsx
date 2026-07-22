import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "晚风 LIVE｜实时摄像头直播间",
  description: "打开摄像头，把此刻变成你的实时直播画面。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
