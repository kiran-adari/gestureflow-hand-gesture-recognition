
import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { recognizeGesture } from "../utils/gestureDetection";

const VERSION = import.meta.env.VITE_MEDIAPIPE_VERSION;

const WASM_URL =
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export default function HandTracker({ onGesture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const callbackRef = useRef(onGesture);

  const [status, setStatus] = useState("Starting...");
  const [gesture, setGesture] = useState("No hand");

  useEffect(() => {
    callbackRef.current = onGesture;
  }, [onGesture]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let stream = null;
    let landmarker = null;
    let lastVideoTime = -1;
    let lastGesture = "";
    let lastDetectedAt = 0;

    async function start() {
      try {
        if (!VERSION) {
          throw new Error(
            "Set VITE_MEDIAPIPE_VERSION in your .env file."
          );
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera requires localhost or HTTPS."
          );
        }

        setStatus("Requesting camera...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        setStatus("Loading MediaPipe...");

        const vision = await FilesetResolver.forVisionTasks(
          WASM_URL
        );

        if (cancelled) return;

        landmarker = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: MODEL_URL,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          }
        );

        if (cancelled) {
          landmarker.close();
          return;
        }

        setStatus("Tracking ready");
        detect();
      } catch (error) {
        if (!cancelled) {
          setStatus(`Error: ${error.message}`);
          callbackRef.current?.(null);
        }
      }
    }

    function detect() {
      if (cancelled) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
      ) {
        lastVideoTime = video.currentTime;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
          const result = landmarker.detectForVideo(
            video,
            performance.now()
          );

          const landmarks = result.landmarks?.[0];

          if (landmarks) {
            lastDetectedAt = performance.now();

            drawLandmarks(
              ctx,
              landmarks,
              canvas.width,
              canvas.height
            );

            const data = recognizeGesture(landmarks);
            callbackRef.current?.(data);

            if (data?.gesture !== lastGesture) {
              lastGesture = data?.gesture;
              setGesture(data?.gesture || "No hand");
            }
          } else if (
            performance.now() - lastDetectedAt > 200
          ) {
            callbackRef.current?.(null);

            if (lastGesture !== "none") {
              lastGesture = "none";
              setGesture("No hand");
            }
          }
        } catch (error) {
          setStatus(`Tracking error: ${error.message}`);
          callbackRef.current?.(null);
          return;
        }
      }

      frameId = requestAnimationFrame(detect);
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      callbackRef.current?.(null);

      stream?.getTracks().forEach(t => t.stop());
      landmarker?.close();
    };
  }, []);

  return (
    <div className="tracker">
      <div className="camera-box">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} />
      </div>

      <div className="tracker-status">
        <span>{status}</span>
        <strong>Gesture: {gesture}</strong>
      </div>
    </div>
  );
}

function drawLandmarks(ctx, landmarks, width, height) {
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  ctx.strokeStyle = "#5df5c7";
  ctx.fillStyle = "#a78bfa";
  ctx.lineWidth = 3;

  for (const connection of HandLandmarker.HAND_CONNECTIONS) {
    const a = landmarks[connection.start];
    const b = landmarks[connection.end];

    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }

  for (const point of landmarks) {
    ctx.beginPath();
    ctx.arc(
      point.x * width,
      point.y * height,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}