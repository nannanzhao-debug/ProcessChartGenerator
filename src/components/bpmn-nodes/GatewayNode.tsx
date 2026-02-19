"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import styles from "./styles.module.css";
import type { GatewayKind } from "@/lib/bpmn-types";
import { useNodeLabelEdit } from "@/hooks/useInlineEdit";

const GATEWAY_ICONS: Record<GatewayKind, string> = {
  exclusive: "✕",
  parallel: "+",
  inclusive: "○",
};

export default function GatewayNode({ id, data }: NodeProps) {
  const kind = (data.gatewayKind as GatewayKind) || "exclusive";
  const label = data.label as string;
  const { editing, value, setValue, inputRef, startEditing, commit, onKeyDown } =
    useNodeLabelEdit(id, label);

  return (
    <div className={styles.gateway}>
      <span className={styles.gatewayIcon}>{GATEWAY_ICONS[kind]}</span>
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          className={`nodrag ${styles.inlineInput} ${styles.inlineInputGateway}`}
        />
      ) : (
        <div className={styles.gatewayLabel} onDoubleClick={startEditing}>
          {label}
        </div>
      )}
      {/* Handles at diamond tips (corners of the unrotated box) */}
      <Handle type="source" position={Position.Top} id="source-top" style={{ left: 0 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ top: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ left: '100%' }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ top: '100%' }} />
      <Handle type="target" position={Position.Top} id="target-top" style={{ left: 0 }} />
      <Handle type="target" position={Position.Right} id="target-right" style={{ top: 0 }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ left: '100%' }} />
      <Handle type="target" position={Position.Left} id="target-left" style={{ top: '100%' }} />
    </div>
  );
}
