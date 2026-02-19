import type { Node, Edge } from "@xyflow/react";

const OFFSET_STEP = 15;

/**
 * Groups edges by shared source node and assigns perpendicular offsets
 * to sibling edges so they don't overlap.
 */
export function computeEdgeOffsets(nodes: Node[], edges: Edge[]): Edge[] {
  // Group edges by source node
  const bySource = new Map<string, Edge[]>();
  for (const edge of edges) {
    const group = bySource.get(edge.source) || [];
    group.push(edge);
    bySource.set(edge.source, group);
  }

  return edges.map((edge) => {
    const siblings = bySource.get(edge.source) || [];
    if (siblings.length <= 1) return edge;

    const idx = siblings.indexOf(edge);
    const count = siblings.length;
    // Center the offsets around 0
    const offset = (idx - (count - 1) / 2) * OFFSET_STEP;

    return {
      ...edge,
      data: {
        ...((edge.data as Record<string, unknown>) || {}),
        sourceOffset: offset,
        targetOffset: offset,
      },
    };
  });
}
