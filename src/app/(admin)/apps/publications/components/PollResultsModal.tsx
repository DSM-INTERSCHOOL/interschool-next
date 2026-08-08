"use client";

import { useState, useEffect } from "react";
import { getPollResults } from "@/services/poll.service";
import { PollQuestionResult } from "@/interfaces/IPoll";
import { getOrgConfig } from "@/lib/orgConfig";

interface PollResultsModalProps {
    pollId: string | null;
    pollTitle?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    SINGLE_CHOICE: "Opción única",
    MULTIPLE_CHOICE: "Opción múltiple",
    BOOLEAN: "Sí / No",
    LIKERT: "Escala Likert",
    RATING: "Calificación",
    TEXT: "Texto libre",
};

const TYPE_ICONS: Record<string, string> = {
    SINGLE_CHOICE: "lucide--circle-dot",
    MULTIPLE_CHOICE: "lucide--list-checks",
    BOOLEAN: "lucide--toggle-left",
    LIKERT: "lucide--bar-chart-horizontal",
    RATING: "lucide--star",
    TEXT: "lucide--message-square",
};

// Gradient colors for Likert (index-based, 5 stops)
const LIKERT_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

// Bar color for choices
const CHOICE_BAR_COLOR = "bg-warning";

const avg = (values: number[]): number =>
    values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

const ProgressBar = ({
    pct,
    color = "bg-warning",
    height = "h-4",
}: {
    pct: number;
    color?: string;
    height?: string;
}) => (
    <div className={`w-full bg-base-300 rounded-full overflow-hidden ${height}`}>
        <div
            className={`${color} ${height} rounded-full transition-all duration-500`}
            style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
        />
    </div>
);

const ChoiceResults = ({
    result,
    allowOver100 = false,
}: {
    result: PollQuestionResult;
    allowOver100?: boolean;
}) => {
    const total = allowOver100
        ? result.total_responses
        : result.options.reduce((s, o) => s + o.count, 0) || result.total_responses;

    const sorted = [...result.options].sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-2 mt-3">
            {sorted.map((opt, i) => {
                const pct = total > 0 ? (opt.count / total) * 100 : 0;
                return (
                    <div key={opt.option_id ?? i}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-base-content/80 font-medium">{opt.text || "—"}</span>
                            <span className="text-base-content/60 shrink-0 ml-2">
                                {opt.count} ({pct.toFixed(1)}%)
                            </span>
                        </div>
                        <ProgressBar pct={pct} color={CHOICE_BAR_COLOR} />
                    </div>
                );
            })}
        </div>
    );
};

