"use client";

import { useState, useEffect } from "react";
import { getOptionStats, getOptionDetails, IEventOptionStat, IEventOptionDetail } from "@/services/event.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getOrgConfig } from "@/lib/orgConfig";

interface EventOptionsModalProps {
    eventId: string | null;
    eventTitle?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface OptionGroup {
    label: string;
    items: IEventOptionStat[];
    groupTotal: number;
}

interface DetailGroup {
    label: string;
    rows: IEventOptionDetail[];
}

type Tab = "summary" | "details";

export const EventOptionsModal = ({ eventId, eventTitle, isOpen, onClose }: EventOptionsModalProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("summary");

    const [stats, setStats] = useState<IEventOptionStat[]>([]);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);

    const [details, setDetails] = useState<IEventOptionDetail[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && eventId) {
            setActiveTab("summary");
            loadStats();
            loadDetails();
        }
    }, [isOpen, eventId]);

    const loadStats = async () => {
        if (!eventId) return;
        try {
            setStatsLoading(true);
            setStatsError(null);
            const { schoolId } = getOrgConfig();
            setStats(await getOptionStats({ schoolId, eventId }));
        } catch (err: any) {
            setStatsError(err.message || "Error al cargar resumen");
        } finally {
            setStatsLoading(false);
        }
    };

    const loadDetails = async () => {
        if (!eventId) return;
        try {
            setDetailsLoading(true);
            setDetailsError(null);
            const { schoolId } = getOrgConfig();
            setDetails(await getOptionDetails({ schoolId, eventId }));
        } catch (err: any) {
            setDetailsError(err.message || "Error al cargar detalles");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleClose = () => {
        setStats([]);
        setDetails([]);
        setStatsError(null);
        setDetailsError(null);
        onClose();
    };

    if (!isOpen || !eventId) return null;

    // ── Summary groups ────────────────────────────────────────────────────────

    const summaryGroups: OptionGroup[] = Object.values(
        stats.reduce<Record<string, OptionGroup>>((acc, item) => {
            if (!acc[item.label]) acc[item.label] = { label: item.label, items: [], groupTotal: 0 };
            acc[item.label].items.push(item);
            acc[item.label].groupTotal += Number(item.total);
            return acc;
        }, {})
    );

    const grandTotal = stats.reduce((sum, s) => sum + Number(s.total), 0);

    // ── Detail groups ─────────────────────────────────────────────────────────

    const detailGroups: DetailGroup[] = Object.values(
        details.reduce<Record<string, DetailGroup>>((acc, item) => {
            if (!acc[item.label]) acc[item.label] = { label: item.label, rows: [] };
            acc[item.label].rows.push(item);
            return acc;
        }, {})
    );

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <span className="iconify lucide--list-checks size-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl">Opciones</h3>
                            <p className="text-sm text-base-content/70">{eventTitle || "Evento sin título"}</p>
                        </div>
                    </div>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
                        <span className="iconify lucide--x size-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div role="tablist" className="tabs tabs-bordered mb-4">
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === "summary" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("summary")}
                    >
                        <span className="iconify lucide--bar-chart-2 size-4" />
                        Resumen
                        {!statsLoading && grandTotal > 0 && (
                            <span className="badge badge-accent badge-sm">{grandTotal}</span>
                        )}
                    </button>
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === "details" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("details")}
                    >
                        <span className="iconify lucide--users size-4" />
                        Detalle
                        {!detailsLoading && details.length > 0 && (
                            <span className="badge badge-accent badge-sm">{details.length}</span>
                        )}
                    </button>
                </div>

                <div className="divider my-0 mb-3" />

                {/* Summary tab */}
                {activeTab === "summary" && (
                    <div className="flex-1 overflow-y-auto">
                        {statsLoading ? (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner message="Cargando resumen..." />
                            </div>
                        ) : statsError ? (
                            <div className="alert alert-error">
                                <span className="iconify lucide--alert-circle size-6" />
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <div className="text-sm">{statsError}</div>
                                </div>
                            </div>
                        ) : summaryGroups.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="iconify lucide--list-checks size-24 text-base-content/20 mb-4" />
                                <h3 className="text-xl font-medium text-base-content mb-2">Sin datos</h3>
                                <p className="text-base-content/60">Aún no hay respuestas registradas</p>
                            </div>
                        ) : (
                            <div className="space-y-6 pr-1">
                                {summaryGroups.map((group) => (
                                    <div key={group.label}>
                                        <p className="text-sm font-semibold text-accent mb-3">{group.label}</p>
                                        <div className="space-y-2">
                                            {group.items.map((item) => {
                                                const count = Number(item.total);
                                                const pct = group.groupTotal > 0
                                                    ? Math.round((count / group.groupTotal) * 100)
                                                    : 0;
                                                return (
                                                    <div key={item.value}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="font-medium">{item.value}</span>
                                                            <span className="text-base-content/60">
                                                                {count}&nbsp;
                                                                <span className="text-xs text-base-content/40">({pct}%)</span>
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-base-300 rounded-full h-2.5">
                                                            <div
                                                                className="bg-accent h-2.5 rounded-full transition-all"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-base-content/40 mt-2 text-right">
                                            Total: {group.groupTotal}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Details tab */}
                {activeTab === "details" && (
                    <div className="flex-1 overflow-y-auto">
                        {detailsLoading ? (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner message="Cargando detalles..." />
                            </div>
                        ) : detailsError ? (
                            <div className="alert alert-error">
                                <span className="iconify lucide--alert-circle size-6" />
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <div className="text-sm">{detailsError}</div>
                                </div>
                            </div>
                        ) : detailGroups.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="iconify lucide--users size-24 text-base-content/20 mb-4" />
                                <h3 className="text-xl font-medium text-base-content mb-2">Sin datos</h3>
                                <p className="text-base-content/60">Aún no hay respuestas registradas</p>
                            </div>
                        ) : (
                            <div className="space-y-6 pr-1">
                                {detailGroups.map((group) => (
                                    <div key={group.label}>
                                        <p className="text-sm font-semibold text-accent mb-2">{group.label}</p>
                                        <table className="table table-zebra table-sm w-full">
                                            <thead>
                                                <tr>
                                                    <th>Persona</th>
                                                    <th>Opción seleccionada</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.rows.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="text-sm">{row.full_name}</td>
                                                        <td>
                                                            {row.value ? (
                                                                <span className="badge badge-accent badge-sm">{row.value}</span>
                                                            ) : (
                                                                <span className="text-base-content/30 text-xs">Sin respuesta</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-action mt-4">
                    <button className="btn btn-ghost" onClick={handleClose}>Cerrar</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={handleClose} />
        </div>
    );
};
