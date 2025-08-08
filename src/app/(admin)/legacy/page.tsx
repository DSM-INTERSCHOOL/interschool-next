'use client';
import type { Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";
import { useAuthStore } from "@/store/useAuthStore";



const LegacyPage = () => {
        const legacyUrl = useAuthStore((state) => state.legacyUrl) as any;

    return (
        <>
           <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={`https://admin.celta.interschool.mx/${legacyUrl}`}
        title="Google"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
        </>
    );
};

export default LegacyPage;
