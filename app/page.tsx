"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  user: string;
  text: string;
  accent?: boolean;
};

const initialMessages: ChatMessage[] = [
  { id: 1, user: "柚子汽水", text: "晚上好！今天播什么呀？" },
  { id: 2, user: "小岛来信", text: "前排坐好，等开播 ✨" },
  { id: 3, user: "月亮邮差", text: "这个直播间也太舒服了" },
  { id: 4, user: "鱼丸粗面", text: "声音很清楚～" },
  { id: 5, user: "橘猫团长", text: "分享直播间，叫朋友一起来！", accent: true },
  { id: 6, user: "晚风收藏家", text: "来啦来啦，今晚不走了" },
  { id: 7, user: "汽水半糖", text: "给主播点个关注 💗" },
  { id: 8, user: "一颗小星星", text: "画面好有氛围感" },
];

const liveComments = [
  { user: "云朵面包", text: "刚进来，先和大家打个招呼 👋" },
  { user: "蓝莓星球", text: "主播晚上好，今天也来陪你啦" },
  { user: "白桃乌龙", text: "这个画面好清晰！" },
  { user: "北极甜虾", text: "默默蹲在直播间听你聊天" },
  { user: "奶油小熊", text: "已分享给朋友，一起来玩～" },
  { user: "银河便利店", text: "今天的氛围也太温柔了吧" },
  { user: "海盐芝士", text: "送你一颗小星星 ✨" },
  { user: "春日来信", text: "第一次来，已经点关注啦" },
  { user: "草莓软糖", text: "弹幕打卡！大家晚上好" },
  { user: "毛绒月亮", text: "边做作业边听，陪伴感满满" },
];

const gifts = [
  { icon: "🌷", name: "小花花", price: "1 星糖" },
  { icon: "💌", name: "心动来信", price: "5 星糖" },
  { icon: "🧋", name: "加杯奶茶", price: "10 星糖" },
  { icon: "🎠", name: "梦幻木马", price: "66 星糖" },
  { icon: "🚀", name: "星际旅行", price: "188 星糖" },
];

