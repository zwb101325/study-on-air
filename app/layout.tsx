import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "https://wanfeng-camera-live.zwb101325.chatgpt.site";
  const imageUrl = `${origin}/og.png`;

  return {
    title: "晚风 LIVE｜实时摄像头直播间",
    description: "打开摄像头，把此刻变成你的实时直播画面。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "晚风 LIVE",
      description: "让此刻，被看见",
      images: [{ url: imageUrl, width: 1733, height: 909, alt: "晚风 LIVE 分享预览" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "晚风 LIVE",
      description: "让此刻，被看见",
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
