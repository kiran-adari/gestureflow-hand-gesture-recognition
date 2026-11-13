
export function recognizeGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const distance = (a, b) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const wrist = landmarks[0];
  const thumb = landmarks[4];
  const index = landmarks[8];

  const palmSize = Math.max(
    distance(wrist, landmarks[9]),
    0.001
  );

  const pinchRatio = distance(thumb, index) / palmSize;

  const extended = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18],
  ].filter(([tip, joint]) =>
    distance(landmarks[tip], wrist) >
    distance(landmarks[joint], wrist) * 1.12
  ).length;

  let gesture = "neutral";

  if (pinchRatio < 0.38) {
    gesture = "pinch";
  } else if (extended >= 3) {
    gesture = "open";
  }

  return {
    gesture,
    x: 1 - index.x,
    y: index.y,
    pinchRatio,
  };
}