"use client";

import { useEffect } from "react";

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
  /**
   * When provided, filters out past hours/minutes.
   * Pass the current time as "HH:MM" whenever the selected date is today.
   * Hours before the current hour are hidden; minutes before the next
   * 15-minute mark are hidden for the current hour.
   */
  minTime?: string;
}

export const TimePicker = ({ value, onChange, className = "", minTime }: Props) => {
  const parts = value.split(":");
  const h = parts[0]?.padStart(2, "0") ?? "09";
  const m = snapMin(parts[1] ?? "0");

  // ── Derive minimum hour / minute from minTime ────────────────────────────
  const { minH, minM } = (() => {
    if (!minTime) return { minH: 0, minM: 0 };
    const [rawH, rawM] = minTime.split(":").map((s) => parseInt(s, 10) || 0);
    let mH = rawH;
    let mM = Math.ceil(rawM / 15) * 15; // snap up to next 15-min mark
    if (mM >= 60) { mH += 1; mM = 0; }
    if (mH >= 24) { mH = 23; mM = 45; } // clamp to last slot of the day
    return { minH: mH, minM: mM };
  })();

  const hN = parseInt(h, 10);
  const mN = parseInt(m, 10);

  const availableHours   = HOURS.filter((hr) => parseInt(hr, 10) >= minH);
  const availableMinutes = MINUTES.filter((mn) =>
    hN > minH || parseInt(mn, 10) >= minM
  );

  // Auto-correct if the current value has fallen behind the minimum
  useEffect(() => {
    if (!minTime) return;
    if (hN < minH || (hN === minH && mN < minM)) {
      onChange(
        `${String(minH).padStart(2, "0")}:${String(minM).padStart(2, "0")}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minH, minM]);

  return (
    <div className={`flex gap-1 ${className}`}>
      <select
        className="select select-bordered select-sm w-[4.5rem]"
        value={h}
        onChange={(e) => onChange(`${e.target.value}:${m}`)}
      >
        {availableHours.map((hour) => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <span className="self-center text-base-content/50 font-medium select-none">:</span>
      <select
        className="select select-bordered select-sm w-16"
        value={m}
        onChange={(e) => onChange(`${h}:${e.target.value}`)}
      >
        {availableMinutes.map((min) => (
          <option key={min} value={min}>{min}</option>
        ))}
      </select>
    </div>
  );
};
