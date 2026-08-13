"use client";

import { AppLink as Link } from "@/components/AppLink";

export const TopbarFeedButton = () => (
  <Link href="/apps/feed">
    <div
      tabIndex={0}
      role="button"
      className="btn btn-circle btn-ghost btn-sm"
      aria-label="Noticias"
      title="Noticias"
    >
      <span className="iconify lucide--newspaper size-4.5" />
    </div>
  </Link>
);
