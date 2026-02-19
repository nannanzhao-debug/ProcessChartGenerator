import type { EdgeTypes } from "@xyflow/react";
import SequenceFlowEdge from "./SequenceFlowEdge";
import MessageFlowEdge from "./MessageFlowEdge";

export const edgeTypes: EdgeTypes = {
  sequenceFlow: SequenceFlowEdge,
  messageFlow: MessageFlowEdge,
};
