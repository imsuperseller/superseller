"use client";

import { LANGUAGES } from "@/lib/constants";
import { clsx } from "clsx";

interface LanguagePickerProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function LanguagePicker({ selected, onChange }: LanguagePickerProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-400 mb-3">שפה</label>
      <div className="flex gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all",
              selected === l.id
                ? "bg-winner-primary border-winner-accent text-white"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
            )}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
