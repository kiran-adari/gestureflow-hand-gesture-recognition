
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 2500;

function Particles({
  running,
  pattern,
  color,
  handRef,
  mouseFallback,
}) {
  const pointsRef = useRef();
  const cursorRef = useRef();

  const { positions, original, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const original = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      const t = i / COUNT;

      let x, y, z;

      if (pattern === "sphere") {
        const phi = Math.acos(1 - 2 * (i + 0.5) / COUNT);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        x = 2.6 * Math.sin(phi) * Math.cos(theta);
        y = 2.6 * Math.cos(phi);
        z = 2.6 * Math.sin(phi) * Math.sin(theta);
      } else if (pattern === "spiral") {
        const angle = t * Math.PI * 24;
        const radius = 0.3 + t * 3;

        x = Math.cos(angle) * radius;
        y = (t - 0.5) * 5;
        z = Math.sin(angle) * radius;
      } else {
        const arm = i % 4;
        const radius = Math.sqrt(t) * 3.5;
        const angle = radius * 1.7 + arm * Math.PI / 2;

        x = Math.cos(angle) * radius;
        y = (Math.random() - 0.5) * 0.45;
        z = Math.sin(angle) * radius;
      }

      positions[j] = x;
      positions[j + 1] = y;
      positions[j + 2] = z;

      original[j] = x;
      original[j + 1] = y;
      original[j + 2] = z;

      const c = new THREE.Color().setHSL(
        (0.55 + t * 0.75) % 1,
        0.95,
        0.65
      );

      colors[j] = c.r;
      colors[j + 1] = c.g;
      colors[j + 2] = c.b;
    }

    return { positions, original, colors };
  }, [pattern]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const hand = handRef.current;
    const usingHand = Boolean(hand);

    const targetX = usingHand
      ? (hand.x - 0.5) * 8
      : state.pointer.x * 4;

    const targetY = usingHand
      ? (0.5 - hand.y) * 6
      : state.pointer.y * 3;

    const active = usingHand || mouseFallback;

    const attract = usingHand
      ? hand.gesture === "pinch"
      : false;

    if (cursorRef.current) {
      cursorRef.current.visible = active;
      cursorRef.current.position.set(targetX, targetY, 0);
      cursorRef.current.material.color.set(
        attract ? "#00ffb3" : "#ff72d2"
      );
    }

    if (!running) return;

    const points = pointsRef.current;
    const array = points.geometry.attributes.position.array;
    const dt = Math.min(delta, 0.04);
    const time = state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      const dx = array[j] - targetX;
      const dy = array[j + 1] - targetY;

      const distanceSq = dx * dx + dy * dy + 0.25;
      const influence = active
        ? Math.exp(-distanceSq / 2.5)
        : 0;

      const force = attract ? -1 : 1;

      array[j] +=
        (original[j] - array[j]) * dt * 1.3 +
        dx * influence * force * dt * 4;

      array[j + 1] +=
        (original[j + 1] - array[j + 1]) * dt * 1.3 +
        dy * influence * force * dt * 4;

      array[j + 2] +=
        (original[j + 2] - array[j + 2]) * dt * 1.3 +
        Math.sin(time * 2 + i * 0.07) * dt * 0.06;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.rotation.y += dt * 0.07;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.06}
          color={color}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh ref={cursorRef} visible={false}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ff72d2" />
      </mesh>
    </>
  );
}

export default function ParticleScene({
  running,
  pattern,
  color,
  handRef,
  mouseFallback,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#050816"]} />

      <Particles
        key={pattern}
        running={running}
        pattern={pattern}
        color={color}
        handRef={handRef}
        mouseFallback={mouseFallback}
      />
    </Canvas>
  );
}