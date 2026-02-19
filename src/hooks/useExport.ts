"use client";

import { useState, useCallback } from "react";
import { exportPng, exportSvg, exportPdf } from "@/lib/export";

export type ExportFormat = "png" | "svg" | "pdf";

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setExporting(true);
    try {
      switch (format) {
        case "png":
          await exportPng();
          break;
        case "svg":
          await exportSvg();
          break;
        case "pdf":
          await exportPdf();
          break;
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, handleExport };
}
