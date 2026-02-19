import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type { LayoutDirection } from "./bpmn-types";
import { NODE_DIMENSIONS } from "./constants";
import { assignHandles } from "./assign-handles";
import { computeEdgeOffsets } from "./compute-edge-offsets";

const POOL_HEADER_WIDTH = 36;
const LANE_HEADER_WIDTH = 30;
const LANE_PADDING = { top: 30, bottom: 30, left: 50, right: 40 };

interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = "TB"
): LayoutResult {
  // Separate pool/lane nodes from regular nodes
  const poolNodes = nodes.filter((n) => n.type === "pool");
  const laneNodes = nodes.filter((n) => n.type === "lane");
  const contentNodes = nodes.filter(
    (n) => n.type !== "pool" && n.type !== "lane"
  );

  if (poolNodes.length === 0) {
    // Simple layout — no pools/lanes
    return applySimpleLayout(nodes, edges, direction);
  }

  // Pool-aware layout
  return applyPoolLayout(
    poolNodes,
    laneNodes,
    contentNodes,
    edges,
    direction
  );
}

function applySimpleLayout(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  });

  for (const node of nodes) {
    const dims = NODE_DIMENSIONS[node.type || "task"] || {
      width: 180,
      height: 60,
    };
    g.setNode(node.id, { width: dims.width, height: dims.height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const dims = NODE_DIMENSIONS[node.type || "task"] || {
      width: 180,
      height: 60,
    };
    return {
      ...node,
      position: {
        x: pos.x - dims.width / 2,
        y: pos.y - dims.height / 2,
      },
    };
  });

  const handledEdges = assignHandles(layoutedNodes, edges);
  const finalEdges = computeEdgeOffsets(layoutedNodes, handledEdges);
  return { nodes: layoutedNodes, edges: finalEdges };
}

function applyPoolLayout(
  poolNodes: Node[],
  laneNodes: Node[],
  contentNodes: Node[],
  edges: Edge[],
  direction: LayoutDirection
): LayoutResult {
  const allLayoutedNodes: Node[] = [];
  let poolOffsetY = 0;

  for (const pool of poolNodes) {
    // Find lanes belonging to this pool
    const lanes = laneNodes.filter((l) => l.parentId === pool.id);

    // If no lanes, create a virtual one with all content nodes for this pool
    const effectiveLanes =
      lanes.length > 0
        ? lanes
        : [
            {
              id: `${pool.id}_default_lane`,
              type: "lane" as const,
              data: { label: "" },
              position: { x: 0, y: 0 },
              parentId: pool.id,
            },
          ];

    let laneOffsetY = 0;
    const laneResults: {
      lane: Node;
      nodes: Node[];
      width: number;
      height: number;
    }[] = [];

    for (const lane of effectiveLanes) {
      // Find content nodes in this lane
      const laneContentNodes = contentNodes.filter(
        (n) => n.parentId === lane.id
      );

      if (laneContentNodes.length === 0) {
        laneResults.push({
          lane,
          nodes: [],
          width: 400,
          height: 120,
        });
        continue;
      }

      // Layout nodes within the lane using dagre
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({
        rankdir: direction,
        nodesep: 50,
        ranksep: 70,
        marginx: LANE_PADDING.left,
        marginy: LANE_PADDING.top,
      });

      for (const node of laneContentNodes) {
        const dims = NODE_DIMENSIONS[node.type || "task"] || {
          width: 180,
          height: 60,
        };
        g.setNode(node.id, { width: dims.width, height: dims.height });
      }

      // Add edges that connect nodes within this lane
      const laneNodeIds = new Set(laneContentNodes.map((n) => n.id));
      for (const edge of edges) {
        if (laneNodeIds.has(edge.source) && laneNodeIds.has(edge.target)) {
          g.setEdge(edge.source, edge.target);
        }
      }

      dagre.layout(g);

      let maxX = 0;
      let maxY = 0;
      const layoutedLaneNodes = laneContentNodes.map((node) => {
        const pos = g.node(node.id);
        const dims = NODE_DIMENSIONS[node.type || "task"] || {
          width: 180,
          height: 60,
        };
        const x = pos.x - dims.width / 2 + LANE_HEADER_WIDTH;
        const y = pos.y - dims.height / 2;
        maxX = Math.max(maxX, x + dims.width);
        maxY = Math.max(maxY, y + dims.height);
        return {
          ...node,
          position: { x, y },
        };
      });

      const laneWidth = maxX + LANE_PADDING.right;
      const laneHeight = maxY + LANE_PADDING.bottom;

      laneResults.push({
        lane,
        nodes: layoutedLaneNodes,
        width: laneWidth,
        height: Math.max(laneHeight, 120),
      });
    }

    // Normalize lane widths to the max
    const maxLaneWidth = Math.max(...laneResults.map((r) => r.width), 600);

    // Build pool and lane nodes
    let poolHeight = 0;
    for (const result of laneResults) {
      const laneNode: Node = {
        ...result.lane,
        type: "lane",
        position: {
          x: POOL_HEADER_WIDTH,
          y: laneOffsetY,
        },
        parentId: pool.id,
        data: {
          ...result.lane.data,
          width: maxLaneWidth,
          height: result.height,
        },
        style: {
          width: maxLaneWidth,
          height: result.height,
        },
        draggable: false,
        selectable: false,
        deletable: false,
      };
      allLayoutedNodes.push(laneNode);

      // Position content nodes relative to their lane
      for (const node of result.nodes) {
        allLayoutedNodes.push({
          ...node,
          parentId: result.lane.id,
          extent: "parent" as const,
        });
      }

      laneOffsetY += result.height;
      poolHeight += result.height;
    }

    const poolWidth = maxLaneWidth + POOL_HEADER_WIDTH;

    const poolNode: Node = {
      ...pool,
      type: "pool",
      position: { x: 40, y: poolOffsetY },
      data: {
        ...pool.data,
        width: poolWidth,
        height: poolHeight,
      },
      style: {
        width: poolWidth,
        height: poolHeight,
      },
      draggable: true,
      selectable: false,
      deletable: false,
    };
    allLayoutedNodes.unshift(poolNode);

    poolOffsetY += poolHeight + 60;
  }

  const handledEdges = assignHandles(allLayoutedNodes, edges);
  const finalEdges = computeEdgeOffsets(allLayoutedNodes, handledEdges);
  return { nodes: allLayoutedNodes, edges: finalEdges };
}
