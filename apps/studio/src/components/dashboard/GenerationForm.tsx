"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AudioUpload from "./AudioUpload";
import ImageUpload from "./ImageUpload";
import CharacterPicker from "./CharacterPicker";
import VibePicker from "./VibePicker";
import LanguagePicker from "./LanguagePicker";

interface GenerationFormProps {
  onGenerated: (genId: string) => void;
  creditsAvailable: number;
}

export default function GenerationForm({ onGenerated, creditsAvailable }: GenerationFormProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [character, setCharacter] = useState("ceo");
  const [vibe, setVibe] = useState("winner");
  const [language, setLanguage] = useState("he");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File, type: "audio" | "image") {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      return data.url as string;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAudioSelected(file: File) {
    try {
      setError(null);
      const url = await uploadFile(file, "audio");
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאת האודיו נכשלה");
    }
  }

  async function handleImageSelected(file: File) {
    try {
      setError(null);
      const url = await uploadFile(file, "image");
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאת התמונה נכשלה");
    }
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_script: script || undefined,
          audio_url: audioUrl || undefined,
          reference_image_url: imageUrl || undefined,
          character,
          vibe,
          language,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ההפקה נכשלה");
      }

      const data = await res.json();
      onGenerated(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = (audioUrl || script.trim()) && !isUploading && creditsAvailable > 0;

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-rubik text-2xl font-black text-white">
          ⚡ יוצרים סרטון חדש
        </h2>
        <p className="text-gray-500 text-sm mt-1">יצירת תוכן ברמה של וינרים</p>
      </div>

      <div className="space-y-6">
        {/* Audio + Image uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">🎤 אודיו</label>
            <AudioUpload
              onFileSelected={handleAudioSelected}
              uploadedUrl={audioUrl}
              isUploading={isUploading}
              onRemove={() => setAudioUrl(null)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">📷 תמונה (אופציונלי)</label>
            <ImageUpload
              onFileSelected={handleImageSelected}
              uploadedUrl={imageUrl}
              isUploading={isUploading}
              onRemove={() => setImageUrl(null)}
            />
          </div>
        </div>

        {/* Script textarea */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">
            📝 טקסט / תסריט {audioUrl ? "(אופציונלי)" : ""}
          </label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="מה לגיד בסרטון? כתוב את התסריט או תן לגמיני לתמלל את האודיו..."
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-winner-accent/50 focus:ring-2 focus:ring-winner-accent/20 transition-all resize-none"
          />
        </div>

        {/* Character */}
        <CharacterPicker selected={character} onChange={setCharacter} />

        {/* Vibe + Language row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <VibePicker selected={vibe} onChange={setVibe} />
          <LanguagePicker selected={language} onChange={setLanguage} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3">
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={!canGenerate}
          className="w-full"
          size="lg"
        >
          {isGenerating
            ? "המנועים מתחממים..."
            : creditsAvailable <= 0
              ? "אין קרדיטים"
              : `יאללה, תייצר לי סרטון מנצח! (1 קרדיט)`}
        </Button>
      </div>
    </Card>
  );
}
