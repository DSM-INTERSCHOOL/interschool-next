"use client";

import { useState, useEffect } from "react";
import { PollRead, PollQuestion, PollResponseCreate } from "@/interfaces/IPoll";
import { getPollPerson, getPollResponses, submitPollResponses } from "@/services/poll.service";
import { getOrgConfig } from "@/lib/orgConfig";

interface PollDetailProps {
    poll: PollRead | null;
    personId: string;
    onResponded?: (pollId: string) => void;
}

type AnswerMap = Record<string, {
    option_id?: string;
    option_ids?: string[];
    text_response?: string;
}>;

const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("es-MX", {
        day: "numeric", month: "long", year: "numeric",
    });
};

export const PollDetail = ({ poll, personId, onResponded }: PollDetailProps) => {
    const [alreadyResponded, setAlreadyResponded] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!poll || !personId) return;
        setAnswers({});
        setSubmitError(null);
        setSuccess(false);
        setAlreadyResponded(false);

        const check = async () => {
            setCheckingStatus(true);
            try {
                const { schoolId } = getOrgConfig();
                const personPoll = await getPollPerson({ schoolId, pollId: poll.id, personId });
                if (personPoll.responded) {
                    setAlreadyResponded(true);
                    const responses = await getPollResponses({ schoolId, pollId: poll.id, personId });
                    const loaded: AnswerMap = {};
                    for (const r of responses) {
                        const code = poll.questions?.find(q => q.id === r.question_id)?.question_type?.code;
                        if (r.option_id) {
                            if (code === "MULTIPLE_CHOICE") {
                                loaded[r.question_id] = {
                                    option_ids: [...(loaded[r.question_id]?.option_ids ?? []), r.option_id],
                                };
                            } else {
                                loaded[r.question_id] = { option_id: r.option_id };
                            }
                        } else if (r.text_response !== null) {
                            loaded[r.question_id] = { text_response: r.text_response };
                        }
                    }
                    setAnswers(loaded);
                }
            } catch {
                // Person not linked or not responded yet — ignore
            } finally {
                setCheckingStatus(false);
            }
        };

        check();
    }, [poll?.id, personId]);

    if (!poll) {
        return (
            <div className="flex h-full items-center justify-center text-center p-8">
                <div>
                    <span className="iconify lucide--bar-chart-2 size-16 text-base-content/20 mb-4" />
                    <h3 className="text-lg font-medium text-base-content/50">Selecciona una encuesta</h3>
                    <p className="text-sm text-base-content/40 mt-1">
                        Elige una encuesta de la lista para responderla
                    </p>
                </div>
            </div>
        );
    }

    const questions = [...(poll.questions ?? [])].sort((a, b) => a.order - b.order);
    const isPublished = poll.status === "PUBLISHED";
    const canRespond = isPublished && !alreadyResponded && !success;

    // ── Answer helpers ────────────────────────────────────────────────────────

    const setOptionId = (qId: string, optId: string) =>
        setAnswers(prev => ({ ...prev, [qId]: { option_id: optId } }));

    const toggleOptionId = (qId: string, optId: string) =>
        setAnswers(prev => {
            const current = prev[qId]?.option_ids ?? [];
            const updated = current.includes(optId)
                ? current.filter(id => id !== optId)
                : [...current, optId];
            return { ...prev, [qId]: { option_ids: updated } };
        });

    const setTextResponse = (qId: string, text: string) =>
        setAnswers(prev => ({ ...prev, [qId]: { text_response: text } }));

    // ── Submit ────────────────────────────────────────────────────────────────

    const validate = (): string | null => {
        for (const q of questions) {
            if (!q.required) continue;
            const code = q.question_type?.code;
            const ans = answers[q.id];
            if (code === "MULTIPLE_CHOICE") {
                if (!ans?.option_ids?.length) return `"${q.text}" es obligatoria`;
            } else if (code === "TEXT" || code === "RATING") {
                if (!ans?.text_response?.trim()) return `"${q.text}" es obligatoria`;
            } else {
                if (!ans?.option_id) return `"${q.text}" es obligatoria`;
            }
        }
        return null;
    };

    const buildPayload = (): PollResponseCreate[] => {
        const payload: PollResponseCreate[] = [];
        for (const q of questions) {
            const ans = answers[q.id];
            if (!ans) continue;
            const code = q.question_type?.code;
            if (code === "MULTIPLE_CHOICE" && ans.option_ids?.length) {
                ans.option_ids.forEach(id => payload.push({ question_id: q.id, option_id: id }));
            } else if (ans.option_id) {
                payload.push({ question_id: q.id, option_id: ans.option_id });
            } else if (ans.text_response !== undefined) {
                payload.push({ question_id: q.id, text_response: ans.text_response });
            }
        }
        return payload;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) { setSubmitError(err); return; }
        const payload = buildPayload();
        if (!payload.length) { setSubmitError("Responde al menos una pregunta"); return; }

        try {
            setSubmitting(true);
            setSubmitError(null);
            const { schoolId } = getOrgConfig();
            await submitPollResponses({ schoolId, pollId: poll.id, personId, responses: payload });
            setSuccess(true);
            setAlreadyResponded(true);
            onResponded?.(poll.id);
        } catch (e: any) {
            setSubmitError(e.response?.data?.message || e.message || "Error al enviar respuestas");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Question renderer ─────────────────────────────────────────────────────

    const renderQuestion = (q: PollQuestion, idx: number) => {
        const code = q.question_type?.code;
        const ans = answers[q.id];
        const options = [...(q.options ?? [])].sort((a, b) => a.order - b.order);
        const disabled = !canRespond;

        return (
            <div key={q.id} className="card bg-base-200 border border-base-300">
                <div className="card-body py-4 px-5 gap-3">
                    {/* Header */}
                    <div className="flex items-start gap-2">
                        <span className="text-sm font-bold text-warning shrink-0 mt-0.5">{idx + 1}.</span>
                        <div className="flex-1">
                            <p className="font-medium text-sm leading-snug">{q.text}</p>
                            {q.description && (
                                <p className="text-xs text-base-content/60 mt-0.5">{q.description}</p>
                            )}
                            {q.required && (
                                <span className="badge badge-xs badge-error mt-1">Obligatoria</span>
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="pl-5 space-y-2 mt-2">
                        {(code === "SINGLE_CHOICE" || code === "BOOLEAN") && options.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    className="radio radio-warning radio-sm"
                                    name={`q_${q.id}`}
                                    checked={ans?.option_id === opt.id}
                                    onChange={() => setOptionId(q.id, opt.id)}
                                    disabled={disabled}
                                />
                                <span className="text-sm">{opt.text}</span>
                            </label>
                        ))}

                        {code === "MULTIPLE_CHOICE" && options.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-warning checkbox-sm"
                                    checked={(ans?.option_ids ?? []).includes(opt.id)}
                                    onChange={() => toggleOptionId(q.id, opt.id)}
                                    disabled={disabled}
                                />
                                <span className="text-sm">{opt.text}</span>
                            </label>
                        ))}

                        {code === "TEXT" && (
                            <textarea
                                className="textarea textarea-warning w-full resize-none text-sm"
                                rows={3}
                                placeholder="Escribe tu respuesta aquí..."
                                value={ans?.text_response ?? ""}
                                onChange={e => setTextResponse(q.id, e.target.value)}
                                disabled={disabled}
                                maxLength={q.max_length ?? undefined}
                            />
                        )}

                        {code === "RATING" && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-base-content/50 shrink-0">
                                    {q.min_value ?? 1}
                                </span>
                                <input
                                    type="range"
                                    className="range range-warning range-sm flex-1"
                                    min={q.min_value ?? 1}
                                    max={q.max_value ?? 5}
                                    value={ans?.text_response ?? String(q.min_value ?? 1)}
                                    onChange={e => setTextResponse(q.id, e.target.value)}
                                    disabled={disabled}
                                />
                                <span className="text-xs text-base-content/50 shrink-0">
                                    {q.max_value ?? 5}
                                </span>
                                <span className="badge badge-warning badge-sm shrink-0">
                                    {ans?.text_response ?? (q.min_value ?? 1)}
                                </span>
                            </div>
                        )}

                        {code === "LIKERT" && options.map((opt, i) => (
                            <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    className="radio radio-warning radio-sm"
                                    name={`q_${q.id}`}
                                    checked={ans?.option_id === opt.id}
                                    onChange={() => setOptionId(q.id, opt.id)}
                                    disabled={disabled}
                                />
                                <span className="text-xs text-base-content/40 w-4 shrink-0">{i + 1}</span>
                                <span className="text-sm">{opt.text}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 max-w-2xl mx-auto space-y-6">

                {/* Poll header */}
                <div>
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                            <span className="iconify lucide--bar-chart-2 size-5 text-warning" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold leading-tight">{poll.title}</h2>
                            {poll.publisher && (
                                <p className="text-sm text-base-content/60">
                                    {poll.publisher.given_name} {poll.publisher.paternal_surname}
                                </p>
                            )}
                        </div>
                    </div>

                    {poll.description && (
                        <p className="text-sm text-base-content/70 bg-base-200 rounded-lg p-3">
                            {poll.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-base-content/50">
                        {poll.start_date && (
                            <span className="flex items-center gap-1">
                                <span className="iconify lucide--calendar size-3.5" />
                                Desde {formatDate(poll.start_date)}
                            </span>
                        )}
                        {poll.end_date && (
                            <span className="flex items-center gap-1">
                                <span className="iconify lucide--calendar-x size-3.5" />
                                Hasta {formatDate(poll.end_date)}
                            </span>
                        )}
                        {poll.anonymous && (
                            <span className="flex items-center gap-1">
                                <span className="iconify lucide--eye-off size-3.5" />
                                Anónima
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <span className="iconify lucide--list size-3.5" />
                            {questions.length} {questions.length === 1 ? "pregunta" : "preguntas"}
                        </span>
                    </div>
                </div>

                <div className="divider my-0" />

                {/* Status banners */}
                {checkingStatus ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                ) : success ? (
                    <div className="alert alert-success">
                        <span className="iconify lucide--circle-check size-5" />
                        <div>
                            <h3 className="font-bold">¡Respuestas enviadas!</h3>
                            <div className="text-sm">Gracias por participar en esta encuesta.</div>
                        </div>
                    </div>
                ) : alreadyResponded ? (
                    <div className="alert alert-success">
                        <span className="iconify lucide--circle-check size-5" />
                        <div>
                            <h3 className="font-bold">Ya respondiste esta encuesta</h3>
                            <div className="text-sm">Tus respuestas han sido registradas.</div>
                        </div>
                    </div>
                ) : !isPublished ? (
                    <div className="alert alert-warning">
                        <span className="iconify lucide--clock size-5" />
                        <div>
                            <h3 className="font-bold">Encuesta no disponible</h3>
                            <div className="text-sm">Esta encuesta aún no está publicada.</div>
                        </div>
                    </div>
                ) : null}

                {/* Questions */}
                {questions.length > 0 && (
                    <div className="space-y-4">
                        {questions.map((q, idx) => renderQuestion(q, idx))}
                    </div>
                )}

                {questions.length === 0 && (
                    <div className="text-center py-8 text-base-content/40 text-sm">
                        Esta encuesta no tiene preguntas configuradas.
                    </div>
                )}

                {/* Submit error */}
                {submitError && (
                    <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-5" />
                        <span className="text-sm">{submitError}</span>
                    </div>
                )}

                {/* Submit button */}
                {canRespond && questions.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            className="btn btn-warning"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <span className="iconify lucide--send size-4" />
                                    Enviar respuestas
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
