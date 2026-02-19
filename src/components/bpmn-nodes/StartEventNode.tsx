"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import styles from "./styles.module.css";
import { useNodeLabelEdit } from "@/hooks/useInlineEdit";

export default function StartEventNode({ id, data }: NodeProps) {
  const label = data.label as string;
  const { editing, value, setValue, inputRef, startEditing, commit, onKeyDown } =
    useNodeLabelEdit(id, label);

  return (
    <div className={styles.startEvent}>
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          className={`nodrag ${styles.inlineInput} ${styles.inlineInputSmall}`}
        />
      ) : (
        <div className={styles.nodeLabel} onDoubleClick={startEditing}>
          {label}
        </div>
      )}
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  );
}
