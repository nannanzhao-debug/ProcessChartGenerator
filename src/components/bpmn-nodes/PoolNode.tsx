"use client";

import { type NodeProps } from "@xyflow/react";
import styles from "./styles.module.css";

export default function PoolNode({ data }: NodeProps) {
  return (
    <div className={styles.pool} style={{ width: data.width as number, height: data.height as number }}>
      <div className={styles.poolHeader}>
        <span className={styles.poolHeaderText}>{data.label as string}</span>
      </div>
    </div>
  );
}
