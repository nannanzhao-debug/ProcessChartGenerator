"use client";

import { useEffect, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useBpmnFlow } from "@/hooks/useBpmnFlow";
import { useExport } from "@/hooks/useExport";
import DiagramPanel from "@/components/DiagramPanel";
import InputPanel from "@/components/InputPanel";
import Toolbar from "@/components/Toolbar";
import LoadingOverlay from "@/components/LoadingOverlay";
import NodePalette from "@/components/NodePalette";
import { AlertCircle, X } from "lucide-react";

export default function Home() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    loading,
    error,
    setError,
    direction,
    changeDirection,
    parseAndLoad,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBpmnFlow();

  const { exporting, handleExport } = useExport();

  const handleSubmit = (text: string, imageBase64?: string) => {
    parseAndLoad(text, imageBase64);
  };

  // Keyboard shortcuts for undo/redo
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Left panel — input */}
        <div className="w-[360px] min-w-[320px] max-w-[420px] border-r border-slate-200 flex-shrink-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <InputPanel onSubmit={handleSubmit} loading={loading} />
          </div>
          {nodes.length > 0 && <NodePalette />}
        </div>

        {/* Right panel — diagram */}
        <div className="flex-1 relative bg-[#fafbfc]">
          {/* Toolbar */}
          <Toolbar
            direction={direction}
            onDirectionChange={changeDirection}
            onExport={handleExport}
            exporting={exporting}
            hasNodes={nodes.length > 0}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />

          {/* Error banner */}
          {error && (
            <div className="absolute top-3 left-3 right-[280px] z-20 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Empty state */}
          {nodes.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-slate-400"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <circle cx="15.5" cy="15.5" r="1.5" />
                    <path d="M10 8.5h4.5a1 1 0 0 1 1 1V14" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  No diagram yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Enter a process description or upload an image to get started
                </p>
              </div>
            </div>
          )}

          {/* Diagram */}
          <DiagramPanel
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            setNodes={setNodes}
            setEdges={setEdges}
            takeSnapshot={takeSnapshot}
          />

          {/* Loading overlay */}
          {loading && <LoadingOverlay />}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
