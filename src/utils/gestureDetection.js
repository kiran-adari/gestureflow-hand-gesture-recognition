
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isPinching(landmarks, wasPinching = false) {
  const thumb = landmarks[4];
  const index = landmarks[8];

  const palmWidth = distance(landmarks[5], landmarks[17]);
  const pinchDistance = distance(thumb, index);

  const ratio = pinchDistance / Math.max(palmWidth, 0.001);

  return wasPinching ? ratio < 0.55 : ratio < 0.35;
}

export function getCursorPosition(landmarks, width, height) {
  const indexTip = landmarks[8];

  return {
    x: (1 - indexTip.x) * width,
    y: indexTip.y * height,
  };
}
