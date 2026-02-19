"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (base64: string | null) => void;
  imagePreview: string | null;
}

export default function ImageUploader({
  onImageSelect,
  imagePreview,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onImageSelect]);

  if (imagePreview) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-slate-200">
        <img
          src={imagePreview}
          alt="Uploaded flowchart"
          className="w-full max-h-64 object-contain bg-slate-50"
        />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-sm transition-colors"
          title="Remove image"
        >
          <X size={16} className="text-slate-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors
        ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"}
      `}
    >
      <div className="p-3 rounded-full bg-slate-100">
        {isDragging ? (
          <Upload size={24} className="text-blue-500" />
        ) : (
          <ImageIcon size={24} className="text-slate-400" />
        )}
      </div>
      <p className="text-sm text-slate-500">
        {isDragging ? "Drop image here" : "Click or drag & drop an image"}
      </p>
      <p className="text-xs text-slate-400">PNG, JPG, or WebP</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
