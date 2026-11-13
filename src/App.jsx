
import { useCallback, useRef, useState } from "react";
import HandTracker from "./components/HandTracker";
import ParticleScene from "./components/ParticleScene";
import "./App.css";

export default function App() {
  const handRef = useRef(null);

  const [screen, setScreen] = useState("start");
  const [running, setRunning] = useState(true);
  const [pattern, setPattern] = useState("galaxy");
  const [color, setColor] = useState("#ffffff");
  const [mouseFallback, setMouseFallback] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const handleGesture = useCallback((data) => {
    handRef.current = data;
  }, []);

  const reset = () => {
    setPattern("galaxy");
    setColor("#ffffff");
    setRunning(true);
  };

  if (screen === "start") {
    return (
      <main className="page centered">
        <div className="intro">
          <span className="eyebrow">GESTUREFLOW 3D</span>
          <h1>Hand-Controlled Particle Art Studio</h1>

          <p>
            Control a real-time 3D particle system using
            hand gestures detected through your webcam.
          </p>

          <p>
            Pinch to attract particles. Open your palm to
            repel them. Move your hand to explore the scene.
          </p>

          <button
            className="primary-button"
            onClick={() => setScreen("studio")}
          >
            Launch GestureFlow
          </button>
        </div>
      </main>
    );
  }

  if (screen === "end") {
    return (
      <main className="page centered">
        <div className="intro">
          <h1>Session Complete</h1>
          <p>
            GestureFlow combines hand landmark recognition
            with real-time 3D computer graphics.
          </p>

          <button
            className="primary-button"
            onClick={() => setScreen("studio")}
          >
            Start Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <span className="eyebrow">GESTUREFLOW 3D</span>
          <h1>Gesture-Controlled Particle Studio</h1>
          <p>MediaPipe + Three.js + WebGL</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => setScreen("end")}
        >
          Finish Session
        </button>
      </header>

      <div className="studio-layout">
        <section className="scene-container">
          <ParticleScene
            running={running}
            pattern={pattern}
            color={color}
            handRef={handRef}
            mouseFallback={mouseFallback}
          />

          <div className="scene-label">
            LIVE 3D PARTICLES · HAND GESTURE CONTROL
          </div>
        </section>

        <aside className="control-panel">
          <h2>Hand Tracking</h2>

          {cameraEnabled ? (
            <HandTracker onGesture={handleGesture} />
          ) : (
            <div className="camera-disabled">
              Camera is disabled
            </div>
          )}

          <button
            className="secondary-button full-width"
            onClick={() => {
              setCameraEnabled(!cameraEnabled);
              handRef.current = null;
            }}
          >
            {cameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
          </button>

          <div className="instructions">
            <h3>Hand Gestures</h3>
            <p>✋ Open palm — Repel particles</p>
            <p>🤏 Pinch — Attract particles</p>
            <p>↔ Move hand — Move interaction point</p>
          </div>

          <h2>Graphics Controls</h2>

          <label htmlFor="pattern">Particle Pattern</label>
          <select
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          >
            <option value="galaxy">Galaxy</option>
            <option value="sphere">Sphere</option>
            <option value="spiral">Spiral</option>
          </select>

          <label htmlFor="color">Particle Color Tint</label>
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={mouseFallback}
              onChange={(e) =>
                setMouseFallback(e.target.checked)
              }
            />
            Enable mouse fallback
          </label>

          <div className="button-group">
            <button
              className="primary-button"
              onClick={() => setRunning(!running)}
            >
              {running ? "Pause" : "Resume"}
            </button>

            <button
              className="secondary-button"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </aside>
      </div>

      <footer className="footer">
        GestureFlow 3D · Artificial Intelligence for Visual Computing
      </footer>
    </main>
  );
}