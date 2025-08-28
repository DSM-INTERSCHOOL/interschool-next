import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import DaypassApp from "./DaypassApp";

export const metadata: Metadata = {
    title: "Mis Autorizaciones",
};

export default function DaypassPage() {
    return (
        <>
            <PageTitle 
                title="Mis Autorizaciones" 
                items={[{ label: "Apps" }, { label: "Mis Autorizaciones", active: true }]} 
            />
            <div className="mt-6">
                <DaypassApp />
            </div>
        </>
    );
}

