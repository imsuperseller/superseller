"use client";

import { useRef, useState, type DragEvent } from "react";
import { clsx } from "clsx";

interface ImageUploadProps {
  onFileSelected: (file: File) => void;
  uploadedUrl: string | null;
  isUploading: boolean;
  onRemove: () => void;
}

export default function ImageUpload({
  onFileSelected,
  uploadedUrl,
  isUploading,
  onRemove,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    onFileSelected(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (uploadedUrl) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={uploadedUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
          <div>
            <p className="text-sm font-bold text-white">{fileName}</p>
            <p className="text-xs text-gray-500">הועלה</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-gray-500 hover:text-rose-400 text-sm">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
        dragOver
          ? "border-winner-accent bg-winner-accent/5"
          : "border-white/10 bg-black/40 hover:border-winner-accent/30",
        isUploading && "opacity-50 pointer-events-none"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
      {isUploading ? (
        <div className="space-y-2">
          <div className="text-2xl animate-pulse">📷</div>
          <p className="text-sm text-gray-400">מעלה...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-2xl">📷</div>
          <p className="text-sm text-gray-400">תמונה (אופציונלי)</p>
          <p className="text-xs text-gray-600">jpg, png, webp | עד 10MB</p>
        </div>
      )}
    </div>
  );
}
