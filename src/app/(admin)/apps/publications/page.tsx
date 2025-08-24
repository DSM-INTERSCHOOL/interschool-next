import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import PublicationsApp from "./PublicationsApp";

export const metadata: Metadata = {
    title: "Publicaciones",
};

export default function PublicationsPage() {
    return (
        <>
            <PageTitle 
                title="Publicaciones" 
                items={[{ label: "Apps" }, { label: "Publicaciones", active: true }]} 
            />
            <div className="mt-6">
                <PublicationsApp />
            </div>
        </>
    );
}

