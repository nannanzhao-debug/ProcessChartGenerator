"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Image, FileCode, FileText, Loader2 } from "lucide-react";
import type { ExportFormat } from "@/hooks/useExport";

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
  disabled: boolean;
}

const FORMATS: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { format: "png", label: "PNG (High-res)", icon: <Image size={14} /> },
  { format: "svg", label: "SVG (Vector)", icon: <FileCode size={14} /> },
  { format: "pdf", label: "PDF (Landscape)", icon: <FileText size={14} /> },
];

export default function ExportMenu({ onExport, exporting, disabled }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled || exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        Export
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {FORMATS.map(({ format, label, icon }) => (
            <button
              key={format}
              onClick={() => {
                onExport(format);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
