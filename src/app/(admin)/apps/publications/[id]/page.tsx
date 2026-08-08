"use client";

import { PageTitle } from "@/components/PageTitle";
import PublicationsApp from "../PublicationsApp";
import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

interface EditPublicationPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditPublicationPage({ params }: EditPublicationPageProps) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const publicationType = (searchParams.get('publicationType') as 'announcement' | 'assignment' | 'event') || 'announcement';
    const typeLabel = publicationType === 'assignment' ? 'Tarea' : publicationType === 'event' ? 'Evento' : 'Aviso';

    useEffect(() => {
        document.title = `Editar ${typeLabel} - Interschool`;
    }, [publicationType]);

    return (
        <>
            <PageTitle
                title={`Editar ${typeLabel}`}
                items={[
                    { label: "Apps" },
                    { label: "Publicaciones", path: "/apps/publications" },
                    { label: "Editar", active: true },
                ]}
            />
            <div className="mt-6">
                <PublicationsApp announcementId={id} type={publicationType} />
            </div>
        </>
    );
}
