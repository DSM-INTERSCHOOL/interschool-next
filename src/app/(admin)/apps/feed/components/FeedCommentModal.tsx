"use client";

import { useEffect, useRef, useState } from "react";
import { FeedRead } from "@/interfaces/IFeed";
import { useFeedComments } from "../hooks/useFeedComments";
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

const initials = (given: string | null, paternal: string | null) =>
  `${given?.[0] ?? ""}${paternal?.[0] ?? ""}`.toUpperCase() || "?";

interface Props {
  feed: FeedRead;
  onClose: () => void;
  onCountChange: (delta: number) => void;
}

export const FeedCommentModal = ({ feed, onClose, onCountChange }: Props) => {
  const personId = useAuthStore((s) => s.personId);
  const { comments, loading, submitting, error, loadComments, addComment, deleteComment } =
    useFeedComments(feed.id);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

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
    }
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    onCountChange(-1);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg flex flex-col" style={{ maxHeight: "85vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="font-bold text-lg">Comentarios</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
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
            <div className="text-center py-10">
              <span className="iconify lucide--message-circle size-12 text-base-content/15 block mx-auto mb-2" />
              <p className="text-sm text-base-content/40">Sin comentarios aún. ¡Sé el primero!</p>
            </div>
          )}

          {comments.map((c) => {
            const isMine = String(c.person?.id) === String(personId);
            return (
              <div key={c.id} className="flex gap-3">
                {/* Avatar */}
                <div className="avatar shrink-0">
                  {c.person?.profile_picture_url ? (
                    <div className="w-8 rounded-full">
                      <img src={c.person.profile_picture_url} alt="" />
                    </div>
                  ) : (
                    <div className="w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {initials(c.person?.given_name ?? null, c.person?.paternal_surname ?? null)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="bg-base-200 rounded-2xl rounded-tl-none px-3 py-2">
                    <p className="text-xs font-semibold text-base-content/70 mb-0.5">
                      {[c.person?.given_name, c.person?.paternal_surname].filter(Boolean).join(" ") || "Usuario"}
                    </p>
                    <p className="text-sm text-base-content/85">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-1">
                    <span className="text-xs text-base-content/35">{fromNow(c.created_at)}</span>
                    {isMine && (
                      <button
                        className="text-xs text-error/60 hover:text-error"
                        onClick={() => handleDelete(c.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {feed.accept_comments && (
          <div className="mt-4 pt-3 border-t border-base-200 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                className="textarea textarea-bordered focus:textarea-primary flex-1 resize-none text-sm"
                rows={2}
                placeholder="Escribe un comentario…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
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
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};
