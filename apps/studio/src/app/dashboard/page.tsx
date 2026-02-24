"use client";

import { useState } from "react";
import { useDashboard } from "./context";
import GenerationForm from "@/components/dashboard/GenerationForm";
import PipelineTracker from "@/components/dashboard/PipelineTracker";

export default function DashboardPage() {
  const { credits, refreshCredits } = useDashboard();
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);

  function handleGenerated(genId: string) {
    setActiveGenerationId(genId);
    refreshCredits();
  }

  function handleComplete() {
    setActiveGenerationId(null);
    refreshCredits();
  }

  return (
    <div className="py-4 space-y-6">
      {activeGenerationId ? (
        <PipelineTracker
          generationId={activeGenerationId}
          onComplete={handleComplete}
          onFailed={handleComplete}
        />
      ) : (
        <GenerationForm
          onGenerated={handleGenerated}
          creditsAvailable={credits?.available ?? 0}
        />
      )}
    </div>
  );
}
