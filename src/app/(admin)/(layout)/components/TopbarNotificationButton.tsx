"use client";

import Link from "next/link";
// import { MegaphoneIcon } from "@heroicons/react/24/outline";

export const TopbarNotificationButton = () => {
    // const closeMenu = () => {
    //     if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    // };

    return (
        <Link href="/notificaciones">
            <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm" aria-label="Notifications">
                <span className="iconify lucide--bell size-4.5" />
            </div>
        </Link>
    );
};