function CameraGlyph() {
  return (
    <span className="camera-glyph" aria-hidden="true">
      <span className="camera-lens" />
    </span>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(20);
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [mirrored, setMirrored] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [autoFollow, setAutoFollow] = useState(true);
  const [notice, setNotice] = useState("点击下方按钮，开启你的实时画面");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!isLive) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let timeoutId: number;

    const queueNextComment = () => {
      const delay = 1800 + Math.random() * 2600;
      timeoutId = window.setTimeout(() => {
        const next = liveComments[Math.floor(Math.random() * liveComments.length)];
        setMessages((current) => [
          ...current.slice(-49),
          { id: nextMessageId.current++, user: next.user, text: next.text },
        ]);
        queueNextComment();
      }, delay);
    };

    queueNextComment();
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!autoFollow || !messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, autoFollow]);

  const handleMessagesScroll = () => {
    const container = messagesRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setAutoFollow(distanceFromBottom < 56);
  };

  const scrollToLatest = () => {
    setAutoFollow(true);
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const stopLive = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsLive(false);
    setElapsed(0);
    setNotice("直播已暂停，随时可以再次开启");
  };

  const startLive = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice("当前浏览器不支持摄像头，请使用最新版 Chrome、Edge 或 Safari");
      return;
    }

    setIsStarting(true);
    setNotice("正在连接摄像头…");
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        setMicOn(true);
      } catch (error) {
        const mediaError = error as DOMException;
        if (mediaError.name === "NotFoundError" || mediaError.name === "OverconstrainedError") {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setMicOn(false);
        } else {
          throw error;
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setElapsed(0);
      setIsLive(true);
      setNotice("摄像头已连接");
    } catch (error) {
      const mediaError = error as DOMException;
      const permissionDenied = mediaError.name === "NotAllowedError" || mediaError.name === "SecurityError";
      setNotice(
        permissionDenied
          ? "没有获得摄像头权限，请在浏览器地址栏中允许后重试"
          : "没有找到可用的摄像头，请检查设备连接后重试",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const toggleMic = async () => {
    const stream = streamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length) {
      const next = !micOn;
      audioTracks.forEach((track) => (track.enabled = next));
      setMicOn(next);
      setNotice(next ? "麦克风已打开" : "麦克风已静音");
      return;
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      setMicOn(true);
      setNotice("麦克风已打开");
    } catch {
      setNotice("没有获得麦克风权限，请在浏览器设置中开启");
    }
  };

  const enterFullscreen = async () => {
    if (!stageRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current.requestFullscreen();
    } catch {
      setNotice("当前浏览器暂不支持全屏播放");
    }
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setAutoFollow(true);
    setMessages((current) => [
      ...current.slice(-49),
      { id: nextMessageId.current++, user: "我", text, accent: true },
    ]);
    setDraft("");
  };

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="晚风直播首页">
          <span className="brand-mark">W</span>
          <span>
            <strong>晚风 LIVE</strong>
            <small>让此刻，被看见</small>
          </span>
        </a>
        <nav className="top-actions" aria-label="页面导航">
          <button className="nav-button"><span>⌁</span> 发现</button>
          <button className="nav-button"><span>♡</span> 关注</button>
          <button className="profile-button" aria-label="个人中心">晚</button>
        </nav>
      </header>

      <section className="room-layout">
        <div className="room-main">
          <div className="room-header">
            <div className="host-avatar">晚<span className="online-dot" /></div>
            <div className="room-copy">
              <div className="title-row">
                <h1>晚风里，和你聊聊天</h1>
                <span className={isLive ? "live-badge active" : "live-badge"}>
                  {isLive ? "直播中" : "未开播"}
                </span>
              </div>
              <p>主播：晚风同学 <span>·</span> 日常 / 陪伴</p>
            </div>
            <div className="header-pills">
              <span className="rank-pill">✦ 新星主播</span>
              <button className="follow-button">＋ 关注</button>
            </div>
          </div>

          <div className="video-stage" ref={stageRef}>
            <video
              ref={videoRef}
              className={mirrored ? "camera-feed mirrored" : "camera-feed"}
              autoPlay
              muted
              playsInline
              aria-label="摄像头实时画面"
            />

            {!isLive && (
              <div className="empty-stage">
                <div className="camera-orbit"><CameraGlyph /></div>
                <h2>准备好，和大家见面了吗？</h2>
                <p>{notice}</p>
                <button className="start-button" onClick={startLive} disabled={isStarting}>
                  <CameraGlyph /> {isStarting ? "正在连接…" : "开启摄像头"}
                </button>
                <span className="permission-hint">仅在你允许后使用摄像头与麦克风</span>
              </div>
            )}

            {isLive && (
              <>
                <div className="live-status"><span /> LIVE <b>{formatDuration(elapsed)}</b></div>
                <div className="quality-badge">1080P · 实时</div>
                <div className="stage-notice" aria-live="polite">{notice}</div>
              </>
            )}

            <div className={isLive ? "video-controls visible" : "video-controls"}>
              <div className="control-left">
                <button className="round-control" onClick={toggleMic} disabled={!isLive} aria-label={micOn ? "关闭麦克风" : "打开麦克风"}>
                  {micOn ? "🎙" : "⊘"}
                </button>
                <button className="round-control" onClick={() => setMirrored((value) => !value)} disabled={!isLive} aria-label="切换镜像">
                  ↔
                </button>
                <span className="control-label">{micOn ? "麦克风已开启" : "麦克风已静音"}</span>
              </div>
              <div className="control-right">
                <button className="round-control" onClick={enterFullscreen} aria-label="全屏">⛶</button>
                {isLive && <button className="end-button" onClick={stopLive}>结束直播</button>}
              </div>
            </div>
          </div>

          <div className="gift-dock">
            <div className="dock-intro">
              <span className="dock-icon">✦</span>
              <div><strong>为喜欢发电</strong><small>选择一份心意</small></div>
            </div>
            <div className="gift-list">
              {gifts.map((gift) => (
                <button className="gift-item" key={gift.name} title={`赠送${gift.name}`}>
                  <span>{gift.icon}</span><strong>{gift.name}</strong><small>{gift.price}</small>
                </button>
              ))}
            </div>
            <div className="wallet"><span>星糖</span><strong>2,520</strong><button>＋</button></div>
          </div>
        </div>

        <aside className="chat-panel">
          <div className="chat-tabs">
            <button className="active">聊天室</button>
            <button>贡献榜</button>
            <span><i /> {isLive ? "1,284" : "328"} 人在线</span>
          </div>
          <div className="room-banner">
            <span>📣</span>
            <p><strong>直播间公告</strong>友好交流，快乐相遇。欢迎来到晚风的直播间！</p>
          </div>
          <div className="chat-stream">
            <div
              className="messages"
              ref={messagesRef}
              onScroll={handleMessagesScroll}
              aria-live="polite"
              aria-relevant="additions"
            >
              <div className="welcome-line"><span>✦</span> 你来到了晚风的直播间</div>
              {messages.map((message) => (
                <p className={message.accent ? "message accent" : "message"} key={message.id}>
                  <strong>{message.user}</strong><span>：{message.text}</span>
                </p>
              ))}
            </div>
            {!autoFollow && (
              <button className="latest-button" onClick={scrollToLatest}>
                ↓ 查看最新消息
              </button>
            )}
          </div>
          <div className="chat-reactions">
            <button aria-label="发送爱心">♥</button>
            <button aria-label="发送表情">☺</button>
            <span>文明聊天，友善互动</span>
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={60} placeholder="发个友善的弹幕吧～" aria-label="聊天消息" />
            <button type="submit" disabled={!draft.trim()}>发送</button>
          </form>
        </aside>
      </section>

      <footer className="footer-note">
        <span>© 2026 晚风 LIVE</span><span>本地实时预览 · 画面不会上传</span>
      </footer>
    </main>
  );
}
