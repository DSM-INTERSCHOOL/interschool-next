"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import { useDirectMessages } from "./hooks/useDirectMessages";
import { DirectMessageCard } from "./components/DirectMessageCard";
import { DirectMessageDetailModal } from "./components/DirectMessageDetailModal";
import { ComposeModal } from "./components/ComposeModal";

type Tab = "received" | "sent";

export default function DirectMessagesPage() {
  const personId = useAuthStore((s) => s.personId);
  const { received, sent, loading, error, load, handleDelete, handleMarkAsRead } = useDirectMessages();

  const [activeTab, setActiveTab] = useState<Tab>("received");
  const [selectedMsg, setSelectedMsg] = useState<DirectMessageRead | null>(null);
  const [compose, setCompose] = useState<
    { mode: "blank" } | { mode: "reply"; msg: DirectMessageRead } | null
  >(null);
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState<DirectMessageRead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const currentList = activeTab === "received" ? received : sent;
  const unreadCount = received.filter((m) => {
    const r = m.recipients?.[0];
    return r ? r.is_read === false : m.is_read === false;
  }).length;

  const handleOpen = (msg: DirectMessageRead) => {
    setSelectedMsg(msg);
    handleMarkAsRead(msg);
  };

  const handleReply = (msg: DirectMessageRead) => {
    setCompose({ mode: "reply", msg });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteMsg) return;
    try {
      setDeleting(true);
      await handleDelete(confirmDeleteMsg);
    } finally {
      setDeleting(false);
      setConfirmDeleteMsg(null);
    }
  };

  const handleSent = () => {
    setSendSuccess(true);
    load();
    setTimeout(() => setSendSuccess(false), 3000);
  };

  return (
    <>
      <div className="mt-6 max-w-4xl mx-auto">

        {/* ── Header — outside the frame, same pattern as Noticias ─────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="iconify lucide--mail size-5 text-primary" />
            <h2 className="text-xl font-bold">Mensajes directos</h2>
          </div>
          <div className="flex items-center gap-2">
            {sendSuccess && (
              <span className="badge badge-success badge-sm gap-1">
                <span className="iconify lucide--check size-3" />
                Enviado
              </span>
            )}
            <button
              className="btn btn-primary btn-sm gap-1.5"
              onClick={() => setCompose({ mode: "blank" })}
            >
              <span className="iconify lucide--pencil size-4" />
              Nuevo mensaje
            </button>
            <button
              className="btn btn-ghost btn-sm btn-circle"
              title="Actualizar"
              disabled={loading}
              onClick={load}
            >
              <span className={`iconify lucide--refresh-cw size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div
          className="bg-base-100 shadow-lg rounded-xl overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 12rem)" }}
        >
          {/* ── Tabs ───────────────────────────────────────────────────────── */}
          <div className="px-5 pt-3 pb-0 shrink-0">
            <div className="flex border-b border-base-200">
              {(["received", "sent"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-base-content/50 hover:text-base-content"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "received" ? (
                    <>
                      <span className="iconify lucide--inbox size-4" />
                      Recibidos
                      {unreadCount > 0 && (
                        <span className="badge badge-primary badge-xs">{unreadCount}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="iconify lucide--send size-4" />
                      Enviados
                      <span className="badge badge-ghost badge-xs">{sent.length}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2">

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando mensajes…" />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="alert alert-error mx-3 mt-3">
                <span className="iconify lucide--alert-circle size-5" />
                <span className="text-sm">{error}</span>
                <button className="btn btn-sm btn-ghost ml-auto" onClick={load}>Reintentar</button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && currentList.length === 0 && (
              <div className="text-center py-20">
                <span className={`iconify size-16 text-base-content/15 block mx-auto mb-4 ${
                  activeTab === "received" ? "lucide--inbox" : "lucide--send"
                }`} />
                <p className="text-base-content/40 text-sm">
                  {activeTab === "received" ? "No hay mensajes recibidos" : "No hay mensajes enviados"}
                </p>
              </div>
            )}

            {/* Column headers */}
            {!loading && !error && currentList.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-1.5 border-b border-base-200 bg-base-200/40">
                <div className="w-2 shrink-0" />
                <div className="w-6 shrink-0" />
                <div className="w-40 shrink-0 text-xs font-semibold text-base-content/40 uppercase tracking-wide">
                  {activeTab === "received" ? "De" : "Para"}
                </div>
                <div className="flex-1 text-xs font-semibold text-base-content/40 uppercase tracking-wide">
                  Asunto
                </div>
                <div className="w-16 text-right text-xs font-semibold text-base-content/40 uppercase tracking-wide">
                  Fecha
                </div>
              </div>
            )}

            {/* List */}
            {!loading && !error && currentList.length > 0 && (
              <div>
                {currentList.map((msg) => (
                  <DirectMessageCard
                    key={msg.id}
                    msg={msg}
                    personId={personId}
                    isSent={activeTab === "sent"}
                    onClick={() => handleOpen(msg)}
                    onReply={() => handleReply(msg)}
                    onDelete={() => setConfirmDeleteMsg(msg)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      {selectedMsg && (
        <DirectMessageDetailModal
          msg={selectedMsg}
          personId={personId}
          onClose={() => setSelectedMsg(null)}
          onReply={() => { setSelectedMsg(null); handleReply(selectedMsg); }}
        />
      )}

      {/* ── Compose modal ────────────────────────────────────────────────── */}
      {compose && (
        <ComposeModal
          initial={compose}
          onClose={() => setCompose(null)}
          onSent={handleSent}
        />
      )}

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      {confirmDeleteMsg && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="iconify lucide--trash-2 size-5 text-error" />
              </div>
              <h3 className="font-bold text-lg">Eliminar mensaje</h3>
            </div>
            <p className="text-sm text-base-content/70 mb-2 font-medium truncate">
              "{confirmDeleteMsg.subject}"
            </p>
            <p className="text-sm text-base-content/40 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setConfirmDeleteMsg(null)} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting
                  ? <><span className="loading loading-spinner loading-sm" /> Eliminando…</>
                  : <><span className="iconify lucide--trash-2 size-4" /> Eliminar</>
                }
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !deleting && setConfirmDeleteMsg(null)} />
        </div>
      )}
    </>
  );
}
