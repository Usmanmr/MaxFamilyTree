import { EdgeProps, getSmoothStepPath, getBezierPath, getStraightPath, EdgeLabelRenderer } from 'reactflow';
import { Heart } from 'lucide-react';

export function SpouseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path cursor-pointer"
      d={edgePath}
      strokeWidth={2.5}
      stroke="#e74c3c"
      fill="none"
      style={{
        transition: 'stroke 0.2s',
      }}
    />
  );
}

export function ParentChildEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path cursor-pointer"
      d={edgePath}
      strokeWidth={2}
      stroke="#64748b"
      fill="none"
      markerEnd="url(#arrow-parent)"
    />
  );
}

export function SiblingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path cursor-pointer"
      d={edgePath}
      strokeWidth={1.5}
      stroke="#94a3b8"
      strokeDasharray="5 5"
      fill="none"
    />
  );
}

export function AdoptiveEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path cursor-pointer"
        d={edgePath}
        strokeWidth={2}
        stroke="#3b82f6"
        strokeDasharray="2 4"
        fill="none"
        markerEnd="url(#arrow-adoptive)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="bg-white border border-[#3b82f6]/20 px-2 py-0.5 rounded-full text-[10px] text-[#3b82f6] font-medium shadow-sm cursor-pointer"
        >
          Adoptive
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path cursor-pointer"
        d={edgePath}
        strokeWidth={2}
        stroke="#3b82f6"
        strokeDasharray="2 4"
        fill="none"
        markerEnd="url(#arrow-step)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="bg-white border border-[#3b82f6]/20 px-2 py-0.5 rounded-full text-[10px] text-[#3b82f6] font-medium shadow-sm cursor-pointer"
        >
          Step
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
