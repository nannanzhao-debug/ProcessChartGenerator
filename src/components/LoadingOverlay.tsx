"use client";

import { Loader2 } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Analyzing process...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Generating your BPMN diagram
          </p>
        </div>
      </div>
    </div>
  );
}
