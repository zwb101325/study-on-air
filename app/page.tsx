"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  user: string;
  text: string;
  accent?: boolean;
  color?: string;
};

const initialMessages: ChatMessage[] = [
  { id: 1, user: "柚子汽水", text: "晚上好！今天播什么呀？", color: "#8b72d7" },
  { id: 2, user: "bili_70241986", text: "前排坐好，等开播 ✨", color: "#5b8fd1" },
  { id: 3, user: "南方来信·第七页", text: "这个直播间也太舒服了", color: "#b05eac" },
  { id: 4, user: "NeoCat", text: "声音很清楚～", color: "#2c9d8a" },
  { id: 5, user: "橘猫团长", text: "分享直播间，叫朋友一起来！", accent: true },
  { id: 6, user: "晚风收藏家协会会长", text: "来啦来啦，今晚不走了", color: "#d0783f" },
  { id: 7, user: "汽水半糖", text: "给主播点个关注 💗", color: "#df5f91" },
  { id: 8, user: "一颗小星星", text: "画面好有氛围感", color: "#6f7fc8" },
];

const liveComments = [
  { user: "云朵面包", text: "刚进来，先和大家打个招呼 👋", color: "#8b72d7" },
  { user: "蓝莓星球", text: "主播晚上好，今天也来陪你啦", color: "#5c83ce" },
  { user: "白桃乌龙", text: "这个画面好清晰！", color: "#d45f91" },
  { user: "北极甜虾", text: "默默蹲在直播间听你聊天", color: "#9b6cc0" },
  { user: "奶油小熊", text: "已分享给朋友，一起来玩～", color: "#c87242" },
  { user: "银河便利店", text: "今天的氛围也太温柔了吧", color: "#5487b8" },
  { user: "海盐芝士", text: "送你一颗小星星 ✨", color: "#289b89" },
  { user: "春日来信", text: "第一次来，已经点关注啦", color: "#b75a9c" },
  { user: "草莓软糖", text: "弹幕打卡！大家晚上好", color: "#e05e7d" },
  { user: "毛绒月亮", text: "边做作业边听，陪伴感满满", color: "#7768c6" },
  { user: "bili_92602771446", text: "刚下课就赶来直播间啦", color: "#4c86be" },
  { user: "今天也要早睡呀", text: "主播记得喝水～", color: "#cd654f" },
  { user: "雾岛听风", text: "这个直播间的颜色真好看", color: "#6577bd" },
  { user: "一颗柠檬薄荷糖", text: "已开启后台陪伴模式", color: "#249a79" },
  { user: "Rin", text: "打卡！", color: "#c15fa6" },
  { user: "星河漫游指南第42页", text: "从推荐页来的，先关注一下", color: "#9a68c8" },
  { user: "小岛", text: "晚上好呀", color: "#dd6b8d" },
  { user: "纸飞机飞过晚霞", text: "今天也准时见面了", color: "#d07c3e" },
  { user: "user_0x7F", text: "画质很稳，点赞", color: "#3e91a5" },
  { user: "住在月亮背面的人", text: "安静听你聊天就很开心", color: "#765fc2" },
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
  const settingsRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(20);
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [mirrored, setMirrored] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState("晚风里，和你聊聊天");
  const [hostId, setHostId] = useState("晚风同学");
  const [category, setCategory] = useState("日常 / 陪伴");
  const [viewerCount, setViewerCount] = useState(1284);
  const [commentInterval, setCommentInterval] = useState(3);
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
      const delay = commentInterval * 1000 * (0.8 + Math.random() * 0.4);
      timeoutId = window.setTimeout(() => {
        const next = liveComments[Math.floor(Math.random() * liveComments.length)];
        setMessages((current) => [
          ...current.slice(-49),
          { id: nextMessageId.current++, user: next.user, text: next.text, color: next.color },
        ]);
        queueNextComment();
      }, delay);
    };

    queueNextComment();
    return () => window.clearTimeout(timeoutId);
  }, [commentInterval]);

  useEffect(() => {
    if (!settingsOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [settingsOpen]);

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
            <div className="host-avatar">{hostId.trim().slice(0, 1) || "晚"}<span className="online-dot" /></div>
            <div className="room-copy">
              <div className="title-row">
                <h1>{roomTitle || "未命名直播间"}</h1>
                <span className={isLive ? "live-badge active" : "live-badge"}>
                  {isLive ? "直播中" : "未开播"}
                </span>
              </div>
              <p>主播：{hostId || "未设置"} <span>·</span> {category}</p>
            </div>
            <div className="header-pills">
              <button
                className={isFollowing ? "follow-button following" : "follow-button"}
                onClick={() => setIsFollowing((value) => !value)}
                aria-pressed={isFollowing}
                title={isFollowing ? "点击取消关注" : "点击关注主播"}
              >
                {isFollowing ? "✓ 已关注" : "＋ 关注"}
              </button>
              <div className="settings-wrap" ref={settingsRef}>
                <button
                  className={settingsOpen ? "settings-button active" : "settings-button"}
                  onClick={() => setSettingsOpen((value) => !value)}
                  aria-expanded={settingsOpen}
                  aria-haspopup="dialog"
                >
                  <span aria-hidden="true">•••</span><span className="settings-label">更多设置</span>
                </button>
                {settingsOpen && (
                  <div className="settings-panel" role="dialog" aria-label="直播间更多设置">
                    <div className="settings-heading">
                      <div><strong>更多设置</strong><small>调整直播间演示数据</small></div>
                      <button
                        onClick={() => {
                          setRoomTitle("晚风里，和你聊聊天");
                          setHostId("晚风同学");
                          setCategory("日常 / 陪伴");
                          setViewerCount(1284);
                          setCommentInterval(3);
                        }}
                      >
                        恢复默认
                      </button>
                    </div>
                    <div className="settings-section-title">直播间信息</div>
                    <label className="text-setting-field">
                      <span>直播间标题 <small>{roomTitle.length}/32</small></span>
                      <input
                        type="text"
                        maxLength={32}
                        value={roomTitle}
                        onChange={(event) => setRoomTitle(event.target.value)}
                        placeholder="输入直播间标题"
                      />
                    </label>
                    <label className="text-setting-field">
                      <span>主播 ID <small>{hostId.length}/20</small></span>
                      <input
                        type="text"
                        maxLength={20}
                        value={hostId}
                        onChange={(event) => setHostId(event.target.value)}
                        placeholder="输入主播 ID"
                      />
                    </label>
                    <label className="text-setting-field">
                      <span>直播分区</span>
                      <select value={category} onChange={(event) => setCategory(event.target.value)}>
                        <option>日常 / 陪伴</option>
                        <option>游戏 / 竞技</option>
                        <option>知识 / 学习</option>
                        <option>音乐 / 唱见</option>
                        <option>生活 / 户外</option>
                        <option>虚拟主播</option>
                      </select>
                    </label>
                    <div className="settings-section-title data-title">互动数据</div>
                    <label className="setting-field">
                      <span><b>在线人数</b><small>立即更新右侧显示</small></span>
                      <input
                        type="number"
                        min="0"
                        max="999999"
                        value={viewerCount}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          setViewerCount(Number.isFinite(next) ? Math.min(999999, Math.max(0, next)) : 0);
                        }}
                      />
                    </label>
                    <label className="speed-field">
                      <span><b>评论出现速度</b><strong>约每 {commentInterval} 秒</strong></span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={commentInterval}
                        onChange={(event) => setCommentInterval(Number(event.target.value))}
                      />
                      <span className="speed-scale"><small>快</small><small>慢</small></span>
                    </label>
                  </div>
                )}
              </div>
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
            <span><i /> {viewerCount.toLocaleString("zh-CN")} 人在线</span>
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
                  <strong style={message.color ? { color: message.color } : undefined}>{message.user}</strong><span>：{message.text}</span>
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
