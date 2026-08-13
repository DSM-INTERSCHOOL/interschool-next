"use client";

import { AppLink as Link } from "@/components/AppLink";

export const TopbarDirectMessagesButton = () => (
  <Link href="/apps/direct-messages">
    <div
      tabIndex={0}
      role="button"
      className="btn btn-circle btn-ghost btn-sm"
      aria-label="Mensajes directos"
      title="Mensajes directos"
    >
      <span className="iconify lucide--mail size-4.5" />
    </div>
  </Link>
);
