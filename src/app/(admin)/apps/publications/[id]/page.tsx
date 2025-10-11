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
    const publicationType = (searchParams.get('publicationType') as 'announcement' | 'assignment') || 'announcement';

    useEffect(() => {
        const title = publicationType === 'assignment' ? 'Editar Tarea' : 'Editar Aviso';
        document.title = `${title} - Interschool`;
    }, [publicationType]);

    return (
        <>
            <PageTitle
                title={`Editar ${publicationType === 'assignment' ? 'Tarea' : 'Aviso'}`}
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
