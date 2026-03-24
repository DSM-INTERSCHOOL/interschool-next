"use client";

import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useRef } from "react";
import { removeDuplicateDomainCookies } from "@/services/auth.service";

const LegacyPage = () => {
    const legacyUrl = useAuthStore((state) => state.legacyUrl) as string;
    const token = useAuthStore((state) => state.token) as string;
    const { portalName } = getOrgConfig();
    const completPath = legacyUrl?.startsWith('https://')? legacyUrl : `${portalName}${legacyUrl}`;

    const [iframeReady, setIframeReady] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Usar un timestamp para forzar recarga del iframe incluso si la URL no cambia
    const [iframeKey, setIframeKey] = useState(Date.now());

    useEffect(() => {
        // Resetear el estado del iframe y generar nueva key
        setIframeReady(false);
        setIframeKey(Date.now());

        // Pequeño delay para asegurar que las cookies estén disponibles
        // antes de renderizar el iframe
        const timer = setTimeout(() => {
            setIframeReady(true);
        }, 150);

        return () => clearTimeout(timer);
    }, [completPath, legacyUrl]);

    const handleIframeLoad = () => {
        console.log('Iframe cargado, limpiando cookies duplicadas...');

        // Esperar un momento para que las cookies se establezcan completamente
        setTimeout(() => {
            removeDuplicateDomainCookies();
            console.log('Cookies duplicadas eliminadas');
        }, 200);
    };
    const pathWithToken = `${completPath}?bref=${token}`
    console.log({completPath, legacyUrl, pathWithToken})

    return (
        <>
            <div style={{ width: "100%", height: "100vh" }}>
                {iframeReady ? (
                    <iframe
                        key={iframeKey}
                        ref={iframeRef}
                        src={pathWithToken}
                        title="Legacy"
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        onLoad={handleIframeLoad}
                    />
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
