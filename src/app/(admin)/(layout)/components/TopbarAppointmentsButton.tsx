"use client";

import Link from "next/link";

export const TopbarAppointmentsButton = () => (
  <Link href="/apps/appointments/my-appointments">
    <div
      tabIndex={0}
      role="button"
      className="btn btn-circle btn-ghost btn-sm"
      aria-label="Mis reuniones"
      title="Mis reuniones"
    >
      <span className="iconify lucide--calendar-clock size-4.5" />
    </div>
  </Link>
);
