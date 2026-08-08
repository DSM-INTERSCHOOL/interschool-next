"use client";

import { useState, useEffect } from "react";
import { getConfirmationStats, getSignatureStats, IEventStat } from "@/services/event.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";

export type EventStatType = "confirmations" | "signatures";

interface EventStatsModalProps {
    eventId: string | null;
    eventTitle?: string | null;
    statType: EventStatType | null;
    isOpen: boolean;
    onClose: () => void;
}

interface StatGroup {
    type: string;
    summary: IEventStat;
    details: IEventStat[];
}

export const EventStatsModal = ({ eventId, eventTitle, statType, isOpen, onClose }: EventStatsModalProps) => {
    const [stats, setStats] = useState<IEventStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && eventId && statType) {
            loadStats();
        }
    }, [isOpen, eventId, statType]);

    const loadStats = async () => {
        if (!eventId || !statType) return;
        try {
            setLoading(true);
            setError(null);
            setExpanded(new Set());
            const { schoolId } = getOrgConfig();
            const data = statType === "confirmations"
                ? await getConfirmationStats({ schoolId, eventId })
                : await getSignatureStats({ schoolId, eventId });
            setStats(data);
        } catch (err: any) {
            setError(err.message || "Error al cargar estadísticas");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStats([]);
        setError(null);
        setExpanded(new Set());
        onClose();
    };

    const toggleExpand = (type: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(type) ? next.delete(type) : next.add(type);
            return next;
        });
    };

    if (!isOpen || !eventId || !statType) return null;

    const groups: StatGroup[] = Object.values(
        stats.reduce<Record<string, StatGroup>>((acc, item) => {
            if (!acc[item.type]) acc[item.type] = { type: item.type, summary: item, details: [] };
            if (item.row_level === 0) acc[item.type].summary = item;
            else acc[item.type].details.push(item);
            return acc;
        }, {})
    );

    const isConfirmations = statType === "confirmations";
    const accentColor = isConfirmations ? "text-success" : "text-info";
    const badgeColor = isConfirmations ? "badge-success" : "badge-info";
    const icon = isConfirmations ? "lucide--circle-check" : "lucide--pen-line";
    const title = isConfirmations ? "Confirmaciones" : "Firmas";
    const totalCount = groups.reduce((sum, g) => sum + Number(g.summary.total || 0), 0);

    const typeLabel: Record<string, string> = {
        STUDENT: "Alumno",
        TEACHER: "Docente",
        PARENT: "Padre/Tutor",
        USER: "Usuario",
    };

    const typeBadge: Record<string, string> = {
        STUDENT: "badge-info",
        TEACHER: "badge-success",
        PARENT: "badge-warning",
        USER: "badge-neutral",
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConfirmations ? 'bg-success/10' : 'bg-info/10'}`}>
                            <span className={`iconify size-6 ${icon} ${accentColor}`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl">{title}</h3>
                            <p className="text-sm text-base-content/70">{eventTitle || "Evento sin título"}</p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
                        <span className="iconify lucide--x size-5"></span>
                    </button>
                </div>

                {/* Count badge */}
                {!loading && !error && groups.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        <div className={`badge badge-lg ${badgeColor} gap-2`}>
                            <span className={`iconify ${icon} size-4`}></span>
                            {totalCount} {isConfirmations ? (totalCount === 1 ? 'confirmado' : 'confirmados') : (totalCount === 1 ? 'firmado' : 'firmados')}
                        </div>
                    </div>
                )}

                <div className="divider my-2"></div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner message="Cargando estadísticas..." />
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-16">
                        <span className={`iconify ${icon} size-24 text-base-content/20 mb-4`}></span>
                        <h3 className="text-xl font-medium text-base-content mb-2">Sin datos</h3>
                        <p className="text-base-content/60">No hay registros disponibles</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[400px]">
                        <table className="table table-zebra w-full">
                            <thead className="sticky top-0 z-10 bg-base-200">
                                <tr>
                                    <th className="bg-base-200 w-8"></th>
                                    <th className="bg-base-200">Tipo</th>
                                    <th className="bg-base-200 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group) => (
                                    <>
                                        {/* Master row */}
                                        <tr key={group.type} className="font-medium bg-base-200/50">
                                            <td>
                                                <button
                                                    className="btn btn-xs btn-ghost btn-circle"
                                                    onClick={() => toggleExpand(group.type)}
                                                    title={expanded.has(group.type) ? "Contraer" : "Expandir"}
                                                >
                                                    <span className={`iconify size-4 transition-transform ${expanded.has(group.type) ? 'lucide--minus' : 'lucide--plus'}`}></span>
                                                </button>
                                            </td>
                                            <td>
                                                <div className={`badge ${typeBadge[group.type] ?? 'badge-neutral'}`}>
                                                    {typeLabel[group.type] ?? group.type}
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <span className={`font-bold ${accentColor}`}>{group.summary.total}</span>
                                            </td>
                                        </tr>

                                        {/* Detail rows */}
                                        {expanded.has(group.type) && group.details.map((detail, i) => (
                                            <tr key={`${group.type}-${i}`} className="text-sm">
                                                <td></td>
                                                <td colSpan={2} className="pl-8 text-base-content/80">
                                                    {detail.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={handleClose}>Cerrar</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={handleClose}></div>
        </div>
    );
};
