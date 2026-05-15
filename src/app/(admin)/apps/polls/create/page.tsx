import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import PollsApp from "../PollsApp";

export const metadata: Metadata = {
    title: "Crear Encuesta - Interschool",
};

export default function CreatePollPage() {
    return (
        <>
            <PageTitle
                title="Crear Encuesta"
                items={[
                    { label: "Apps" },
                    { label: "Encuestas", path: "/apps/polls" },
                    { label: "Crear", active: true },
                ]}
            />
            <div className="mt-6">
                <PollsApp />
            </div>
        </>
    );
}
