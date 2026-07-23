import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  personAwayComments,
  studyEncouragementComments,
  welcomeStudyComments,
} from "./chat-data";

// ============================================================
// #region 场景规则与类型
// ============================================================

const mediaPipeVersion = "0.10.35";
const mediaPipeWasmRoot =
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`;

const detectionIntervalMs = 2500;
const personMissingTriggerMs = 8000;
const personMissingCooldownMs = 45_000;
const welcomeStartSeconds = 5;
const welcomeEndSeconds = 60;
const encouragementIntervalSeconds = 600;

export type SceneCommentKind = "person-away" | "study-encouragement" | "welcome";

export type SceneCommentDecision = {
  kind: SceneCommentKind;
  text: string;
  milestone?: number;
};

type SceneMemory = {
  hasPerson: boolean | null;
  missingSince: number | null;
  awayCooldownUntil: number;
  welcomeSent: boolean;
  lastEncouragementMilestone: number;
};

type SceneSnapshot = {
  elapsed: number;
  now: number;
  memory: SceneMemory;
};

type SceneCommentSystemOptions = {
  isLive: boolean;
  elapsed: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  modelAssetPath: string;
  onComment: (comment: string) => void;
};

type PersonDetector = {
  detect(video: HTMLVideoElement, timestamp: number): boolean;
  close(): void;
};

// ============================================================
// #endregion
// ============================================================

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
    awayCooldownUntil: 0,
    welcomeSent: false,
    lastEncouragementMilestone: 0,
  };
}

/**
 * 根据当前画面和学习时间选择优先级最高的评论。
 * 优先级：人物离开 > 十分钟鼓励 > 开播欢迎。
 */
export function selectBestSceneComment({
  elapsed,
  now,
  memory,
}: SceneSnapshot): SceneCommentDecision | null {
  const personMissingLongEnough =
    memory.hasPerson === false
    && memory.missingSince !== null
    && now - memory.missingSince >= personMissingTriggerMs;

  if (personMissingLongEnough && now >= memory.awayCooldownUntil) {
    return {
      kind: "person-away",
      text: pickRandomComment(personAwayComments),
    };
  }

  const completedTenMinuteBlocks = Math.floor(elapsed / encouragementIntervalSeconds);
  if (
    completedTenMinuteBlocks >= 1
    && completedTenMinuteBlocks > memory.lastEncouragementMilestone
  ) {
    return {
      kind: "study-encouragement",
      text: pickRandomComment(studyEncouragementComments),
      milestone: completedTenMinuteBlocks,
    };
  }

  if (
    elapsed >= welcomeStartSeconds
    && elapsed < welcomeEndSeconds
    && !memory.welcomeSent
  ) {
    return {
      kind: "welcome",
      text: pickRandomComment(welcomeStudyComments),
    };
  }

  return null;
}

function markCommentHandled(
  decision: SceneCommentDecision,
  memory: SceneMemory,
  now: number,
) {
  if (decision.kind === "person-away") {
    memory.awayCooldownUntil = now + personMissingCooldownMs;
    memory.missingSince = now;
  } else if (decision.kind === "study-encouragement") {
    memory.lastEncouragementMilestone = decision.milestone ?? 0;
  } else {
    memory.welcomeSent = true;
  }
}

// ============================================================
// #endregion
// ============================================================

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

// ============================================================
// #endregion
// ============================================================

// ============================================================
// #region 场景弹幕系统 Hook
// ============================================================

export function useSceneCommentSystem({
  isLive,
  elapsed,
  videoRef,
  modelAssetPath,
  onComment,
}: SceneCommentSystemOptions) {
  const memoryRef = useRef<SceneMemory>(createSceneMemory());
  const elapsedRef = useRef(elapsed);
  const onCommentRef = useRef(onComment);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    onCommentRef.current = onComment;
  }, [onComment]);

  const evaluateScene = useCallback((now = Date.now()) => {
    const decision = selectBestSceneComment({
      elapsed: elapsedRef.current,
      now,
      memory: memoryRef.current,
    });
    if (!decision) return;

    markCommentHandled(decision, memoryRef.current, now);
    onCommentRef.current(decision.text);
  }, []);

  useEffect(() => {
    if (!isLive) {
      memoryRef.current = createSceneMemory();
      return;
    }
    evaluateScene();
  }, [elapsed, evaluateScene, isLive]);

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
          evaluateScene(now);
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
  }, [evaluateScene, isLive, modelAssetPath, videoRef]);
}

// ============================================================
// #endregion
// ============================================================
