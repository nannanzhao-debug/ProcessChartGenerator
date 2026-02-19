"use client";

import { ArrowDownUp, ArrowRightLeft, Undo2, Redo2 } from "lucide-react";
import ExportMenu from "./ExportMenu";
import type { LayoutDirection } from "@/lib/bpmn-types";
import type { ExportFormat } from "@/hooks/useExport";

interface ToolbarProps {
  direction: LayoutDirection;
  onDirectionChange: (dir: LayoutDirection) => void;
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
  hasNodes: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function Toolbar({
  direction,
  onDirectionChange,
  onExport,
  exporting,
  hasNodes,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ToolbarProps) {
  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
      {/* Undo / Redo */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center px-2 py-1.5 text-xs transition-colors text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Cmd+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center px-2 py-1.5 text-xs transition-colors text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Layout direction toggle */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => onDirectionChange("TB")}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
            direction === "TB"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
          title="Top to bottom"
        >
          <ArrowDownUp size={13} />
          TB
        </button>
        <button
          onClick={() => onDirectionChange("LR")}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
            direction === "LR"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
          title="Left to right"
        >
          <ArrowRightLeft size={13} />
          LR
        </button>
      </div>

      {/* Export dropdown */}
      <ExportMenu
        onExport={onExport}
        exporting={exporting}
        disabled={!hasNodes}
      />
    </div>
  );
}
