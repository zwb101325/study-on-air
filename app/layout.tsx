import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "https://wanfeng-camera-live.zwb101325.chatgpt.site";
  const imageUrl = `${origin}/og-focus.png`;

  return {
    title: "晚风 FOCUS｜找到你的专注节奏",
    description: "在专注航班、咖啡馆、直播间与课堂中，选择适合此刻的专注场景。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
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
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
