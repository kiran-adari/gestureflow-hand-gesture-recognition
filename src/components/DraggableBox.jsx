
export default function DraggableBox({
  position,
  isDragging,
}) {
  return (
    <div
      className={`draggable-box ${isDragging ? "dragging" : ""}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <span className="box-icon">✦</span>
      <strong>Gesture Box</strong>
      <small>
        {isDragging ? "Dragging..." : "Pinch to grab"}
      </small>
    </div>
  );
}
