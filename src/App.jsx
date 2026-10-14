
import { useCallback, useRef, useState } from "react";
import HandTracker from "./components/HandTracker";
import DraggableBox from "./components/DraggableBox";
import {
  isPinching,
  getCursorPosition,
} from "./utils/gestureDetection";
import "./App.css";

const BOX_WIDTH = 160;
const BOX_HEIGHT = 120;

export default function App() {
  const workspaceRef = useRef(null);

  const [position, setPosition] = useState({
    x: 250,
    y: 180,
  });

  const [cursor, setCursor] = useState(null);
  const [gesture, setGesture] = useState("No hand");
  const [dragging, setDragging] = useState(false);

  const positionRef = useRef({ x: 250, y: 180 });
  const wasPinchingRef = useRef(false);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleHandUpdate = useCallback((landmarks) => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    if (!landmarks) {
      wasPinchingRef.current = false;
      draggingRef.current = false;

      setCursor(null);
      setDragging(false);
      setGesture("No hand");
      return;
    }

    const rect = workspace.getBoundingClientRect();

    const finger = getCursorPosition(
      landmarks,
      rect.width,
      rect.height
    );

    setCursor(finger);

    const pinching = isPinching(
      landmarks,
      wasPinchingRef.current
    );

    const pinchStarted =
      pinching && !wasPinchingRef.current;

    const pinchEnded =
      !pinching && wasPinchingRef.current;

    if (pinchStarted) {
      const box = positionRef.current;

      const insideBox =
        finger.x >= box.x &&
        finger.x <= box.x + BOX_WIDTH &&
        finger.y >= box.y &&
        finger.y <= box.y + BOX_HEIGHT;

      if (insideBox) {
        draggingRef.current = true;
        setDragging(true);

        dragOffsetRef.current = {
          x: finger.x - box.x,
          y: finger.y - box.y,
        };
      }
    }

    if (pinchEnded) {
      draggingRef.current = false;
      setDragging(false);
    }

    if (pinching && draggingRef.current) {
      const newPosition = {
        x: Math.max(
          0,
          Math.min(
            rect.width - BOX_WIDTH,
            finger.x - dragOffsetRef.current.x
          )
        ),
        y: Math.max(
          0,
          Math.min(
            rect.height - BOX_HEIGHT,
            finger.y - dragOffsetRef.current.y
          )
        ),
      };

      positionRef.current = newPosition;
      setPosition(newPosition);
    }

    wasPinchingRef.current = pinching;

    setGesture(
      draggingRef.current
        ? "Dragging"
        : pinching
        ? "Pinching"
        : "Hand detected"
    );
  }, []);

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>GestureFlow</h1>
          <p>Touchless Web Interaction</p>
        </div>

        <span className="status-badge">
          {gesture}
        </span>
      </header>

      <section className="workspace" ref={workspaceRef}>
        <div className="instructions">
          <h2>Hand Gesture Playground</h2>
          <p>
            Move your index finger over the box.
            Pinch to grab, move to drag,
            and release to drop.
          </p>
        </div>

        <DraggableBox
          position={position}
          isDragging={dragging}
        />

        {cursor && (
          <div
            className={`virtual-cursor ${
              dragging ? "cursor-dragging" : ""
            }`}
            style={{
              left: cursor.x,
              top: cursor.y,
            }}
          />
        )}

        <div className="camera-panel">
          <HandTracker onHandUpdate={handleHandUpdate} />
        </div>
      </section>

      <footer>
        React + MediaPipe | Hand Gesture Recognition MVP
      </footer>
    </main>
  );
}
