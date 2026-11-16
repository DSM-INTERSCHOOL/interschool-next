"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { printPage } from "@/lib/printPage";
import { useSchoolStore } from "@/store/useSchoolStore";

interface PrintSectionProps {
  title: string;
  meta?: { label: string; value: string }[];
  children: ReactNode;
  // Rotates the sheet to Letter landscape (see print.css's
  // `.print-report-landscape` rule) -- for tables with enough columns that
  // a portrait sheet would cut the rightmost ones off.
  landscape?: boolean;
}

// Renders a hidden-on-screen, Letter-sized copy of whatever's passed as
// children, shown only when printing (see src/styles/custom/print.css's
// `.print-report` isolation rule) -- used alongside PrintButton so a list
// screen can export to PDF via the browser's print dialog without needing
// a backend reporting service. Mirrors the header used for sales reports
// (apps/commerce/reportes/ReportesPage.tsx): school name as the title when
// known, falling back to the screen's own title otherwise.
export function PrintSection({ title, meta, children, landscape = false }: PrintSectionProps) {
  const schoolName = useSchoolStore((state) => state.schoolName);
  // Portal straight to <body>: rendered in place, this div sits inside the
  // admin layout's sidebar/topbar wrappers, and at least one of those is a
  // positioned (or overflow) ancestor -- `position: absolute; top: 0` then
  // anchors to THAT ancestor's box instead of the page, leaving a big gap
  // above the printed content equal to whatever sits above it on screen
  // (still invisible, but visibility:hidden keeps its layout space). A
  // direct child of body has no such ancestor in the way.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <div className={`${landscape ? "print-report-landscape" : "print-report"} hidden p-6 print:block`}>
      <div className="mb-4 flex items-end justify-between border-b border-base-300 pb-3">
        <div>
          {schoolName && <h1 className="text-xl font-bold">{schoolName}</h1>}
          <p className={schoolName ? "text-base-content/70" : "text-xl font-bold"}>{title}</p>
          {meta && meta.length > 0 && (
            <p className="text-sm text-base-content/60">{meta.map((m) => `${m.label}: ${m.value}`).join(" · ")}</p>
          )}
        </div>
        <p className="text-xs text-base-content/50">Generado: {new Date().toLocaleString("es-MX")}</p>
      </div>
      {children}
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}

export function PrintButton({
  title,
  disabled,
  landscape = false,
}: {
  title: string;
  disabled?: boolean;
  landscape?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={disabled}
      onClick={() => printPage(landscape ? "letter landscape" : "letter", "12mm", title)}
    >
      <span className="iconify lucide--printer size-4"></span>
      Imprimir / PDF
    </button>
  );
}
