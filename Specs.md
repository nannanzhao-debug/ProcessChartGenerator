# Process Charter — Specifications

## Overview

Process Charter is a BPMN diagram generator that converts text descriptions or images of business processes into interactive, editable BPMN diagrams using AI-powered analysis (Anthropic Claude via AWS Bedrock).

## Core Features

### AI-Powered Diagram Generation
- Text input: describe a business process in natural language
- Image input: upload a process diagram or sketch for conversion
- Backend parses input via Claude and returns structured BPMN JSON
- Generated structure is rendered as an interactive ReactFlow diagram

### BPMN Node Types
- **Start Event** — green circle, process entry point
- **End Event** — red circle with thick border, process exit point
- **Intermediate Event** — orange double-ring circle, mid-process event
- **Task** — rounded rectangle, an activity or step
- **Gateway** — orange diamond (exclusive, parallel, inclusive), decision/merge point
- **Sub-Process** — dashed-bottom rectangle, nested process
- **Pool** — horizontal container with vertical header, organizational boundary
- **Lane** — horizontal strip within a pool, role subdivision
- **Annotation** — left-bracketed italic text, notes

### Drag-and-Drop Palette
- Palette panel appears after diagram generation
- All BPMN element types available for drag-and-drop onto the canvas
- Nodes are centered on the drop position

### Layout
- Automatic layout via Dagre graph layout engine
- Multiple layout directions (top-to-bottom, left-to-right, etc.)

### Undo/Redo
- Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo
- Snapshots taken before node drags, edge operations, drops, and deletions

### Export
- Export diagrams as images or PDFs

---

## Connector Interaction Requirements

### Creating Connections
- **Drag-to-connect**: drag from a source handle to a target handle to create an edge
- **Click-to-connect**: click a source handle, then click a target handle (no drag required); enabled via `connectOnClick`
- **Self-loop prevention**: connections from a node to itself are rejected via `isValidConnection`

### Handle Visibility
- Handles are hidden by default (`opacity: 0`, 8px)
- Handles appear on node hover or node selection
- **During connection drag**: all handles on all nodes become visible, enlarged to 12px, with blue fill and white border (`.connecting` class toggled via `onConnectStart`/`onConnectEnd`)
- **Valid target glow**: handles that are valid connection targets show green fill (`[data-valid]` attribute)

### Snap-to-Handle
- `connectionRadius={25}` — when dragging an edge endpoint within 25px of a valid handle, the connection snaps to it
- Applies to both new connections and reconnections

### Edge Selection and Hover
- Click an edge to select it — stroke turns blue (#3b82f6), width increases to 2.5px
- Hover over an edge — subtle blue highlight, width 2px
- Selected edges can be deleted with Backspace or Delete key
- Wider click target (`interactionWidth={20}`) for easier selection

### Edge Reconnection
- Edges are reconnectable (`reconnectable: true` in default edge options)
- Drag an edge endpoint to move it to a different handle
- If reconnection fails (dropped in empty space), the edge is deleted
- **Larger grab area**: edge reconnection handles (`.react-flow__edgeupdater`) have `r: 20` for a 40px diameter invisible grab zone
- **Visual indicator**: on edge hover or selection, reconnection handles show as semi-transparent blue circles

### Gateway Handle Positions
- Gateway handles are positioned at the four diamond tips (corners of the rotated square), not at the side midpoints
- Top tip: `style={{ left: 0 }}` on Position.Top
- Right tip: `style={{ top: 0 }}` on Position.Right
- Bottom tip: `style={{ left: '100%' }}` on Position.Bottom
- Left tip: `style={{ top: '100%' }}` on Position.Left

### Edge Endpoint Precision
- Edge endpoints extend 2px into the node boundary so the visible edge appears flush with the node shape (nodes render above edges in z-order, hiding the overlap)
- Extension direction is inward based on handle position (e.g., Position.Top extends upward toward the node interior)
- Custom SVG arrow markers per edge with `markerUnits="userSpaceOnUse"` for consistent 14px sizing regardless of stroke width
- Sharp arrowhead polygon (polyline `-5,-3.5 0,0 -5,3.5`) with fill matching edge stroke color

### Edge Types
- **Sequence Flow**: solid line, smooth step path with 8px border radius, arrow marker at target
- **Message Flow**: dashed line (`strokeDasharray: "6 3"`), same path and marker style

### Edge Labels
- Double-click edge label area to edit inline
- Labels display with white background, light border, positioned at path midpoint
- Enter to commit, Escape to cancel, blur to commit

### Automatic Handle Assignment
- `assignHandles()` picks source/target handles based on the angle between connected node centers
- Four quadrants: right (-45° to 45°), down (45° to 135°), up (-135° to -45°), left (remainder)
- Re-runs on node drag stop for edges connected to the moved node

### Edge Offset Spreading
- `computeEdgeOffsets()` spreads multiple edges sharing the same handle along the node boundary to prevent overlap
