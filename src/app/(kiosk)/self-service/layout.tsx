import type { Metadata } from "next";
import type { ReactNode } from "react";

// Standalone, chrome-free layout (no admin Sidebar/Topbar) -- this runs on
// a touch kiosk device, not inside the staff admin shell. Relies on the
// same schoolId/token already resolved into localStorage by a prior
// (admin) login on this device, same as every other Commerce API page.
export const metadata: Metadata = {
  title: "Nueva Orden",
};

export default function SelfServiceLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full bg-base-200">{children}</div>;
}
