import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import Link from "next/link";

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
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title text-2xl">
                                <span className="iconify lucide--megaphone size-6"></span>
                                Lista de Publicaciones
                            </h2>
                            <Link href="/apps/publications/create" className="btn btn-primary">
                                <span className="iconify lucide--plus size-5"></span>
                                Nueva Publicación
                            </Link>
                        </div>

                        <div className="text-center py-16">
                            <span className="iconify lucide--inbox size-24 text-base-content/20 mb-4"></span>
                            <h3 className="text-xl font-medium text-base-content mb-2">
                                Lista de publicaciones
                            </h3>
                            <p className="text-base-content/60 mb-6">
                                Aquí se mostrará la lista de publicaciones
                            </p>
                            <Link href="/apps/publications/create" className="btn btn-primary btn-sm">
                                <span className="iconify lucide--plus size-4"></span>
                                Crear primera publicación
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

