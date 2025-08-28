import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Consulta - Pases de Salida",
};

export default function ConsultaPage() {
    return (
        <>
            <PageTitle
                title="Consulta"
                items={[
                    { label: "Apps" },
                    { label: "Pases de Salida" },
                    { label: "Consulta", active: true }
                ]}
            />
            <div className="mt-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="mb-6">
                            <span className="iconify lucide--construction size-24 text-warning"></span>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Página en Construcción</h2>
                        <p className="text-base-content/70 max-w-md">
                            Esta funcionalidad está siendo desarrollada. Pronto estará disponible para consultar información sobre pases de salida.
                        </p>
                        <div className="mt-6">
                            <div className="badge badge-warning gap-2">
                                <span className="iconify lucide--clock size-3"></span>
                                Próximamente
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
