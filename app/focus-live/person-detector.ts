export type PersonDetector = {
  detect(video: HTMLVideoElement, timestamp: number): boolean;
  close(): void;
};

const mediaPipeVersion = "0.10.35";
const mediaPipeWasmRoot =
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${mediaPipeVersion}/wasm`;

export async function createPersonDetector(modelAssetPath: string): Promise<PersonDetector> {
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
