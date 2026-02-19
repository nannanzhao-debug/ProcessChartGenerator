"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";

export default function SequenceFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const sourceOffset = ((data as Record<string, unknown>)?.sourceOffset as number) || 0;
  const targetOffset = ((data as Record<string, unknown>)?.targetOffset as number) || 0;
  const { setEdges } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState((label as string) || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    setEdges((eds) =>
      eds.map((e) => (e.id === id ? { ...e, label: value.trim() || undefined } : e))
    );
  }, [id, value, setEdges]);

  const cancel = useCallback(() => {
    setEditing(false);
    setValue((label as string) || "");
  }, [label]);

  const strokeColor = selected ? "#3b82f6" : "#64748b";
  const markerId = `seq-arrow-${id}`;

  let adjSourceX = sourceX;
  let adjSourceY = sourceY;
  let adjTargetX = targetX;
  let adjTargetY = targetY;

  if (sourcePosition === "top" || sourcePosition === "bottom") {
    adjSourceX += sourceOffset;
  } else {
    adjSourceY += sourceOffset;
  }

  if (targetPosition === "top" || targetPosition === "bottom") {
    adjTargetX += targetOffset;
  } else {
    adjTargetY += targetOffset;
  }

  // Extend endpoints slightly into nodes so the visible edge
  // appears flush with the node boundary (nodes render above edges).
  // Direction is inward: opposite to the handle's position side.
  const EXT = 5;
  if (sourcePosition === "top") adjSourceY += EXT;
  else if (sourcePosition === "bottom") adjSourceY -= EXT;
  else if (sourcePosition === "left") adjSourceX += EXT;
  else if (sourcePosition === "right") adjSourceX -= EXT;

  if (targetPosition === "top") adjTargetY += EXT;
  else if (targetPosition === "bottom") adjTargetY -= EXT;
  else if (targetPosition === "left") adjTargetX += EXT;
  else if (targetPosition === "right") adjTargetX -= EXT;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: adjSourceX,
    sourceY: adjSourceY,
    targetX: adjTargetX,
    targetY: adjTargetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="-10 -10 20 20"
          markerWidth="14"
          markerHeight="14"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            points="-5,-3.5 0,0 -5,3.5 -5,-3.5"
            fill={strokeColor}
            stroke="none"
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
        interactionWidth={20}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 1.5,
        }}
      />
      {(label || editing) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "white",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              color: "#475569",
              border: "1px solid #e2e8f0",
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            onDoubleClick={() => {
              setValue((label as string) || "");
              setEditing(true);
            }}
          >
            {editing ? (
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") cancel();
                }}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#475569",
                  width: 80,
                  textAlign: "center",
                }}
              />
            ) : (
              label
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