const BooleanResults = ({ result }: { result: PollQuestionResult }) => {
    const total = result.total_responses;
    const yesOpt = result.options.find(
        (o) => o.text?.toUpperCase() === "SÍ" || o.text?.toUpperCase() === "SI" || o.text?.toUpperCase() === "YES" || o.text?.toUpperCase() === "TRUE"
    ) ?? result.options[0];
    const noOpt = result.options.find(
        (o) => o.text?.toUpperCase() === "NO" || o.text?.toUpperCase() === "FALSE"
    ) ?? result.options[1];

    const yesPct = total > 0 && yesOpt ? (yesOpt.count / total) * 100 : 0;
    const noPct = total > 0 && noOpt ? (noOpt.count / total) * 100 : 0;

    return (
        <div className="mt-3 space-y-2">
            {yesOpt && (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-success">{yesOpt.text}</span>
                        <span className="text-base-content/60">{yesOpt.count} ({yesPct.toFixed(1)}%)</span>
                    </div>
                    <ProgressBar pct={yesPct} color="bg-success" />
                </div>
            )}
            {noOpt && (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-error">{noOpt.text}</span>
                        <span className="text-base-content/60">{noOpt.count} ({noPct.toFixed(1)}%)</span>
                    </div>
                    <ProgressBar pct={noPct} color="bg-error" />
                </div>
            )}
            {/* donut-style summary */}
            <div className="flex gap-4 justify-center mt-3 pt-3 border-t border-base-300">
                {yesOpt && (
                    <div className="text-center">
                        <div className="text-2xl font-bold text-success">{yesPct.toFixed(0)}%</div>
                        <div className="text-xs text-base-content/60">{yesOpt.text}</div>
                    </div>
                )}
                {noOpt && (
                    <div className="text-center">
                        <div className="text-2xl font-bold text-error">{noPct.toFixed(0)}%</div>
                        <div className="text-xs text-base-content/60">{noOpt.text}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const LikertResults = ({ result }: { result: PollQuestionResult }) => {
    const total = result.total_responses;
    const sorted = [...result.options].sort((a, b) => a.order - b.order);

    return (
        <div className="mt-3 space-y-2">
            {sorted.map((opt, i) => {
                const pct = total > 0 ? (opt.count / total) * 100 : 0;
                const color = LIKERT_COLORS[Math.min(i, LIKERT_COLORS.length - 1)];
                return (
                    <div key={opt.option_id ?? i}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium" style={{ color }}>
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs mr-1.5" style={{ backgroundColor: color }}>
                                    {i + 1}
                                </span>
                                {opt.text}
                            </span>
                            <span className="text-base-content/60 shrink-0 ml-2">{opt.count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full overflow-hidden h-3">
                            <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%`, backgroundColor: color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const RatingResults = ({ result }: { result: PollQuestionResult }) => {
    const numericValues = result.text_responses
        .map((r) => parseFloat(r))
        .filter((n) => !isNaN(n));

    const average = avg(numericValues);
    const total = numericValues.length;

    // Build frequency map
    const freqMap: Record<string, number> = {};
    for (const v of numericValues) {
        const key = String(v);
        freqMap[key] = (freqMap[key] ?? 0) + 1;
    }

    const distribution = Object.entries(freqMap)
        .map(([val, count]) => ({ val, count }))
        .sort((a, b) => parseFloat(a.val) - parseFloat(b.val));

    const maxCount = Math.max(...distribution.map((d) => d.count), 1);

    return (
        <div className="mt-3">
            <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                    <div className="text-4xl font-bold text-warning">{average.toFixed(2)}</div>
                    <div className="text-xs text-base-content/60 mt-0.5">promedio</div>
                </div>
                <div className="flex-1">
                    <div className="flex items-end gap-1 h-14">
                        {distribution.map((d) => (
                            <div key={d.val} className="flex flex-col items-center flex-1 gap-0.5">
                                <div
                                    className="w-full bg-warning rounded-t transition-all duration-500"
                                    style={{ height: `${(d.count / maxCount) * 100}%` }}
                                />
                                <span className="text-[10px] text-base-content/50">{d.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-xs text-base-content/50 text-center">{total} respuestas</div>
        </div>
    );
};

const TextResults = ({ result }: { result: PollQuestionResult }) => {
    const responses = result.text_responses;
    return (
        <div className="mt-3">
            {responses.length === 0 ? (
                <p className="text-sm text-base-content/40 italic">Sin respuestas de texto.</p>
            ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {responses.map((r, i) => (
                        <div key={i} className="bg-base-300/60 rounded-lg px-3 py-2 text-sm">
                            {r}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const QuestionResultCard = ({
    result,
    idx,
}: {
    result: PollQuestionResult;
    idx: number;
}) => {
    const code = result.question_type_code;
    const icon = TYPE_ICONS[code] ?? "lucide--help-circle";
    const label = TYPE_LABELS[code] ?? code;

    return (
        <div className="card bg-base-200 border border-base-300">
            <div className="card-body py-4 px-5 gap-0">
                <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className={`iconify ${icon} size-4 text-warning`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-warning">{idx + 1}.</span>
                            <p className="font-medium text-sm leading-snug">{result.question_text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="badge badge-xs badge-warning badge-outline">{label}</span>
                            <span className="text-xs text-base-content/50">
                                {result.total_responses} {result.total_responses === 1 ? "respuesta" : "respuestas"}
                            </span>
                        </div>
                    </div>
                </div>

                {(code === "SINGLE_CHOICE" || code === "MULTIPLE_CHOICE") && (
                    <ChoiceResults result={result} allowOver100={code === "MULTIPLE_CHOICE"} />
                )}
                {code === "BOOLEAN" && <BooleanResults result={result} />}
                {code === "LIKERT" && <LikertResults result={result} />}
                {code === "RATING" && <RatingResults result={result} />}
                {code === "TEXT" && <TextResults result={result} />}
            </div>
        </div>
    );
};

export const PollResultsModal = ({
    pollId,
    pollTitle,
    isOpen,
    onClose,
}: PollResultsModalProps) => {
    const [results, setResults] = useState<PollQuestionResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !pollId) return;
        setResults([]);
        setError(null);
        const load = async () => {
            setLoading(true);
            try {
                const { schoolId } = getOrgConfig();
                const data = await getPollResults({ schoolId, pollId });
                setResults(data);
            } catch (e: any) {
                setError(e.message || "Error al cargar resultados");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen, pollId]);

    if (!isOpen || !pollId) return null;

    const totalResponses =
        results.length > 0
            ? Math.max(...results.map((r) => r.total_responses))
            : 0;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                            <span className="iconify lucide--bar-chart-2 size-6 text-warning" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Resultados</h3>
                            <p className="text-sm text-base-content/60">{pollTitle || "Encuesta"}</p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                        <span className="iconify lucide--x size-5" />
                    </button>
                </div>

                {!loading && !error && results.length > 0 && (
                    <div className="flex gap-4 mb-4 shrink-0">
                        <div className="badge badge-lg badge-ghost gap-2">
                            <span className="iconify lucide--list size-4" />
                            {results.length} {results.length === 1 ? "pregunta" : "preguntas"}
                        </div>
                        <div className="badge badge-lg badge-warning gap-2">
                            <span className="iconify lucide--users size-4" />
                            {totalResponses} {totalResponses === 1 ? "respuesta" : "respuestas"}
                        </div>
                    </div>
                )}

                <div className="divider my-0 shrink-0" />

                {/* Content */}
                <div className="overflow-y-auto flex-1 mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <span className="loading loading-spinner loading-lg text-warning" />
                            <p className="text-sm text-base-content/60">Cargando resultados...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-error">
                            <span className="iconify lucide--alert-circle size-5" />
                            <div>
                                <h3 className="font-bold">Error</h3>
                                <div className="text-sm">{error}</div>
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="iconify lucide--bar-chart-2 size-24 text-base-content/20 mb-4" />
                            <h3 className="text-lg font-medium text-base-content/50">Sin resultados</h3>
                            <p className="text-sm text-base-content/40 mt-1">
                                Esta encuesta aún no tiene respuestas registradas.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {results.map((r, idx) => (
                                <QuestionResultCard key={r.question_id} result={r} idx={idx} />
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
