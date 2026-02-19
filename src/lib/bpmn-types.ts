export type BpmnNodeType =
  | "startEvent"
  | "endEvent"
  | "intermediateEvent"
  | "task"
  | "gateway"
  | "subProcess"
  | "pool"
  | "lane"
  | "annotation";

export type GatewayKind = "exclusive" | "parallel" | "inclusive";

export interface BpmnNode {
  id: string;
  type: BpmnNodeType;
  label: string;
  gatewayKind?: GatewayKind;
  /** ID of parent lane or pool */
  parentId?: string;
}

export interface BpmnEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: "sequenceFlow" | "messageFlow";
}

export interface BpmnLane {
  id: string;
  label: string;
  /** Node IDs that belong to this lane */
  nodeIds: string[];
}

export interface BpmnPool {
  id: string;
  label: string;
  lanes: BpmnLane[];
}

export interface BpmnDiagram {
  nodes: BpmnNode[];
  edges: BpmnEdge[];
  pools: BpmnPool[];
}

export type LayoutDirection = "TB" | "LR";
