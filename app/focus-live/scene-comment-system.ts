import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import { getTimePeriodComments, shortFocusComments, longFocusComments, mediumFocusComments, personAwayComments, welcomeComments } from "./chat-data";



// ============================================================
// #region 场景规则与类型
// ============================================================

const mediaPipeVersion = "0.10.35";
const mediaPipeWasmRoot = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`;
const detectionIntervalMs = 2500;
const personMissingTriggerMs = 10_000;


export type SceneCommentKind =
  | "person-away"
  | "time-period"
  | "welcome"
  | "short-focus"
  | "medium-focus"
  | "long-focus";

export type SceneCommentDecision = {
  kind: SceneCommentKind;
  text: string;
};

type SceneMemory = {
  hasPerson: boolean | null;
  missingSince: number | null;
};

type SceneSnapshot = {
  isLive: boolean;
  elapsed: number;
  now: number;
  memory: SceneMemory;
};

type SceneCommentSystemOptions = {
  isLive: boolean;
  elapsed: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  modelAssetPath: string;
};

type PersonDetector = {
  detect(video: HTMLVideoElement, timestamp: number): boolean;
  close(): void;
};

// #endregion



// ============================================================
// #region 评论选择
// ============================================================

function pickRandomComment(comments: readonly string[]) {
  return comments[Math.floor(Math.random() * comments.length)];
}

function createSceneMemory(): SceneMemory {
  return {
    hasPerson: null,
    missingSince: null,
  };
}

function selectStudyStageComment(elapsed: number): SceneCommentDecision {
  if (elapsed < 10 * 60) {
    return {
      kind: "welcome",
      text: pickRandomComment(welcomeComments),
    };
  }

  if (elapsed < 20 * 60) {
    return {
      kind: "short-focus",
      text: pickRandomComment(shortFocusComments),
    };
  }

  if (elapsed < 30 * 60) {
    return {
      kind: "medium-focus",
      text: pickRandomComment(mediumFocusComments),
    };
  }

  return {
    kind: "long-focus",
    text: pickRandomComment(longFocusComments),
  };
}

/**
 * 根据当前画面和学习时间选择优先级最高的评论。
 * 人物连续离开超过 10 秒时始终返回询问弹幕；
 * 其他情况下随机从当前时间段评论和当前学习阶段评论中二选一。
 */
export function selectBestSceneComment({isLive, elapsed, now, memory}: SceneSnapshot): SceneCommentDecision {
  const personMissingLongEnough =
    isLive
    && memory.hasPerson === false
    && memory.missingSince !== null
    && now - memory.missingSince >= personMissingTriggerMs;

  if (personMissingLongEnough) {
    return {
      kind: "person-away",
      text: pickRandomComment(personAwayComments),
    };
  }

  if (Math.random() < 0.5) {
    return {
      kind: "time-period",
      text: pickRandomComment(getTimePeriodComments(new Date(now))),
    };
  }

  return selectStudyStageComment(elapsed);
}

// #endregion



// ============================================================
// #region MediaPipe 人物检测
// ============================================================

async function createPersonDetector(modelAssetPath: string): Promise<PersonDetector> {
  const originalConsoleError = console.error;
  const mediaPipeConsoleError = (...args: unknown[]) => {
    const isXnnpackInfo = args.some(
      (argument) => typeof argument === "string" && argument.includes("Created TensorFlow Lite XNNPACK delegate for CPU"),
    );
    if (!isXnnpackInfo) originalConsoleError(...args);
  };

  console.error = mediaPipeConsoleError;

  try {
    const { FilesetResolver, ObjectDetector } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(mediaPipeWasmRoot);
    const detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath,
      },
      runningMode: "VIDEO",
      scoreThreshold: 0.35,
      categoryAllowlist: ["person"],
      maxResults: 3,
    });

    return {
      detect(video, timestamp) {
        return detector.detectForVideo(video, timestamp).detections.length > 0;
      },
      close() {
        detector.close();
      },
    };
  } finally {
    if (console.error === mediaPipeConsoleError) console.error = originalConsoleError;
  }
}

// #endregion



// ============================================================
// #region 场景弹幕系统 Hook
// ============================================================

export function useSceneCommentSystem({ isLive, elapsed, videoRef, modelAssetPath }: SceneCommentSystemOptions) {
  const memoryRef = useRef<SceneMemory>(createSceneMemory());
  const elapsedRef = useRef(elapsed);
  const isLiveRef = useRef(isLive);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    isLiveRef.current = isLive;
    if (!isLive) memoryRef.current = createSceneMemory();
  }, [isLive]);

  const getNextComment = useCallback((now = Date.now()) => {
    return selectBestSceneComment({
      isLive: isLiveRef.current,
      elapsed: elapsedRef.current,
      now,
      memory: memoryRef.current,
    });
  }, []);

  useEffect(() => {
    if (!isLive) return;

    let cancelled = false;
    let detector: PersonDetector | null = null;
    let detectionTimer: number | undefined;

    const scheduleDetection = () => {
      detectionTimer = window.setTimeout(runDetection, detectionIntervalMs);
    };

    const runDetection = () => {
      if (cancelled) return;
      const video = videoRef.current;

      if (detector && video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused) {
        const now = Date.now();
        try {
          const hasPerson = detector.detect(video, performance.now());
          memoryRef.current.hasPerson = hasPerson;
          if (hasPerson) {
            memoryRef.current.missingSince = null;
          } else {
            memoryRef.current.missingSince ??= now;
          }
        } catch (error) {
          console.warn("人物检测暂时不可用", error);
        }
      }

      scheduleDetection();
    };

    const startDetection = async () => {
      try {
        detector = await createPersonDetector(modelAssetPath);
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
  }, [isLive, modelAssetPath, videoRef]);

  return getNextComment;
}

// #endregion
