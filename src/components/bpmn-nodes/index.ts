import type { NodeTypes } from "@xyflow/react";
import StartEventNode from "./StartEventNode";
import EndEventNode from "./EndEventNode";
import IntermediateEventNode from "./IntermediateEventNode";
import TaskNode from "./TaskNode";
import GatewayNode from "./GatewayNode";
import SubProcessNode from "./SubProcessNode";
import PoolNode from "./PoolNode";
import LaneNode from "./LaneNode";
import AnnotationNode from "./AnnotationNode";

export const nodeTypes: NodeTypes = {
  startEvent: StartEventNode,
  endEvent: EndEventNode,
  intermediateEvent: IntermediateEventNode,
  task: TaskNode,
  gateway: GatewayNode,
  subProcess: SubProcessNode,
  pool: PoolNode,
  lane: LaneNode,
  annotation: AnnotationNode,
};
