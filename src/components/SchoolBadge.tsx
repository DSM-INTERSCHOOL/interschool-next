"use client";

import clsx from "clsx";
import { useHydration } from "@/hooks/useHydration";
import { useSchoolStore } from "@/store/useSchoolStore";

type Variant = "desktop" | "mobile";

interface SchoolBadgeProps {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  desktop: "absolute left-6 top-6 rounded-2xl bg-white/80 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-900/70",
  mobile: " mt-4 flex items-center justify-center gap-3 rounded-2xl bg-base-100 px-4 py-3 shadow-sm ring-1 ring-slate-200/60",
};

export const SchoolBadge = ({ variant = "mobile" }: SchoolBadgeProps) => {
  const isHydrated = useHydration();
  const schoolName = useSchoolStore((state) => state.schoolName);
  const schoolImage = useSchoolStore((state) => state.schoolImage);

  if (!isHydrated || (!schoolName && !schoolImage)) return null;

  const isDesktop = variant === "desktop";

  return (
    <div className={clsx("flex items-center gap-3", styles[variant])}>
      {schoolImage ? (
        <img
          src={schoolImage}
          alt={schoolName ?? "Logo de la escuela"}
          className={clsx(
            "rounded-full object-cover",
            isDesktop ? "h-12 w-12 ring-2 ring-white/80 dark:ring-slate-800" : "h-10 w-10 ring-1 ring-slate-200"
          )}
        />
      ) : (
        <div
          className={clsx(
            "flex items-center justify-center rounded-full bg-slate-200 text-sm font-semibold uppercase text-slate-600",
            isDesktop ? "h-12 w-12 dark:bg-slate-800 dark:text-slate-200" : "h-10 w-10"
          )}
        >
          {schoolName?.[0] ?? "?"}
        </div>
      )}
      <div className="flex flex-col">
       
        <span
          className={clsx(
            "font-semibold text-slate-900 dark:text-slate-100",
            isDesktop ? "text-lg" : "text-base"
          )}
        >
          {schoolName ?? "Sin nombre"}
        </span>
      </div>
    </div>
  );
};
