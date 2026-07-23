import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import { shortFocusComments, longFocusComments, mediumFocusComments, personAwayComments, welcomeComments } from "./chat-data";



// ============================================================
// #region 场景规则与类型
// ============================================================

const mediaPipeVersion = "0.10.35";
const mediaPipeWasmRoot = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`;
const detectionIntervalMs = 2500;
const personMissingTriggerMs = 10_000;


export type SceneCommentKind =
  | "person-away"
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

/**
 * 根据当前画面和学习时间选择优先级最高的评论。
 * 人物连续离开超过 10 秒时始终返回询问弹幕；人物回来后按学习时长返回对应分区。
 */
export function selectBestSceneComment({isLive, elapsed, now, memory}: SceneSnapshot): SceneCommentDecision | null {
  if (!isLive) return null;

  const personMissingLongEnough =
    memory.hasPerson === false
    && memory.missingSince !== null
    && now - memory.missingSince >= personMissingTriggerMs;

  if (personMissingLongEnough) {
    return {
      kind: "person-away",
      text: pickRandomComment(personAwayComments),
    };
  }

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

// #endregion



// ============================================================
// #region MediaPipe 人物检测
// ============================================================

async function createPersonDetector(modelAssetPath: string): Promise<PersonDetector> {
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

  const getSceneComment = useCallback((now = Date.now()) => {
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

  return getSceneComment;
}

// #endregion
