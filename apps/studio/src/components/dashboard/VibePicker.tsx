"use client";

import { VIBES } from "@/lib/constants";
import { clsx } from "clsx";

interface VibePickerProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function VibePicker({ selected, onChange }: VibePickerProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-400 mb-3">אווירה</label>
      <div className="space-y-2">
        {VIBES.map((v) => (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={clsx(
              "w-full flex items-center gap-3 p-3 rounded-2xl border text-right transition-all",
              selected === v.id
                ? "bg-winner-primary border-winner-accent text-white ring-2 ring-winner-accent/30"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
            )}
          >
            <span className="text-xl">{v.icon}</span>
            <div>
              <span className="font-bold text-sm">{v.name}</span>
              <span className="text-[10px] opacity-70 mr-2">— {v.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
