"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface GenerationSummary {
  id: string;
  stage: string;
  character: string;
  vibe: string;
  final_video_url: string | null;
  raw_video_r2_url: string | null;
  processed_script: string | null;
  error_message: string | null;
  created_at: string;
}

export default function GalleryPage() {
  const [generations, setGenerations] = useState<GenerationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generations")
      .then((res) => res.json())
      .then((data) => setGenerations(data.generations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 text-lg mb-4">עוד אין סרטונים</p>
        <Link
          href="/dashboard"
          className="text-winner-accent hover:underline font-bold"
        >
          צור את הסרטון הראשון שלך
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="font-rubik text-2xl font-black text-white mb-6">גלריה</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generations.map((gen) => {
          const videoUrl = gen.final_video_url || gen.raw_video_r2_url;
          const isComplete = gen.stage === "COMPLETE";
          const isFailed = gen.stage === "FAILED";

          return (
            <Link key={gen.id} href={`/dashboard/gallery/${gen.id}`}>
              <Card hover className="h-full">
                {/* Video thumbnail or placeholder */}
                {videoUrl && isComplete ? (
                  <video
                    src={videoUrl}
                    className="w-full aspect-video rounded-xl bg-black mb-3 object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <div className="w-full aspect-video rounded-xl bg-black/50 mb-3 flex items-center justify-center">
                    {isFailed ? (
                      <span className="text-rose-400 text-sm">נכשל</span>
                    ) : (
                      <Spinner />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isComplete ? "success" : isFailed ? "error" : "info"}
                    >
                      {isComplete ? "מוכן" : isFailed ? "נכשל" : gen.stage}
                    </Badge>
                    <span className="text-xs text-gray-500">{gen.character}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(gen.created_at).toLocaleDateString("he-IL")}
                  </span>
                </div>

                {gen.processed_script && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {gen.processed_script}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
