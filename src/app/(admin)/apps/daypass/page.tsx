import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import DaypassApp from "./DaypassApp";

export const metadata: Metadata = {
    title: "Pase de Salida",
};

export default function DaypassPage() {
    return (
        <>
            <PageTitle 
                title="Pase de Salida" 
                items={[{ label: "Apps" }, { label: "Pase de Salida", active: true }]} 
            />
            <div className="mt-6">
                <DaypassApp />
            </div>
        </>
    );
}

