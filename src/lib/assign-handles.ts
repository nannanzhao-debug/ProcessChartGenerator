import type { Node, Edge } from "@xyflow/react";
import { NODE_DIMENSIONS } from "./constants";

/**
 * Computes the absolute position of a node by walking up the parent chain.
 */
function getAbsolutePosition(
  node: Node,
  nodeMap: Map<string, Node>
): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let current = node;

  while (current.parentId) {
    const parent = nodeMap.get(current.parentId);
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    current = parent;
  }

  return { x, y };
}

/**
 * Given the relative position of target to source, pick the best
 * source handle and target handle based on angle.
 */
function pickHandles(
  sourcePos: { x: number; y: number },
  sourceW: number,
  sourceH: number,
  targetPos: { x: number; y: number },
  targetW: number,
  targetH: number
): { sourceHandle: string; targetHandle: string } {
  // Center positions
  const sx = sourcePos.x + sourceW / 2;
  const sy = sourcePos.y + sourceH / 2;
  const tx = targetPos.x + targetW / 2;
  const ty = targetPos.y + targetH / 2;

  const dx = tx - sx;
  const dy = ty - sy;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180

  // Determine direction based on angle
  // Right: -45 to 45
  // Down: 45 to 135
  // Left: 135 to 180 or -180 to -135
  // Up: -135 to -45

  let sourceHandle: string;
  let targetHandle: string;

  if (angle >= -45 && angle < 45) {
    // Target is to the right
    sourceHandle = "source-right";
    targetHandle = "target-left";
  } else if (angle >= 45 && angle < 135) {
    // Target is below
    sourceHandle = "source-bottom";
    targetHandle = "target-top";
  } else if (angle >= -135 && angle < -45) {
    // Target is above
    sourceHandle = "source-top";
    targetHandle = "target-bottom";
  } else {
    // Target is to the left
    sourceHandle = "source-left";
    targetHandle = "target-right";
  }

  return { sourceHandle, targetHandle };
}

/**
 * After layout, iterate all edges and assign sourceHandle / targetHandle
 * based on the relative positions of connected nodes.
 */
export function assignHandles(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return edge;

    // Skip pool/lane nodes
    if (
      sourceNode.type === "pool" ||
      sourceNode.type === "lane" ||
      targetNode.type === "pool" ||
      targetNode.type === "lane"
    ) {
      return edge;
    }

    const sourceAbsPos = getAbsolutePosition(sourceNode, nodeMap);
    const targetAbsPos = getAbsolutePosition(targetNode, nodeMap);

    const sourceDims = NODE_DIMENSIONS[sourceNode.type || "task"] || {
      width: 180,
      height: 60,
    };
    const targetDims = NODE_DIMENSIONS[targetNode.type || "task"] || {
      width: 180,
      height: 60,
    };

    const { sourceHandle, targetHandle } = pickHandles(
      sourceAbsPos,
      sourceDims.width,
      sourceDims.height,
      targetAbsPos,
      targetDims.width,
      targetDims.height
    );

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });
}
