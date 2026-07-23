"use client";

// ============================================================
// #region 模块导入
// ============================================================

import { ChangeEvent, CSSProperties, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { withBasePath } from "../base-path";
import {
  chatUsers,
  initialMessages,
  liveComments,
  personAwayComments,
  studyEncouragementComments,
  welcomeStudyComments,
  type ChatMessage,
} from "./chat-data";
import { createPersonDetector } from "./person-detector";

// ============================================================
// #endregion
// ============================================================

// ============================================================
// #region 类型定义
// ============================================================

type DanmakuItem = ChatMessage & {
  barrageId: number;
  trackTop: number;
  duration: number;
};

type DanmakuStyle = CSSProperties & {
  "--track-top": string;
  "--duration": string;
};

type DanmakuLayerStyle = CSSProperties & {
  "--danmaku-opacity": number;
  "--danmaku-font-size": string;
};

type Gift = {
  icon: string;
  name: string;
  price: string;
  effect: string;
  color: string;
};

type GiftEffect = {
  id: number;
  gift: Gift;
};

type GiftEffectStyle = CSSProperties & {
  "--effect-color": string;
};

type GiftParticleStyle = CSSProperties & {
  "--particle-angle": string;
};

// ============================================================
// #endregion
// ============================================================

// ============================================================
// #region 礼物、弹幕选项与默认配置
// ============================================================

const gifts: Gift[] = [
  { icon: "🌷", name: "小花花", price: "1 星糖", effect: "bloom", color: "#ff6f9f" },
  { icon: "💌", name: "心动来信", price: "5 星糖", effect: "letter", color: "#ff5f8f" },
  { icon: "🧋", name: "加杯奶茶", price: "10 星糖", effect: "bubble", color: "#d89963" },
  { icon: "🎠", name: "梦幻木马", price: "66 星糖", effect: "carousel", color: "#bd8cff" },
  { icon: "🚀", name: "星际旅行", price: "188 星糖", effect: "rocket", color: "#6ca7ff" },
  { icon: "⭐", name: "星光棒", price: "20 星糖", effect: "star", color: "#ffd65c" },
  { icon: "🐳", name: "星海鲸语", price: "88 星糖", effect: "whale", color: "#5dc7e8" },
  { icon: "👑", name: "闪耀王冠", price: "520 星糖", effect: "crown", color: "#ffc247" },
  { icon: "🎆", name: "流星烟火", price: "999 星糖", effect: "fireworks", color: "#ff71c8" },
  { icon: "🏰", name: "梦幻城堡", price: "1314 星糖", effect: "castle", color: "#9c83ff" },
];

const danmakuSpeedOptions = [
  { label: "极慢", factor: 0.55 },
  { label: "较慢", factor: 0.75 },
  { label: "适中", factor: 1 },
  { label: "较快", factor: 1.35 },
  { label: "极快", factor: 1.75 },
] as const;

const defaultMirrored = true;
const defaultGrowthInterval = 10;
const defaultCommentInterval = 2;
const defaultDanmakuSpeed = 2;

// ============================================================
// #endregion
// ============================================================

// ============================================================
// #region 通用工具函数
// ============================================================

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

function getRandomizedIntervalMs(seconds: number) {
  return seconds * 1000 * (0.8 + Math.random() * 0.4);
}

// ============================================================
// #endregion
// ============================================================

export default function Home() {
  // ============================================================
  // #region React 引用与页面状态
  // ============================================================

  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(20);
  const nextDanmakuId = useRef(1);
  const nextGiftEffectId = useRef(1);
  const nextArrivalIndex = useRef(0);
  const showDanmakuRef = useRef<(message: ChatMessage) => void>(() => undefined);
  const welcomeReactionSentRef = useRef(false);
  const lastEncouragementMilestoneRef = useRef(0);
  const danmakuTimersRef = useRef<Set<number>>(new Set());
  const giftEffectTimersRef = useRef<Set<number>>(new Set());
  const [isLive, setIsLive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [mirrored, setMirrored] = useState(defaultMirrored);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(true);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [danmakuEnabled, setDanmakuEnabled] = useState(true);
  const [danmakuSettingsOpen, setDanmakuSettingsOpen] = useState(false);
  const [danmakuDisplayArea, setDanmakuDisplayArea] = useState(50);
  const [danmakuOpacity, setDanmakuOpacity] = useState(80);
  const [danmakuFontSize, setDanmakuFontSize] = useState(100);
  const [danmakuSpeed, setDanmakuSpeed] = useState(defaultDanmakuSpeed);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState("晚风里，和你聊聊天");
  const [hostId, setHostId] = useState("晚风同学");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarHint, setAvatarHint] = useState("JPG、PNG、WebP，最大 5MB");
  const [category, setCategory] = useState("日常 / 陪伴");
  const [viewerCount, setViewerCount] = useState(1284);
  const [commentInterval, setCommentInterval] = useState(defaultCommentInterval);
  const [growthInterval, setGrowthInterval] = useState(defaultGrowthInterval);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState(initialMessages);
  const showWelcome = messages.filter((message) => message.id >= 20).length < 3;
  const [danmakuItems, setDanmakuItems] = useState<DanmakuItem[]>([]);
  const [giftEffects, setGiftEffects] = useState<GiftEffect[]>([]);
  const [draft, setDraft] = useState("");
  const [autoFollow, setAutoFollow] = useState(true);
  const [notice, setNotice] = useState("点击下方按钮，开启你的实时画面");
  const [isStarting, setIsStarting] = useState(false);

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 弹幕创建与情境评论触发
  // ============================================================

  const showDanmaku = useCallback((message: ChatMessage) => {
    const barrageId = nextDanmakuId.current++;
    const trackCount = Math.max(1, Math.min(8, Math.round(danmakuDisplayArea / 12.5)));
    const track = barrageId % trackCount;
    const trackTop = trackCount === 1 ? 12 : 8 + (track / (trackCount - 1)) * 74;
    const duration = (12 + (barrageId % 4)) / danmakuSpeedOptions[danmakuSpeed].factor;
    const item: DanmakuItem = {
      ...message,
      barrageId,
      duration,
      trackTop,
    };

    setDanmakuItems((current) => [...current.slice(-17), item]);
    const timerId = window.setTimeout(() => {
      setDanmakuItems((current) => current.filter((entry) => entry.barrageId !== barrageId));
      danmakuTimersRef.current.delete(timerId);
    }, duration * 1000);
    danmakuTimersRef.current.add(timerId);
  }, [danmakuDisplayArea, danmakuSpeed]);

  useEffect(() => {
    showDanmakuRef.current = showDanmaku;
  }, [showDanmaku]);

  const emitTriggeredComment = useCallback((comments: readonly string[]) => {
    if (comments.length === 0) return;
    const user = chatUsers[Math.floor(Math.random() * chatUsers.length)];
    const message: ChatMessage = {
      id: nextMessageId.current++,
      user: user.id,
      text: comments[Math.floor(Math.random() * comments.length)],
      color: user.color,
      accent: user.accent,
    };

    setMessages((current) => [...current.slice(-49), message]);
    showDanmakuRef.current(message);
  }, []);

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 直播计时、学习阶段与人物识别
  // ============================================================

  useEffect(() => {
    if (!isLive) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  useEffect(() => {
    if (!isLive) {
      welcomeReactionSentRef.current = false;
      lastEncouragementMilestoneRef.current = 0;
      return;
    }

    if (elapsed >= 5 && elapsed < 60 && !welcomeReactionSentRef.current) {
      welcomeReactionSentRef.current = true;
      emitTriggeredComment(welcomeStudyComments);
    }

    const completedTenMinuteBlocks = Math.floor(elapsed / 600);
    if (
      completedTenMinuteBlocks >= 1
      && completedTenMinuteBlocks > lastEncouragementMilestoneRef.current
    ) {
      lastEncouragementMilestoneRef.current = completedTenMinuteBlocks;
      emitTriggeredComment(studyEncouragementComments);
    }
  }, [elapsed, emitTriggeredComment, isLive]);

  useEffect(() => {
    if (!isLive) return;

    let cancelled = false;
    let detector: Awaited<ReturnType<typeof createPersonDetector>> | null = null;
    let detectionTimer: number | undefined;
    let missingSince: number | null = null;
    let cooldownUntil = 0;

    const scheduleDetection = () => {
      detectionTimer = window.setTimeout(runDetection, 2500);
    };

    const runDetection = () => {
      if (cancelled) return;
      const video = videoRef.current;

      if (detector && video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused) {
        const now = Date.now();
        try {
          const hasPerson = detector.detect(video, performance.now());
          if (hasPerson) {
            missingSince = null;
          } else {
            missingSince ??= now;
            if (now - missingSince >= 8000 && now >= cooldownUntil) {
              emitTriggeredComment(personAwayComments);
              cooldownUntil = now + 45_000;
              missingSince = now;
            }
          }
        } catch (error) {
          console.warn("人物检测暂时不可用", error);
        }
      }

      scheduleDetection();
    };

    const startDetection = async () => {
      try {
        detector = await createPersonDetector(
          withBasePath("/models/efficientdet_lite0.tflite"),
        );
        if (cancelled) {
          detector.close();
          return;
        }
        runDetection();
      } catch (error) {
        console.warn("人物检测初始化失败", error);
      }
    };

    void startDetection();

    return () => {
      cancelled = true;
      if (detectionTimer !== undefined) window.clearTimeout(detectionTimer);
      detector?.close();
    };
  }, [emitTriggeredComment, isLive]);

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 媒体资源生命周期与播放器状态同步
  // ============================================================

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      danmakuTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      danmakuTimersRef.current.clear();
      giftEffectTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      giftEffectTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted || volume === 0;
  }, [volume, isMuted, isLive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPictureInPicture = () => setIsPictureInPicture(true);
    const handleLeavePictureInPicture = () => setIsPictureInPicture(false);
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    video.addEventListener("enterpictureinpicture", handleEnterPictureInPicture);
    video.addEventListener("leavepictureinpicture", handleLeavePictureInPicture);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnterPictureInPicture);
      video.removeEventListener("leavepictureinpicture", handleLeavePictureInPicture);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 自动评论与直播间观众增长
  // ============================================================

  useEffect(() => {
    if (commentInterval === 0) return;
    let timeoutId: number;

    const queueNextComment = () => {
      const delay = getRandomizedIntervalMs(commentInterval);
      timeoutId = window.setTimeout(() => {
        const next = liveComments[Math.floor(Math.random() * liveComments.length)];
        const incomingMessage: ChatMessage = {
          id: nextMessageId.current++,
          user: next.user,
          text: next.text,
          color: next.color,
        };
        setMessages((current) => [
          ...current.slice(-49),
          incomingMessage,
        ]);
        showDanmaku(incomingMessage);
        queueNextComment();
      }, delay);
    };

    queueNextComment();
    return () => window.clearTimeout(timeoutId);
  }, [commentInterval, showDanmaku]);

  useEffect(() => {
    if (growthInterval === 0) return;
    let timeoutId: number;

    const queueNextViewer = () => {
      const delay = getRandomizedIntervalMs(growthInterval);
      timeoutId = window.setTimeout(() => {
        const newcomer = liveComments[nextArrivalIndex.current % liveComments.length];
        nextArrivalIndex.current += 1;
        const arrivalMessage: ChatMessage = {
          id: nextMessageId.current++,
          user: newcomer.user,
          text: "进入了直播间",
          joined: true,
          color: newcomer.color,
        };

        setViewerCount((current) => Math.min(999999, current + 1));
        setMessages((current) => [...current.slice(-49), arrivalMessage]);
        queueNextViewer();
      }, delay);
    };

    queueNextViewer();
    return () => window.clearTimeout(timeoutId);
  }, [growthInterval]);

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 设置面板交互与聊天滚动
  // ============================================================

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

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 摄像头与直播播放器控制
  // ============================================================

  const stopLive = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsLive(false);
    setIsPlaying(false);
    setElapsed(0);
    setNotice("直播已暂停，随时可以再次开启");
  };

  const connectCamera = async (resetElapsed: boolean) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice("当前浏览器不支持摄像头，请使用最新版 Chrome、Edge 或 Safari");
      return;
    }

    setIsStarting(true);
    setNotice(resetElapsed ? "正在连接摄像头…" : "正在刷新直播画面…");
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
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
      if (resetElapsed) setElapsed(0);
      setIsLive(true);
      setIsPlaying(true);
      setNotice(resetElapsed ? "摄像头已连接" : "直播画面已刷新");
    } catch (error) {
      const mediaError = error as DOMException;
      const permissionDenied = mediaError.name === "NotAllowedError" || mediaError.name === "SecurityError";
      setNotice(
        permissionDenied
          ? "没有获得摄像头权限，请在浏览器地址栏中允许后重试"
          : "没有找到可用的摄像头，请检查设备连接后重试",
      );
      setIsLive(false);
      setIsPlaying(false);
    } finally {
      setIsStarting(false);
    }
  };

  const startLive = () => connectCamera(true);

  const refreshLive = () => connectCamera(false);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || !isLive) return;
    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
        setNotice("直播画面已继续播放");
      } catch {
        setNotice("画面暂时无法继续播放，请点击刷新重试");
      }
    } else {
      video.pause();
      setIsPlaying(false);
      setNotice("直播画面已暂停，直播计时仍在继续");
    }
  };

  const toggleVolume = () => {
    if (isMuted || volume === 0) {
      if (volume === 0) setVolume(0.65);
      setIsMuted(false);
      setNotice("直播声音已开启，请注意避免麦克风回声");
    } else {
      setIsMuted(true);
      setNotice("直播声音已静音");
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !isLive) return;
    try {
      if (!document.pictureInPictureEnabled || video.disablePictureInPicture) {
        setNotice("当前浏览器暂不支持小窗模式");
        return;
      }
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      setNotice("小窗模式开启失败，请稍后重试");
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

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 头像、礼物特效与聊天发送
  // ============================================================

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarHint("请选择有效的图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarHint("图片不能超过 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setAvatarUrl(reader.result);
      setAvatarHint("头像已更新");
    };
    reader.onerror = () => setAvatarHint("图片读取失败，请重新选择");
    reader.readAsDataURL(file);
  };

  const triggerGiftEffect = (gift: Gift) => {
    const id = nextGiftEffectId.current++;
    setGiftEffects((current) => [...current.slice(-2), { id, gift }]);

    const timerId = window.setTimeout(() => {
      setGiftEffects((current) => current.filter((effect) => effect.id !== id));
      giftEffectTimersRef.current.delete(timerId);
    }, 3000);
    giftEffectTimersRef.current.add(timerId);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const outgoingMessage: ChatMessage = {
      id: nextMessageId.current++,
      user: "我",
      text,
      accent: true,
      color: "#ff6a98",
    };
    setAutoFollow(true);
    setMessages((current) => [
      ...current.slice(-49),
      outgoingMessage,
    ]);
    showDanmaku(outgoingMessage);
    setDraft("");
  };

  // ============================================================
  // #endregion
  // ============================================================

  // ============================================================
  // #region 页面结构渲染
  // ============================================================

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <SiteHeader active="live" />

      <section className="room-layout">
        <div className="room-main">
          <div className="room-header">
            <div className="host-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="主播头像" /> : hostId.trim().slice(0, 1) || "晚"}
              <span className="online-dot" />
            </div>
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
                {isFollowing ? (
                  "✓ 已关注"
                ) : (
                  <>
                    <img className="follow-icon" src={withBasePath("/icons/plus.svg")} alt="" aria-hidden="true" />
                    关注
                  </>
                )}
              </button>
              <div className="settings-wrap" ref={settingsRef}>
                <button
                  className={settingsOpen ? "settings-button active" : "settings-button"}
                  onClick={() => setSettingsOpen((value) => !value)}
                  aria-expanded={settingsOpen}
                aria-haspopup="dialog"
              >
                  <img className="settings-icon" src={withBasePath("/icons/more.svg")} alt="" aria-hidden="true" />
                  <span className="settings-label">更多设置</span>
                </button>
                {settingsOpen && (
                  <div className="settings-panel" role="dialog" aria-label="直播间更多设置">
                    <div className="settings-heading">
                      <div><strong>更多设置</strong><small>调整直播间演示数据</small></div>
                      <button
                        onClick={() => {
                          setRoomTitle("晚风里，和你聊聊天");
                          setHostId("晚风同学");
                          setAvatarUrl(null);
                          setAvatarHint("JPG、PNG、WebP，最大 5MB");
                          setCategory("日常 / 陪伴");
                          setViewerCount(1284);
                          setCommentInterval(defaultCommentInterval);
                          setGrowthInterval(defaultGrowthInterval);
                        }}
                      >
                        恢复默认
                      </button>
                    </div>
                    <div className="settings-section-title">直播间信息</div>
                    <div className="avatar-setting">
                      <div className="avatar-preview">
                        {avatarUrl ? <img src={avatarUrl} alt="头像预览" /> : hostId.trim().slice(0, 1) || "晚"}
                      </div>
                      <div className="avatar-setting-copy"><b>主播头像</b><small>{avatarHint}</small></div>
                      <div className="avatar-actions">
                        <label className="avatar-upload-button">
                          {avatarUrl ? "更换" : "上传"}
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                        {avatarUrl && <button type="button" onClick={() => { setAvatarUrl(null); setAvatarHint("JPG、PNG、WebP，最大 5MB"); }}>移除</button>}
                      </div>
                    </div>
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
                    <label className="speed-field growth-speed-field">
                      <span><b>直播间涨粉速度</b><strong>{growthInterval === 0 ? "关闭" : `约每 ${growthInterval} 秒`}</strong></span>
                      <input
                        aria-label="直播间涨粉速度"
                        aria-valuetext={growthInterval === 0 ? "关闭" : `约每 ${growthInterval} 秒增加一人`}
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={growthInterval}
                        onChange={(event) => setGrowthInterval(Number(event.target.value))}
                      />
                      <span className="speed-scale"><small>0 秒（关闭）</small><small>20 秒</small></span>
                    </label>
                    <label className="speed-field">
                      <span><b>评论出现速度</b><strong>{commentInterval === 0 ? "关闭" : `约每 ${commentInterval} 秒`}</strong></span>
                      <input
                        aria-label="评论出现速度"
                        aria-valuetext={commentInterval === 0 ? "关闭" : `约每 ${commentInterval} 秒一条`}
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={commentInterval}
                        onChange={(event) => setCommentInterval(Number(event.target.value))}
                      />
                      <span className="speed-scale"><small>0 秒（关闭）</small><small>20 秒</small></span>
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
              muted={isMuted || volume === 0}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              aria-label="摄像头实时画面"
            />

            <div
              className={danmakuEnabled ? "danmaku-layer" : "danmaku-layer hidden"}
              style={{
                height: `${danmakuDisplayArea}%`,
                "--danmaku-opacity": danmakuOpacity / 100,
                "--danmaku-font-size": `${13 * (danmakuFontSize / 100)}px`,
              } as DanmakuLayerStyle}
              aria-hidden="true"
            >
              {danmakuItems.map((item) => (
                <div
                  className="danmaku-item"
                  key={item.barrageId}
                  style={{
                    "--track-top": `${item.trackTop}%`,
                    "--duration": `${item.duration}s`,
                  } as DanmakuStyle}
                >
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="gift-effects-layer" aria-live="polite" aria-atomic="false">
              {giftEffects.map(({ id, gift }) => (
                <div
                  className={`gift-effect effect-${gift.effect}`}
                  key={id}
                  style={{ "--effect-color": gift.color } as GiftEffectStyle}
                >
                  <div className="gift-particles" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, index) => (
                      <span
                        key={index}
                        style={{ "--particle-angle": `${index * 30}deg` } as GiftParticleStyle}
                      >
                        ✦
                      </span>
                    ))}
                  </div>
                  <span className="gift-effect-icon" aria-hidden="true">{gift.icon}</span>
                  <strong>{gift.name}</strong>
                  <small>送给晚风一份心意</small>
                </div>
              ))}
            </div>

            {!isLive && (
              <div className="empty-stage">
                <div className="camera-orbit">
                  <img className="camera-orbit-icon" src={withBasePath("/icons/camera-on.svg")} alt="" aria-hidden="true" />
                </div>
                <h2>准备好，和大家见面了吗？</h2>
                <p>{notice}</p>
                <button className="start-button" onClick={startLive} disabled={isStarting}>
                  <img className="start-camera-icon" src={withBasePath("/icons/camera-on.svg")} alt="" aria-hidden="true" />
                  {isStarting ? "正在连接…" : "开启摄像头"}
                </button>
                <span className="permission-hint">仅在你允许后使用摄像头与麦克风</span>
              </div>
            )}

            {isLive && (
              <div className="live-status"><span /> LIVE</div>
            )}

            <div className={isLive ? "video-controls visible" : "video-controls"}>
              <div className="control-left">
                <button className="control-button" onClick={togglePlayback} disabled={!isLive} aria-label={isPlaying ? "暂停播放" : "继续播放"} data-tooltip={isPlaying ? "暂停" : "播放"}>
                  <img className="control-icon play-icon" src={withBasePath(isPlaying ? "/icons/pause.svg" : "/icons/play.svg")} alt="" aria-hidden="true" />
                </button>
                <button className="control-button" onClick={refreshLive} disabled={!isLive || isStarting} aria-label="刷新直播画面" data-tooltip="刷新">
                  <img className={isStarting ? "control-icon refresh-icon spinning" : "control-icon refresh-icon"} src={withBasePath("/icons/refresh.svg")} alt="" aria-hidden="true" />
                </button>
                <div className="control-popover-wrap">
                  <button
                    className={volumeOpen ? "control-button active" : "control-button"}
                    onClick={() => setVolumeOpen((value) => !value)}
                    disabled={!isLive}
                    aria-label="调节音量"
                    aria-expanded={volumeOpen}
                    data-tooltip="音量调节"
                  >
                    <img className="control-icon volume-icon" src={withBasePath(isMuted || volume === 0 ? "/icons/volume-muted.svg" : "/icons/volume.svg")} alt="" aria-hidden="true" />
                  </button>
                  {volumeOpen && (
                    <div className="volume-popover">
                      <button
                        className="volume-value"
                        onClick={toggleVolume}
                        aria-label={isMuted || volume === 0 ? "取消静音" : "静音"}
                        title={isMuted || volume === 0 ? "取消静音" : "静音"}
                      >
                        {Math.round((isMuted ? 0 : volume) * 100)}
                      </button>
                      <input
                        aria-label="直播音量"
                        aria-orientation="vertical"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(event) => {
                          const nextVolume = Number(event.target.value);
                          setVolume(nextVolume);
                          setIsMuted(nextVolume === 0);
                        }}
                      />
                    </div>
                  )}
                </div>
                <time
                  className="live-duration"
                  dateTime={`PT${elapsed}S`}
                  data-tooltip="直播持续时间"
                  aria-label={`直播持续时间 ${formatDuration(elapsed)}`}
                  tabIndex={0}
                >
                  {formatDuration(elapsed)}
                </time>
              </div>
              <div className="control-right">
                <button
                  className={mirrored ? "control-button active" : "control-button"}
                  onClick={() => setMirrored((value) => !value)}
                  disabled={!isLive}
                  aria-label={mirrored ? "关闭镜像模式" : "开启镜像模式"}
                  aria-pressed={mirrored}
                  data-tooltip={mirrored ? "关闭镜像" : "开启镜像"}
                >
                  <img className="control-icon" src={withBasePath(mirrored ? "/icons/mirror-exit.svg" : "/icons/mirror.svg")} alt="" aria-hidden="true" />
                </button>
                <button
                  className={isPictureInPicture ? "control-button active" : "control-button"}
                  onClick={togglePictureInPicture}
                  disabled={!isLive}
                  aria-label={isPictureInPicture ? "退出小窗模式" : "开启小窗模式"}
                  aria-pressed={isPictureInPicture}
                  data-tooltip={isPictureInPicture ? "退出小窗" : "小窗模式"}
                >
                  <img className="control-icon" src={withBasePath(isPictureInPicture ? "/icons/pip-exit.svg" : "/icons/pip.svg")} alt="" aria-hidden="true" />
                </button>
                <button
                  className={danmakuEnabled ? "control-button active danmaku-toggle" : "control-button danmaku-toggle"}
                  onClick={() => setDanmakuEnabled((value) => !value)}
                  aria-label={danmakuEnabled ? "关闭弹幕" : "开启弹幕"}
                  aria-pressed={danmakuEnabled}
                  data-tooltip={danmakuEnabled ? "关闭弹幕" : "开启弹幕"}
                >
                  <img className="control-icon" src={withBasePath(danmakuEnabled ? "/icons/danmaku.svg" : "/icons/danmaku-on.svg")} alt="" aria-hidden="true" />
                </button>
                <div className="control-popover-wrap danmaku-settings-wrap">
                  <button
                    className={danmakuSettingsOpen ? "control-button active" : "control-button"}
                    onClick={() => setDanmakuSettingsOpen((value) => !value)}
                    aria-label="弹幕设置"
                    aria-expanded={danmakuSettingsOpen}
                    data-tooltip="弹幕设置"
                  >
                    <img className="control-icon" src={withBasePath("/icons/danmaku-settings.svg")} alt="" aria-hidden="true" />
                  </button>
                  {danmakuSettingsOpen && (
                    <div className="danmaku-settings-popover" role="dialog" aria-label="弹幕设置">
                      <div className="control-panel-heading">
                        <strong>弹幕设置</strong>
                        <button onClick={() => { setDanmakuDisplayArea(50); setDanmakuOpacity(80); setDanmakuFontSize(100); setDanmakuSpeed(defaultDanmakuSpeed); }}>恢复默认</button>
                      </div>
                      <label className="danmaku-setting-row">
                        <span>显示区域</span>
                        <input aria-label="弹幕显示区域" type="range" min="10" max="100" step="10" value={danmakuDisplayArea} onChange={(event) => setDanmakuDisplayArea(Number(event.target.value))} />
                        <b>{danmakuDisplayArea}%</b>
                      </label>
                      <label className="danmaku-setting-row">
                        <span>不透明度</span>
                        <input aria-label="弹幕不透明度" type="range" min="10" max="100" step="10" value={danmakuOpacity} onChange={(event) => setDanmakuOpacity(Number(event.target.value))} />
                        <b>{danmakuOpacity}%</b>
                      </label>
                      <label className="danmaku-setting-row">
                        <span>字体大小</span>
                        <input aria-label="弹幕字体大小" type="range" min="50" max="170" step="10" value={danmakuFontSize} onChange={(event) => setDanmakuFontSize(Number(event.target.value))} />
                        <b>{danmakuFontSize}%</b>
                      </label>
                      <label className="danmaku-setting-row">
                        <span>弹幕速度</span>
                        <input aria-label="弹幕速度" aria-valuetext={danmakuSpeedOptions[danmakuSpeed].label} type="range" min="0" max="4" step="1" value={danmakuSpeed} onChange={(event) => setDanmakuSpeed(Number(event.target.value))} />
                        <b>{danmakuSpeedOptions[danmakuSpeed].label}</b>
                      </label>
                    </div>
                  )}
                </div>
                <button
                  className={isFullscreen ? "control-button active tooltip-align-right" : "control-button tooltip-align-right"}
                  onClick={enterFullscreen}
                  aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
                  aria-pressed={isFullscreen}
                  data-tooltip={isFullscreen ? "退出全屏" : "全屏模式"}
                >
                  <img className="control-icon" src={withBasePath(isFullscreen ? "/icons/fullscreen-exit.svg" : "/icons/fullscreen.svg")} alt="" aria-hidden="true" />
                </button>
                {isLive && <button className="end-button compact" onClick={stopLive} title="结束直播">结束</button>}
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
                <button
                  className="gift-item"
                  key={gift.name}
                  title={`赠送${gift.name}`}
                  aria-label={`赠送${gift.name}，${gift.price}`}
                  onClick={() => triggerGiftEffect(gift)}
                >
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
              {showWelcome && <div className="welcome-line"><span>✦</span> 你进入了直播间</div>}
              {messages.map((message) => (
                <p className={`${message.accent ? "message accent" : "message"}${message.joined ? " joined" : ""}`} key={message.id}>
                  <strong style={message.color ? { color: message.color } : undefined}>{message.user}</strong><span>{message.joined ? ` ${message.text}` : `：${message.text}`}</span>
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

  // ============================================================
  // #endregion
  // ============================================================
}
