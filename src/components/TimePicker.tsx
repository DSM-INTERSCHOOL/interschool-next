"use client";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

/** Snaps a raw minute string to the nearest 15-minute mark. */
const snapMin = (raw: string): string => {
  const n = parseInt(raw, 10) || 0;
  const snapped = Math.round(n / 15) * 15;
  return String(snapped >= 60 ? 0 : snapped).padStart(2, "0");
};

interface Props {
  /** Value in "HH:MM" format */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TimePicker = ({ value, onChange, className = "" }: Props) => {
  const parts = value.split(":");
  const h = parts[0]?.padStart(2, "0") ?? "09";
  const m = snapMin(parts[1] ?? "0");

  return (
    <div className={`flex gap-1 ${className}`}>
      <select
        className="select select-bordered select-sm w-[4.5rem]"
        value={h}
        onChange={(e) => onChange(`${e.target.value}:${m}`)}
      >
        {HOURS.map((hour) => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <span className="self-center text-base-content/50 font-medium select-none">:</span>
      <select
        className="select select-bordered select-sm w-16"
        value={m}
        onChange={(e) => onChange(`${h}:${e.target.value}`)}
      >
        {MINUTES.map((min) => (
          <option key={min} value={min}>{min}</option>
        ))}
      </select>
    </div>
  );
};
