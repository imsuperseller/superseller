"use client";

import { CHARACTERS } from "@/lib/constants";
import { clsx } from "clsx";

interface CharacterPickerProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function CharacterPicker({ selected, onChange }: CharacterPickerProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-400 mb-3">מי מדבר?</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={clsx(
              "flex flex-col items-center gap-1 p-3 rounded-2xl border text-center transition-all",
              selected === c.id
                ? "bg-winner-primary border-winner-accent text-white shadow-lg ring-2 ring-winner-accent/30"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
            )}
          >
            <span className="text-xl">{c.icon}</span>
            <span className="font-bold text-sm">{c.name}</span>
            <span className="text-[10px] opacity-70 leading-tight">{c.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
