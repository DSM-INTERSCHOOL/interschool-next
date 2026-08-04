"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IAnnouncement, IAssignment, IEvent } from "@/interfaces/IPublication";
import { usePublicationComments, PublicationType } from "../hooks/usePublicationComments";
import { useAuthStore } from "@/store/useAuthStore";

const fromNow = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

const initials = (given: string | null | undefined, paternal: string | null | undefined) =>
  `${given?.[0] ?? ""}${paternal?.[0] ?? ""}`.toUpperCase() || "?";

interface Props {
  type: PublicationType;
  publication: IAnnouncement | IAssignment | IEvent;
  onClose: () => void;
  onCountChange: (delta: number) => void;
}

export const PublicationCommentModal = ({ type, publication, onClose, onCountChange }: Props) => {
  const personId = useAuthStore((s) => s.personId);
  const { comments, loading, submitting, error, loadComments, addComment, deleteComment } =
    usePublicationComments(type, publication.id, personId);
  const [text, setText] = useState("");
  const [centerX, setCenterX] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Center horizontally on the Notificaciones frame instead of the full viewport
  useLayoutEffect(() => {
    const updateCenter = () => {
      const frame = document.getElementById("notificaciones-frame");
      if (frame) {
        const rect = frame.getBoundingClientRect();
        setCenterX(rect.left + rect.width / 2);
      } else {
        setCenterX(window.innerWidth / 2);
      }
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    const ok = await addComment(text);
    if (ok) {
      setText("");
      onCountChange(+1);
      textareaRef.current?.focus();
    }
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    onCountChange(-1);
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  return (
    <div className="modal modal-open pointer-events-none">
      <div
        className="modal-box max-w-lg p-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl pointer-events-auto"
        style={{
          height: "min(85vh, 640px)",
          ...(centerX != null ? { position: "fixed", left: centerX, top: "50%", transform: "translate(-50%, -50%)", margin: 0 } : {}),
        }}
      >

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-base-200 shrink-0 bg-base-100">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="iconify lucide--message-circle size-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight">Comentarios</h3>
            <p className="text-xs text-base-content/40 truncate">
              {publication.title || "Publicación"}
            </p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* Comment list — chat style */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3 bg-base-200/40">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-error py-2">
              <span className="iconify lucide--alert-circle size-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="text-center py-14">
              <span className="iconify lucide--message-circle size-14 text-base-content/15 block mx-auto mb-3" />
              <p className="text-sm font-medium text-base-content/40">Aún no hay comentarios</p>
              <p className="text-xs text-base-content/30 mt-0.5">¡Sé el primero en comentar!</p>
            </div>
          )}

          {comments.map((c) => {
            const isMine = String(c.person?.id) === String(personId);
            const name = [c.person?.given_name, c.person?.paternal_surname].filter(Boolean).join(" ") || "Usuario";

            if (isMine) {
              return (
                <div key={c.id} className="group flex justify-end">
                  <div className="max-w-[75%]">
                    <div className="bg-primary text-primary-content rounded-2xl rounded-br-md px-3.5 py-2 shadow-sm">
                      <p className="text-sm leading-snug break-words">{c.comment}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 pr-1">
                      <button
                        className="text-base-content/30 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar"
                        onClick={() => handleDelete(c.id)}
                      >
                        <span className="iconify lucide--trash-2 size-3" />
                      </button>
                      <span className="text-[11px] text-base-content/35">{fromNow(c.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={c.id} className="flex items-end gap-2">
                {/* Avatar */}
                <div className="avatar shrink-0 mb-4">
                  {c.person?.profile_picture_url ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden">
                      <img src={c.person.profile_picture_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {initials(c.person?.given_name, c.person?.paternal_surname)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="max-w-[75%]">
                  <p className="text-[11px] font-medium text-base-content/45 mb-0.5 pl-1">{name}</p>
                  <div className="bg-base-100 rounded-2xl rounded-bl-md px-3.5 py-2 shadow-sm border border-base-200">
                    <p className="text-sm text-base-content/85 leading-snug break-words">{c.comment}</p>
                  </div>
                  <div className="mt-1 pl-1">
                    <span className="text-[11px] text-base-content/35">{fromNow(c.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {publication.accept_comments && (
          <div className="px-4 py-3 border-t border-base-200 bg-base-100 shrink-0">
            <div className="flex items-end gap-2 bg-base-200 rounded-2xl px-3.5 py-2 transition-shadow focus-within:ring-2 focus-within:ring-primary/40">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent resize-none outline-none border-none focus:outline-none focus:ring-0 text-sm py-1 max-h-24 placeholder:text-base-content/35"
                rows={1}
                placeholder="Escribe un comentario…"
                value={text}
                onChange={(e) => { setText(e.target.value); autoGrow(e.target); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                }}
              />
              <button
                className="btn btn-primary btn-circle btn-sm shrink-0"
                disabled={!text.trim() || submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? <span className="loading loading-spinner loading-xs" />
                  : <span className="iconify lucide--send size-4" />
                }
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop pointer-events-auto" onClick={onClose} />
    </div>
  );
};
