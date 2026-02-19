"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

export function useNodeLabelEdit(nodeId: string, initialLabel: string) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = useCallback(() => {
    setValue(initialLabel);
    setEditing(true);
  }, [initialLabel]);

  const commit = useCallback(() => {
    setEditing(false);
    if (value.trim() && value !== initialLabel) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label: value.trim() } } : n
        )
      );
    }
  }, [value, initialLabel, nodeId, setNodes]);

  const cancel = useCallback(() => {
    setEditing(false);
    setValue(initialLabel);
  }, [initialLabel]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        cancel();
      }
    },
    [commit, cancel]
  );

  return { editing, value, setValue, inputRef, startEditing, commit, cancel, onKeyDown };
}
