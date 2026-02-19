"use client";

import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
  addEdge,
} from "@xyflow/react";
import { applyLayout } from "@/lib/layout";
import { parseBpmnResponse } from "@/lib/parse-response";
import type { LayoutDirection } from "@/lib/bpmn-types";
import { useUndoRedo } from "./useUndoRedo";

export function useBpmnFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<LayoutDirection>("TB");

  const {
    takeSnapshot,
    initSnapshot,
    undo: undoAction,
    redo: redoAction,
    canUndo,
    canRedo,
  } = useUndoRedo();

  const onConnect: OnConnect = useCallback(
    (params) => {
      takeSnapshot(nodes, edges);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, takeSnapshot, nodes, edges]
  );

  const loadDiagram = useCallback(
    (rawNodes: Node[], rawEdges: Edge[], dir?: LayoutDirection) => {
      const d = dir || direction;
      const { nodes: layouted, edges: layoutedEdges } = applyLayout(
        rawNodes,
        rawEdges,
        d
      );
      setNodes(layouted);
      setEdges(layoutedEdges);
      initSnapshot(layouted, layoutedEdges);
    },
    [direction, setNodes, setEdges, initSnapshot]
  );

  const parseAndLoad = useCallback(
    async (input: string, imageBase64?: string) => {
      setLoading(true);
      setError(null);

      try {
        const body: Record<string, string> = {};
        if (imageBase64) {
          body.image = imageBase64;
        } else {
          body.text = input;
        }

        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `API error: ${res.status}`
          );
        }

        const data = await res.json();
        const { nodes: parsed, edges: parsedEdges } = parseBpmnResponse(
          JSON.stringify(data)
        );
        loadDiagram(parsed, parsedEdges);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [loadDiagram]
  );

  const changeDirection = useCallback(
    (newDir: LayoutDirection) => {
      setDirection(newDir);
      if (nodes.length > 0) {
        const { nodes: relayouted, edges: relayoutedEdges } = applyLayout(
          nodes,
          edges,
          newDir
        );
        setNodes(relayouted);
        setEdges(relayoutedEdges);
        initSnapshot(relayouted, relayoutedEdges);
      }
    },
    [nodes, edges, setNodes, setEdges, initSnapshot]
  );

  const undo = useCallback(() => {
    const snapshot = undoAction();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
    }
  }, [undoAction, setNodes, setEdges]);

  const redo = useCallback(() => {
    const snapshot = redoAction();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
    }
  }, [redoAction, setNodes, setEdges]);

  return {
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
    loadDiagram,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
