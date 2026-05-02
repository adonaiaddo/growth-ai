"use client";

import type { DatePreset } from "@/lib/meta/types";

interface DateRangePickerProps {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7d", label: "7 Days" },
  { value: "last_14d", label: "14 Days" },
  { value: "last_30d", label: "30 Days" },
  { value: "last_90d", label: "90 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === preset.value
              ? "bg-accent-violet/20 text-violet-300 ring-1 ring-violet-500/30"
              : "text-foreground-muted hover:text-foreground hover:bg-white/[0.04]"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
