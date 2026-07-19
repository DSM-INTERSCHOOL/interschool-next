"use client";

import { useState } from "react";
import { FeedRead } from "@/interfaces/IFeed";
import { FeedLikeButton } from "./FeedLikeButton";
import { FeedAttachments } from "./FeedAttachments";
import { FeedCommentModal } from "./FeedCommentModal";

const fromNow = (iso: string | null) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
};

const initials = (given: string | null, paternal: string | null) =>
  `${given?.[0] ?? ""}${paternal?.[0] ?? ""}`.toUpperCase() || "?";

interface Props {
  feed: FeedRead;
  personId: number | null;
  highlighted?: boolean;
  onToggleLike: (feed: FeedRead) => void;
  onDelete: (feedId: string) => Promise<void>;
  onCommentCountChange: (feedId: string, delta: number) => void;
}

export const FeedCard = ({
  feed,
  personId,
  highlighted = false,
  onToggleLike,
  onDelete,
  onCommentCountChange,
}: Props) => {
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAuthor = feed.publisher?.id && String(feed.publisher.id) === String(personId);
  const publisherName = [feed.publisher?.given_name, feed.publisher?.paternal_surname]
    .filter(Boolean)
    .join(" ") || "Usuario";

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(feed.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className={`card bg-base-100 shadow-sm border ${highlighted ? "border-primary" : "border-base-200"}`}>
        <div className="card-body p-4">

          {/* Publisher row */}
          <div className="flex items-center gap-3">
            <div className="avatar shrink-0">
              {feed.publisher?.profile_picture_url ? (
                <div className="w-10 rounded-full">
                  <img src={feed.publisher.profile_picture_url} alt={publisherName} />
                </div>
              ) : (
                <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {initials(feed.publisher?.given_name ?? null, feed.publisher?.paternal_surname ?? null)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{publisherName}</p>
              <p className="text-xs text-base-content/40">{fromNow(feed.start_date)}</p>
            </div>
            {isAuthor && (
              <button
                className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-error shrink-0"
                title="Eliminar noticia"
                onClick={() => setConfirmDelete(true)}
              >
                <span className="iconify lucide--trash-2 size-4" />
              </button>
            )}
          </div>

          {/* HTML content */}
          {feed.content && (
            <div
              className="prose prose-sm max-w-none mt-2 text-base-content/85"
              dangerouslySetInnerHTML={{ __html: feed.content }}
            />
          )}

          {/* Attachments */}
          {(feed.attachments?.length ?? 0) > 0 && (
            <FeedAttachments attachments={feed.attachments!} />
          )}

          {/* Divider */}
          <div className="divider my-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <FeedLikeButton feed={feed} onToggle={onToggleLike} />

            <button
              className="btn btn-sm btn-ghost gap-1.5 text-base-content/50"
              disabled={!feed.accept_comments}
              onClick={() => setShowComments(true)}
            >
              <span className="iconify lucide--message-circle size-4" />
              <span className="text-sm">{feed.comments}</span>
            </button>

            <div className="flex-1" />

            <span className="text-xs text-base-content/30">
              <span className="iconify lucide--eye size-3.5 inline mr-0.5" />
              {feed.views}
            </span>
          </div>
        </div>
      </div>

      {/* Comments modal */}
      {showComments && (
        <FeedCommentModal
          feed={feed}
          onClose={() => setShowComments(false)}
          onCountChange={(delta) => onCommentCountChange(feed.id, delta)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="iconify lucide--trash-2 size-5 text-error" />
              </div>
              <h3 className="font-bold text-lg">Eliminar noticia</h3>
            </div>
            <p className="text-sm text-base-content/70 mb-2">¿Estás seguro de que deseas eliminar esta noticia?</p>
            <p className="text-sm text-base-content/40 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <><span className="loading loading-spinner loading-sm" /> Eliminando…</>
                  : <><span className="iconify lucide--trash-2 size-4" /> Eliminar</>
                }
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !deleting && setConfirmDelete(false)} />
        </div>
      )}
    </>
  );
};
