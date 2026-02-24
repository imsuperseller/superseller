"use client";

import { useEffect, useState, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { GenerationRow } from "@/types";

interface PipelineTrackerProps {
  generationId: string;
  onComplete: () => void;
  onFailed: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  SCRIPT_PROCESSING: "מעבד תסריט",
  AUDIO_ISOLATING: "מנקה אודיו",
  VIDEO_GENERATING: "מייצר וידאו",
  DELIVERING: "שולח",
  COMPLETE: "מוכן!",
  FAILED: "נכשל",
};

const PHASE1_STAGES = [
  "SCRIPT_PROCESSING",
  "AUDIO_ISOLATING",
  "VIDEO_GENERATING",
  "DELIVERING",
  "COMPLETE",
];

export default function PipelineTracker({
  generationId,
  onComplete,
  onFailed,
}: PipelineTrackerProps) {
  const [gen, setGen] = useState<GenerationRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/generations/${generationId}`);
        if (!res.ok) return;
        const data = await res.json();
        setGen(data.generation);

        if (data.generation.stage === "COMPLETE") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (data.generation.stage === "FAILED") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // Ignore polling errors
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [generationId]);

  if (!gen) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse text-gray-500">טוען...</div>
      </Card>
    );
  }

  const currentIdx = PHASE1_STAGES.indexOf(gen.stage);
  const isComplete = gen.stage === "COMPLETE";
  const isFailed = gen.stage === "FAILED";

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-rubik text-xl font-black text-white mb-6">
        {isComplete ? "✅ הסרטון מוכן!" : isFailed ? "⚠️ משהו השתבש" : "🎬 הסרטון שלך בהכנה..."}
      </h2>

      {/* Stage progress */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {PHASE1_STAGES.map((stage, idx) => {
          // Skip AUDIO_ISOLATING if not needed
          if (stage === "AUDIO_ISOLATING" && !gen.needs_isolation) return null;

          const isPast = currentIdx > idx;
          const isCurrent = gen.stage === stage;
          const isFuture = currentIdx < idx;

          return (
            <div key={stage} className="flex items-center gap-1 flex-shrink-0">
              {idx > 0 && !(stage === "AUDIO_ISOLATING" && !gen.needs_isolation) && (
                <div className={`h-0.5 w-6 sm:w-10 ${isPast ? "bg-winner-accent" : "bg-white/10"}`} />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isPast
                      ? "bg-winner-accent border-winner-accent"
                      : isCurrent
                        ? "border-winner-accent bg-winner-accent/20 animate-pulse"
                        : isFailed && isCurrent
                          ? "border-rose-500 bg-rose-500/20"
                          : "border-white/20 bg-transparent"
                  }`}
                >
                  {isPast && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] font-bold whitespace-nowrap ${
                  isCurrent ? "text-winner-accent" : isPast ? "text-gray-400" : "text-gray-600"
                }`}>
                  {STAGE_LABELS[stage] || stage}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current stage info */}
      {!isComplete && !isFailed && (
        <div className="bg-black/30 rounded-2xl p-4 mb-4 space-y-2">
          <p className="text-sm text-gray-400">
            שלב נוכחי: <span className="text-white font-bold">{STAGE_LABELS[gen.stage]}</span>
          </p>
          {gen.recommended_model && (
            <p className="text-sm text-gray-400">
              מודל: <span className="text-white">{gen.recommended_model}</span>
            </p>
          )}
          {gen.stage === "VIDEO_GENERATING" && (
            <p className="text-sm text-gray-400">זמן משוער: 3-5 דקות</p>
          )}
          <p className="text-xs text-gray-500">☑️ נודיע לך בוואטסאפ כשמוכן</p>
        </div>
      )}

      {/* Gemini output */}
      {gen.processed_script && !isComplete && (
        <div className="bg-black/20 rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-gray-500 mb-1">תסריט מעובד:</p>
          <p className="text-sm text-gray-300 whitespace-pre-line">{gen.processed_script}</p>
        </div>
      )}

      {/* Complete — show video */}
      {isComplete && gen.final_video_url && (
        <div className="space-y-4">
          <video
            src={gen.final_video_url}
            controls
            className="w-full rounded-2xl bg-black"
            autoPlay
          />
          {gen.whatsapp_delivered && (
            <p className="text-sm text-emerald-400">✅ נשלח בוואטסאפ</p>
          )}
          <Button onClick={onComplete} variant="secondary" className="w-full">
            צור סרטון חדש
          </Button>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div className="space-y-4">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3">
            <p className="text-rose-400 text-sm">{gen.error_message || "שגיאה לא צפויה"}</p>
            <p className="text-gray-500 text-xs mt-1">הקרדיט הוחזר אוטומטית</p>
          </div>
          <Button onClick={onFailed} variant="secondary" className="w-full">
            נסה שוב
          </Button>
        </div>
      )}
    </Card>
  );
}
