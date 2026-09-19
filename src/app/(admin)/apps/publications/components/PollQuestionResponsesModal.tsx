"use client";

import { useEffect, useState } from "react";
import { getPollPersons, getPollResponses } from "@/services/poll.service";
import { getOrgConfig } from "@/lib/orgConfig";

interface PersonAnswer {
    personId: string;
    name: string;
    type: string | null;
    answer: string | null; // null = person hasn't responded to this question
}

interface PollQuestionResponsesModalProps {
    pollId: string | null;
    questionId: string | null;
    questionText?: string | null;
    /** option_id -> option text, so choice-type answers can be resolved to a label */
    optionsById: Record<string, string>;
    isOpen: boolean;
    onClose: () => void;
}

const personName = (p: { given_name: string | null; paternal_surname: string | null; maternal_surname: string | null }) =>
    [p.given_name, p.paternal_surname, p.maternal_surname].filter(Boolean).join(" ") || "Sin nombre";

export const PollQuestionResponsesModal = ({
    pollId,
    questionId,
    questionText,
    optionsById,
    isOpen,
    onClose,
}: PollQuestionResponsesModalProps) => {
    const [answers, setAnswers] = useState<PersonAnswer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !pollId || !questionId) return;
        setAnswers([]);
        setError(null);

        const load = async () => {
            setLoading(true);
            try {
                const { schoolId } = getOrgConfig();
                const persons = await getPollPersons({ schoolId, pollId, limit: 1000 });

                const perPerson = await Promise.all(
                    persons.map(async (person) => {
                        // getPollResponses returns *all* of a person's answers across every
                        // question in the poll — there's no per-question endpoint, so we filter
                        // client-side to the one question this modal is scoped to.
                        const responses = person.responded
                            ? await getPollResponses({ schoolId, pollId, personId: person.person_id })
                            : [];
                        const matches = responses.filter((r) => r.question_id === questionId);
                        const answer = matches.length === 0
                            ? null
                            : matches
                                .map((r) => (r.option_id ? optionsById[r.option_id] ?? "—" : r.text_response ?? "—"))
                                .join(", ");

                        return {
                            personId: person.person_id,
                            name: personName(person),
                            type: person.type,
                            answer,
                        };
                    })
                );

                perPerson.sort((a, b) => a.name.localeCompare(b.name));
                setAnswers(perPerson);
            } catch (e: any) {
                setError(e.message || "Error al cargar las respuestas");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isOpen, pollId, questionId, optionsById]);

    if (!isOpen || !pollId || !questionId) return null;

    const respondedCount = answers.filter((a) => a.answer !== null).length;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-start mb-3 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Respuestas</h3>
                        <p className="text-sm text-base-content/60 line-clamp-2">{questionText || "Pregunta"}</p>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost shrink-0" onClick={onClose}>
                        <span className="iconify lucide--x size-5" />
                    </button>
                </div>

                {!loading && !error && answers.length > 0 && (
                    <div className="badge badge-warning badge-sm gap-1.5 mb-3 shrink-0 self-start">
                        <span className="iconify lucide--users size-3.5" />
                        {respondedCount}/{answers.length} respondieron
                    </div>
                )}

                <div className="divider my-0 shrink-0" />

                <div className="overflow-y-auto flex-1 mt-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <span className="loading loading-spinner loading-md text-warning" />
                            <p className="text-sm text-base-content/60">Cargando respuestas...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-error">
                            <span className="iconify lucide--alert-circle size-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    ) : answers.length === 0 ? (
                        <p className="text-sm text-base-content/40 italic text-center py-8">
                            No hay destinatarios registrados para esta encuesta.
                        </p>
                    ) : (
                        <div className="space-y-1.5 pr-1">
                            {answers.map((a) => (
                                <div
                                    key={a.personId}
                                    className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 ${
                                        a.answer !== null ? "bg-base-200" : "bg-base-200/40"
                                    }`}
                                >
                                    <span className={`text-sm font-medium shrink-0 ${a.answer === null ? "text-base-content/50" : ""}`}>
                                        {a.name}
                                    </span>
                                    {a.answer !== null ? (
                                        <span className="text-sm text-right text-base-content/80">{a.answer}</span>
                                    ) : (
                                        <span className="text-xs text-base-content/40 italic shrink-0">Sin respuesta</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-action shrink-0 mt-4">
                    <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    );
};
