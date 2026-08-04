"use client";

import { use, useEffect } from "react";
import { PageTitle } from "@/components/PageTitle";
import PollsApp from "../PollsApp";

interface EditPollPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPollPage({ params }: EditPollPageProps) {
    const { id } = use(params);

    useEffect(() => {
        document.title = "Editar Encuesta - Interschool";
    }, []);

    return (
        <>
            <PageTitle
                title="Editar Encuesta"
                items={[
                    { label: "Apps" },
                    { label: "Encuestas", path: "/apps/polls" },
                    { label: "Editar", active: true },
                ]}
            />
            <div className="mt-6">
                <PollsApp pollId={id} />
            </div>
        </>
    );
}
