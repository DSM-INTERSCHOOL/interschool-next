"use client";

import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

const LegacyPage = () => {
    const legacyUrl = useAuthStore((state) => state.legacyUrl) as string;
    const { portalName } = getOrgConfig();
    const completPath = legacyUrl?.startsWith('https://')? legacyUrl : `${portalName}${legacyUrl}`;

    const [iframeReady, setIframeReady] = useState(false);

    useEffect(() => {
        // Pequeño delay para asegurar que las cookies estén disponibles
        // antes de renderizar el iframe
        const timer = setTimeout(() => {
            setIframeReady(true);
        }, 150);

        return () => clearTimeout(timer);
    }, [completPath]);

    console.log({completPath, legacyUrl})

    return (
        <>
            <div style={{ width: "100%", height: "100vh" }}>
                {iframeReady ? (
                    <iframe src={completPath} title="Legacy" width="100%" height="100%" style={{ border: "none" }} />
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                )}
            </div>
        </>
    );
};

export default LegacyPage;
