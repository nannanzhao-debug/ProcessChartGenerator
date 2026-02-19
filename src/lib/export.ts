import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";

function getFlowElement(): HTMLElement {
  const el = document.querySelector(".react-flow__viewport") as HTMLElement;
  if (!el) throw new Error("Diagram viewport not found");
  return el;
}

export async function exportPng(): Promise<void> {
  const el = getFlowElement();
  const dataUrl = await toPng(el, {
    backgroundColor: "#fafbfc",
    pixelRatio: 2,
    filter: (node) => {
      // Exclude minimap and controls from export
      if (node.classList?.contains("react-flow__minimap")) return false;
      if (node.classList?.contains("react-flow__controls")) return false;
      return true;
    },
  });

  const link = document.createElement("a");
  link.download = "bpmn-diagram.png";
  link.href = dataUrl;
  link.click();
}

export async function exportSvg(): Promise<void> {
  const el = getFlowElement();
  const dataUrl = await toSvg(el, {
    backgroundColor: "#fafbfc",
    filter: (node) => {
      if (node.classList?.contains("react-flow__minimap")) return false;
      if (node.classList?.contains("react-flow__controls")) return false;
      return true;
    },
  });

  const link = document.createElement("a");
  link.download = "bpmn-diagram.svg";
  link.href = dataUrl;
  link.click();
}

export async function exportPdf(): Promise<void> {
  const el = getFlowElement();
  const dataUrl = await toPng(el, {
    backgroundColor: "#fafbfc",
    pixelRatio: 2,
    filter: (node) => {
      if (node.classList?.contains("react-flow__minimap")) return false;
      if (node.classList?.contains("react-flow__controls")) return false;
      return true;
    },
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [img.width / 2, img.height / 2],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, img.width / 2, img.height / 2);
  pdf.save("bpmn-diagram.pdf");
}
