"use client";

import { getOrgConfig } from "@/lib/orgConfig";

import type { Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";
import { useAuthStore } from "@/store/useAuthStore";

const LegacyPage = () => {
    const legacyUrl = useAuthStore((state) => state.legacyUrl) as string;
    const { portalName } = getOrgConfig();
    const completPath = legacyUrl?.startsWith('https://')? legacyUrl : `${portalName}${legacyUrl}`;

    console.log({completPath, legacyUrl})

    return (
        <>
            <div style={{ width: "100%", height: "100vh" }}>
                <iframe src={completPath} title="Legacy" width="100%" height="100%" style={{ border: "none" }} />
            </div>
        </>
    );
};

export default LegacyPage;
