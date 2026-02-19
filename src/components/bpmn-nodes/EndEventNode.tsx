"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import styles from "./styles.module.css";
import { useNodeLabelEdit } from "@/hooks/useInlineEdit";

export default function EndEventNode({ id, data }: NodeProps) {
  const label = data.label as string;
  const { editing, value, setValue, inputRef, startEditing, commit, onKeyDown } =
    useNodeLabelEdit(id, label);

  return (
    <div className={styles.endEvent}>
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
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Right} id="target-right" />
    </div>
  );
}
