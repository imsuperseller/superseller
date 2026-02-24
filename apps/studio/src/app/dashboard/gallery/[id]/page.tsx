"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Link from "next/link";
import type { GenerationRow } from "@/types";

interface GenerationEvent {
  id: string;
  stage: string;
  event_type: string;
  payload: string | null;
  created_at: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [gen, setGen] = useState<GenerationRow | null>(null);
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/generations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setGen(data.generation);
        setEvents(data.events || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!gen) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">לא נמצא</p>
      </div>
    );
  }

  const videoUrl = gen.final_video_url || gen.raw_video_r2_url;
  const isComplete = gen.stage === "COMPLETE";
  const isFailed = gen.stage === "FAILED";

  return (
    <div className="py-4 space-y-6">
      <Link
        href="/dashboard/gallery"
        className="text-sm text-gray-500 hover:text-white"
      >
        ← חזרה לגלריה
      </Link>

      {/* Video player */}
      {videoUrl && (
        <Card className="p-0 overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full aspect-video bg-black"
          />
        </Card>
      )}

      {/* Status + metadata */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={isComplete ? "success" : isFailed ? "error" : "info"}>
            {isComplete ? "מוכן" : isFailed ? "נכשל" : gen.stage}
          </Badge>
          {gen.whatsapp_delivered && <Badge variant="success">נשלח בוואטסאפ</Badge>}
          {gen.credit_refunded && <Badge variant="warning">קרדיט הוחזר</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">דמות:</span>
            <span className="text-white mr-2">{gen.character}</span>
          </div>
          <div>
            <span className="text-gray-500">אווירה:</span>
            <span className="text-white mr-2">{gen.vibe}</span>
          </div>
          <div>
            <span className="text-gray-500">מודל:</span>
            <span className="text-white mr-2">{gen.recommended_model || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">נוצר:</span>
            <span className="text-white mr-2">
              {new Date(gen.created_at).toLocaleString("he-IL")}
            </span>
          </div>
        </div>

        {gen.routing_reasoning && (
          <div className="mt-4 bg-black/20 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-500 mb-1">החלטת ראוטינג:</p>
            <p className="text-sm text-gray-400">{gen.routing_reasoning}</p>
          </div>
        )}

        {gen.processed_script && (
          <div className="mt-4 bg-black/20 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-500 mb-1">תסריט מעובד:</p>
            <p className="text-sm text-gray-300 whitespace-pre-line">{gen.processed_script}</p>
          </div>
        )}

        {isFailed && gen.error_message && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <p className="text-sm text-rose-400">{gen.error_message}</p>
          </div>
        )}
      </Card>

      {/* Events timeline */}
      {events.length > 0 && (
        <Card>
          <h3 className="font-bold text-white mb-4">ציר זמן</h3>
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-winner-accent/50 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">
                    <span className="text-white font-bold">{evt.stage}</span>
                    {" · "}
                    <span className="text-gray-500">{evt.event_type}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(evt.created_at).toLocaleTimeString("he-IL")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => window.history.back()}
      >
        חזרה
      </Button>
    </div>
  );
}
