import type { Node, Edge } from "@xyflow/react";
import type { BpmnDiagram } from "./bpmn-types";

interface ParseResult {
  nodes: Node[];
  edges: Edge[];
}

export function parseBpmnResponse(raw: string): ParseResult {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let diagram: BpmnDiagram;
  try {
    diagram = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse AI response as JSON. Please try again.");
  }

  // Validate basic structure
  if (!diagram.nodes || !Array.isArray(diagram.nodes)) {
    throw new Error("Invalid response: missing nodes array");
  }
  if (!diagram.edges || !Array.isArray(diagram.edges)) {
    throw new Error("Invalid response: missing edges array");
  }

  // Build node-to-lane mapping
  const nodeToLane = new Map<string, string>();
  const nodeToPool = new Map<string, string>();
  const pools = diagram.pools || [];

  for (const pool of pools) {
    for (const lane of pool.lanes || []) {
      for (const nodeId of lane.nodeIds || []) {
        nodeToLane.set(nodeId, lane.id);
        nodeToPool.set(nodeId, pool.id);
      }
    }
  }

  const rfNodes: Node[] = [];

  // Create pool nodes
  for (const pool of pools) {
    rfNodes.push({
      id: pool.id,
      type: "pool",
      data: { label: pool.label },
      position: { x: 0, y: 0 },
    });

    // Create lane nodes
    for (const lane of pool.lanes || []) {
      rfNodes.push({
        id: lane.id,
        type: "lane",
        data: { label: lane.label },
        position: { x: 0, y: 0 },
        parentId: pool.id,
      });
    }
  }

  // Create content nodes
  for (const node of diagram.nodes) {
    const rfNode: Node = {
      id: node.id,
      type: node.type,
      data: {
        label: node.label,
        ...(node.gatewayKind ? { gatewayKind: node.gatewayKind } : {}),
      },
      position: { x: 0, y: 0 },
    };

    // Set parent to lane if applicable
    const laneId = nodeToLane.get(node.id);
    if (laneId) {
      rfNode.parentId = laneId;
      rfNode.extent = "parent";
    }

    rfNodes.push(rfNode);
  }

  // Create edges
  const rfEdges: Edge[] = diagram.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || "sequenceFlow",
    label: edge.label,
    markerEnd: { type: "arrowclosed" as const, color: "#64748b" },
    animated: edge.type === "messageFlow",
  }));

  return { nodes: rfNodes, edges: rfEdges };
}
