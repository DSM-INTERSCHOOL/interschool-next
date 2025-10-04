import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import PublicationsApp from "../PublicationsApp";

export const metadata: Metadata = {
    title: "Crear Publicación",
};

export default function CreatePublicationPage() {
    return (
        <>
            <PageTitle
                title="Crear Publicación"
                items={[{ label: "Apps" }, { label: "Publicaciones", path: "/apps/publications" }, { label: "Crear", active: true }]}
            />
            <div className="mt-6">
                <PublicationsApp />
            </div>
        </>
    );
}
