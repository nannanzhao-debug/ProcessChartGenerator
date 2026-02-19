"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  reconnectEdge,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnReconnect,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./bpmn-nodes";
import { edgeTypes } from "@/edges";
import { useCallback, useRef, useState, type DragEvent } from "react";
import { assignHandles } from "@/lib/assign-handles";
import { computeEdgeOffsets } from "@/lib/compute-edge-offsets";
import { NODE_DIMENSIONS } from "@/lib/constants";

interface DiagramPanelProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  takeSnapshot: (nodes: Node[], edges: Edge[]) => void;
}

let nodeIdCounter = 0;

function DiagramPanelInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  setEdges,
  takeSnapshot,
}: DiagramPanelProps) {
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const edgeReconnectSuccessful = useRef(true);
  const [connecting, setConnecting] = useState(false);

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => connection.source !== connection.target,
    []
  );

  // Re-run handle assignment for edges connected to moved nodes
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      takeSnapshot(nodes, edges);

      // Find edges connected to the dragged node
      const affectedEdges = currentEdges.filter(
        (e) => e.source === draggedNode.id || e.target === draggedNode.id
      );
      if (affectedEdges.length === 0) return;

      const affectedIds = new Set(affectedEdges.map((e) => e.id));
      const otherEdges = currentEdges.filter((e) => !affectedIds.has(e.id));

      const reassigned = assignHandles(currentNodes, affectedEdges);
      const allEdges = [...otherEdges, ...reassigned];
      const finalEdges = computeEdgeOffsets(currentNodes, allEdges);

      setEdges(finalEdges);
    },
    [getNodes, getEdges, setEdges, takeSnapshot, nodes, edges]
  );

  // Edge reconnection
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      edgeReconnectSuccessful.current = true;
      takeSnapshot(nodes, edges);
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
    },
    [setEdges, takeSnapshot, nodes, edges]
  );

  const onReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        takeSnapshot(nodes, edges);
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges, takeSnapshot, nodes, edges]
  );

  // Drag-and-drop from palette
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-type");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      takeSnapshot(nodes, edges);

      const dims = NODE_DIMENSIONS[type] || { width: 180, height: 60 };
      const newNode: Node = {
        id: `dropped_${type}_${++nodeIdCounter}`,
        type,
        position: {
          x: position.x - dims.width / 2,
          y: position.y - dims.height / 2,
        },
        data: { label: type === "startEvent" ? "Start" : type === "endEvent" ? "End" : "New" },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, takeSnapshot, nodes, edges]
  );

  // Delete handler with snapshot
  const onBeforeDelete = useCallback(async () => {
    takeSnapshot(nodes, edges);
    return true;
  }, [takeSnapshot, nodes, edges]);

  return (
    <div style={{ width: "100%", height: "100%" }} className={connecting ? "connecting" : undefined}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => setConnecting(true)}
        onConnectEnd={() => setConnecting(false)}
        onNodeDragStop={onNodeDragStop}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onBeforeDelete={onBeforeDelete}
        isValidConnection={isValidConnection}
        connectionRadius={25}
        connectOnClick={true}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={{
          type: "sequenceFlow",
          markerEnd: { type: "arrowclosed" as never, color: "#64748b" },
          reconnectable: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "startEvent":
                return "#22c55e";
              case "endEvent":
                return "#ef4444";
              case "intermediateEvent":
                return "#f59e0b";
              case "gateway":
                return "#f59e0b";
              case "subProcess":
                return "#3b82f6";
              case "pool":
                return "#1e293b";
              case "lane":
                return "#f1f5f9";
              default:
                return "#e2e8f0";
            }
          }}
          maskColor="rgba(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}

export default function DiagramPanel(props: DiagramPanelProps) {
  return <DiagramPanelInner {...props} />;
}
