import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://wanfeng-camera-live.zwb101325.chatgpt.site";
const imageUrl = `${siteOrigin}${basePath}/og-focus.png`;

export const metadata: Metadata = {
  title: "晚风 FOCUS｜找到你的专注节奏",
  description: "在专注航班、咖啡馆、直播间与课堂中，选择适合此刻的专注场景。",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "晚风 FOCUS",
    description: "给每一次专注，一个恰好的场景。",
    images: [{ url: imageUrl, width: 1728, height: 910, alt: "晚风 FOCUS 分享预览" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "晚风 FOCUS",
    description: "给每一次专注，一个恰好的场景。",
    images: [imageUrl],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
