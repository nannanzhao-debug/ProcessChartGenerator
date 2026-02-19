"use client";

import { type NodeProps } from "@xyflow/react";
import styles from "./styles.module.css";

export default function LaneNode({ data }: NodeProps) {
  return (
    <div className={styles.lane} style={{ width: data.width as number, height: data.height as number }}>
      <div className={styles.laneHeader}>
        <span className={styles.laneHeaderText}>{data.label as string}</span>
      </div>
    </div>
  );
}
