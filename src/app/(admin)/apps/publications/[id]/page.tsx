import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import PublicationsApp from "../PublicationsApp";

export const metadata: Metadata = {
    title: "Editar Publicación",
};

interface EditPublicationPageProps {
    params: {
        id: string;
    };
}

export default function EditPublicationPage({ params }: EditPublicationPageProps) {
    return (
        <>
            <PageTitle
                title="Editar Publicación"
                items={[
                    { label: "Apps" },
                    { label: "Publicaciones", path: "/apps/publications" },
                    { label: "Editar", active: true },
                ]}
            />
            <div className="mt-6">
                <PublicationsApp announcementId={params.id} />
            </div>
        </>
    );
}
