
import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export default function HandTracker({ onHandUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const callbackRef = useRef(onHandUpdate);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    callbackRef.current = onHandUpdate;
  }, [onHandUpdate]);

  useEffect(() => {
    let active = true;
    let stream = null;
    let detector = null;
    let frameId = null;
    let lastVideoTime = -1;

    async function start() {
      try {
        setStatus("Loading MediaPipe model...");

        const vision = await FilesetResolver.forVisionTasks(
          WASM_URL
        );

        const handLandmarker =
          await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_URL,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6,
          });

        if (!active) {
          handLandmarker.close();
          return;
        }

        detector = handLandmarker;

        setStatus("Requesting webcam access...");

        const cameraStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: 640,
              height: 480,
              facingMode: "user",
            },
            audio: false,
          });

        if (!active) {
          cameraStream.getTracks().forEach(t => t.stop());
          return;
        }

        stream = cameraStream;

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        if (!active) return;

        setStatus("Camera active");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const drawing = new DrawingUtils(ctx);

        function processFrame() {
          if (!active) return;

          if (video.readyState >= 2) {
            const width = video.videoWidth;
            const height = video.videoHeight;

            if (canvas.width !== width) canvas.width = width;
            if (canvas.height !== height) canvas.height = height;

            if (video.currentTime !== lastVideoTime) {
              lastVideoTime = video.currentTime;

              ctx.clearRect(0, 0, width, height);

              const results = detector.detectForVideo(
                video,
                performance.now()
              );

              if (results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];

                drawing.drawConnectors(
                  landmarks,
                  HandLandmarker.HAND_CONNECTIONS,
                  {
                    color: "#00ff88",
                    lineWidth: 3,
                  }
                );

                drawing.drawLandmarks(landmarks, {
                  color: "#ffcc00",
                  radius: 3,
                });

                callbackRef.current?.(landmarks);
              } else {
                callbackRef.current?.(null);
              }
            }
          }

          frameId = requestAnimationFrame(processFrame);
        }

        processFrame();
      } catch (error) {
        console.error(error);

        if (active) {
          setStatus(
            error.name === "NotAllowedError"
              ? "Camera permission denied"
              : "Failed to initialize camera or model"
          );
        }
      }
    }

    start();

    return () => {
      active = false;

      if (frameId !== null) cancelAnimationFrame(frameId);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (detector) detector.close();
    };
  }, []);

  return (
    <div className="tracker">
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} />
      </div>

      <p className="camera-status">{status}</p>
    </div>
  );
}
