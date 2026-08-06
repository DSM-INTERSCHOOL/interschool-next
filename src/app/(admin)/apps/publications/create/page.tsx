import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import PublicationsApp from "../PublicationsApp";

export const metadata: Metadata = {
    title: "Crear Publicación - Interschool",
};

export default function CreatePublicationPage() {
    return (
        <>
            <PageTitle title="Crear Publicación" />
            <div className="mt-6">
                <PublicationsApp />
            </div>
        </>
    );
}
