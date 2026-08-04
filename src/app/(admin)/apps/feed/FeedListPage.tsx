"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useSchoolStore } from "@/store/useSchoolStore";
import { useFeed } from "./hooks/useFeed";
import { FeedCard } from "./components/FeedCard";

export default function FeedListPage() {
  const personId = useAuthStore((s) => s.personId);
  const personType = useAuthStore((s) => s.personType);
  const school = useSchoolStore((s) => s.school);
  const canPublish = !!personType &&
    !!school?.inoty_config?.inoty_permissions_config?.[personType.toUpperCase()]?.post_news_enabled;
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlightId");
  const highlightRef = useRef<HTMLDivElement>(null);

  const { feeds, loading, loadingMore, hasMore, error, loadInitial, loadMore, toggleLike, deleteById, updateCommentCount } =
    useFeed();

  // Scroll to highlighted card after load
  useEffect(() => {
    if (!loading && highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, highlightId]);

  return (
    <>
      <div id="feed-frame" className="mt-6 max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="iconify lucide--newspaper size-5 text-primary" />
            <h2 className="text-xl font-bold">Noticias</h2>
            <button
              className="btn btn-ghost btn-sm btn-circle"
              title="Actualizar"
              disabled={loading}
              onClick={loadInitial}
            >
              <span className={`iconify lucide--refresh-cw size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {canPublish && (
            <Link href="/apps/feed/create" className="btn btn-primary btn-sm gap-1.5">
              <span className="iconify lucide--plus size-4" />
              Nueva noticia
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner message="Cargando noticias…" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-5" />
            <div>
              <p className="font-semibold">Error al cargar las noticias</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button className="btn btn-sm btn-ghost ml-auto" onClick={loadInitial}>
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && feeds.length === 0 && (
          <div className="text-center py-20">
            <span className="iconify lucide--newspaper size-16 text-base-content/15 block mx-auto mb-4" />
            <p className="text-lg font-semibold text-base-content/40 mb-1">No hay noticias disponibles</p>
            <p className="text-sm text-base-content/30 mb-6">Sé el primero en publicar una noticia para tu comunidad.</p>
            {canPublish && (
              <Link href="/apps/feed/create" className="btn btn-primary gap-1.5">
                <span className="iconify lucide--plus size-4" />
                Publicar noticia
              </Link>
            )}
          </div>
        )}

        {/* Feed list */}
        {!loading && feeds.map((feed) => (
          <div key={feed.id} ref={feed.id === highlightId ? highlightRef : undefined}>
            <FeedCard
              feed={feed}
              personId={personId}
              highlighted={feed.id === highlightId}
              onToggleLike={toggleLike}
              onDelete={deleteById}
              onCommentCountChange={updateCommentCount}
            />
          </div>
        ))}

        {/* Load more / end */}
        {!loading && !error && feeds.length > 0 && (
          <div className="flex justify-center py-4">
            {hasMore ? (
              <button
                className="btn btn-ghost btn-sm gap-1.5"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore
                  ? <><span className="loading loading-spinner loading-xs" /> Cargando…</>
                  : <><span className="iconify lucide--chevron-down size-4" /> Cargar más</>
                }
              </button>
            ) : (
              <p className="text-sm text-base-content/35">No hay más noticias</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
