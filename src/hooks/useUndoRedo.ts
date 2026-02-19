"use client";

import { useState, useCallback, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

export function useUndoRedo() {
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const currentRef = useRef<Snapshot | null>(null);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    if (currentRef.current) {
      setPast((p) => {
        const next = [...p, currentRef.current!];
        if (next.length > MAX_HISTORY) next.shift();
        return next;
      });
      setFuture([]);
    }
    currentRef.current = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
  }, []);

  const initSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    currentRef.current = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    setPast([]);
    setFuture([]);
  }, []);

  const undo = useCallback((): Snapshot | null => {
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    if (currentRef.current) {
      setFuture((f) => [currentRef.current!, ...f]);
    }
    currentRef.current = {
      nodes: JSON.parse(JSON.stringify(previous.nodes)),
      edges: JSON.parse(JSON.stringify(previous.edges)),
    };
    return previous;
  }, [past]);

  const redo = useCallback((): Snapshot | null => {
    if (future.length === 0) return null;
    const next = future[0];
    setFuture((f) => f.slice(1));
    if (currentRef.current) {
      setPast((p) => [...p, currentRef.current!]);
    }
    currentRef.current = {
      nodes: JSON.parse(JSON.stringify(next.nodes)),
      edges: JSON.parse(JSON.stringify(next.edges)),
    };
    return next;
  }, [future]);

  return {
    takeSnapshot,
    initSnapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
