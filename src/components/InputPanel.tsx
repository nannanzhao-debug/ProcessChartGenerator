"use client";

import { useState, useCallback } from "react";
import { FileText, Image as ImageIcon, Play, Sparkles } from "lucide-react";
import ImageUploader from "./ImageUploader";

type InputMode = "text" | "image";

const DEMO_TEXT = `Employee submits expense report. Manager reviews the expense report. If approved, Finance processes payment and employee receives confirmation. If rejected, employee is notified of rejection with reason and may resubmit.`;

interface InputPanelProps {
  onSubmit: (text: string, imageBase64?: string) => void;
  loading: boolean;
}

export default function InputPanel({ onSubmit, loading }: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    if (mode === "text" && text.trim()) {
      onSubmit(text.trim());
    } else if (mode === "image" && imageBase64) {
      onSubmit("", imageBase64);
    }
  }, [mode, text, imageBase64, onSubmit]);

  const handleDemo = useCallback(() => {
    setMode("text");
    setText(DEMO_TEXT);
  }, []);

  const canSubmit =
    !loading &&
    ((mode === "text" && text.trim().length > 0) ||
      (mode === "image" && imageBase64 !== null));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h1 className="text-lg font-semibold text-slate-900">
          Process Charter
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Generate BPMN diagrams from text or images
        </p>
      </div>

      {/* Mode toggle */}
      <div className="px-5 pt-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setMode("text")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "text"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText size={15} />
            Text
          </button>
          <button
            onClick={() => setMode("image")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "image"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ImageIcon size={15} />
            Image
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {mode === "text" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your business process...&#10;&#10;Example: Employee submits expense report. Manager reviews. If approved, Finance processes payment."
            className="w-full h-full min-h-[200px] p-3 text-sm text-slate-700 bg-slate-50/50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors placeholder:text-slate-400"
          />
        ) : (
          <ImageUploader
            onImageSelect={setImageBase64}
            imagePreview={imageBase64}
          />
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-slate-100 space-y-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Play size={15} />
          Generate Diagram
        </button>
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors"
        >
          <Sparkles size={15} />
          Try Demo Example
        </button>
      </div>
    </div>
  );
}
