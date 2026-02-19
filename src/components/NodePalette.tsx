"use client";

import type { DragEvent } from "react";

const PALETTE_ITEMS = [
  { type: "startEvent", label: "Start", color: "#22c55e", shape: "circle" },
  { type: "endEvent", label: "End", color: "#ef4444", shape: "circle" },
  { type: "task", label: "Task", color: "#3b82f6", shape: "rect" },
  { type: "gateway", label: "Gateway", color: "#f59e0b", shape: "diamond" },
  {
    type: "intermediateEvent",
    label: "Event",
    color: "#f59e0b",
    shape: "circle",
  },
  { type: "subProcess", label: "Sub-Proc", color: "#3b82f6", shape: "rect" },
  {
    type: "annotation",
    label: "Note",
    color: "#94a3b8",
    shape: "rect",
  },
];

function ShapeIcon({
  shape,
  color,
}: {
  shape: string;
  color: string;
}) {
  if (shape === "circle") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (shape === "diamond") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <rect
          x="4"
          y="4"
          width="11"
          height="11"
          fill="none"
          stroke={color}
          strokeWidth="2"
          transform="rotate(45 9.5 9.5)"
        />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="3"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export default function NodePalette() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow-type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="border-t border-slate-200 px-4 py-3">
      <p className="text-xs font-medium text-slate-500 mb-2">
        Drag to add nodes
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            className="flex flex-col items-center gap-1 p-1.5 rounded-md border border-slate-200 bg-white cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
          >
            <ShapeIcon shape={item.shape} color={item.color} />
            <span className="text-[10px] text-slate-500 leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
