"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FeedRead } from "@/interfaces/IFeed";
import { getFeeds, deleteFeed, likeFeed, unlikeFeed } from "@/services/feed.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";

const LIMIT = 5;

export const useFeed = () => {
  const personId = useAuthStore((s) => s.personId);
  const [feeds, setFeeds] = useState<FeedRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const likeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loadInitial = useCallback(async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId) return;
    try {
      setLoading(true);
      setError(null);
      offsetRef.current = 0;
      const data = await getFeeds({ schoolId, personId, offset: 0, limit: LIMIT });
      setFeeds(data);
      setHasMore(data.length === LIMIT);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar las noticias");
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId || !hasMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const nextOffset = offsetRef.current + LIMIT;
      const data = await getFeeds({ schoolId, personId, offset: nextOffset, limit: LIMIT });
      setFeeds((prev) => [...prev, ...data]);
      offsetRef.current = nextOffset;
      setHasMore(data.length === LIMIT);
    } catch {
      // silently ignore load-more errors
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = (feed: FeedRead) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    // Optimistic update
    setFeeds((prev) =>
      prev.map((f) =>
        f.id === feed.id
          ? { ...f, user_liked: !f.user_liked, likes: f.user_liked ? f.likes - 1 : f.likes + 1 }
          : f
      )
    );

    // Debounce 500 ms
    if (likeTimers.current[feed.id]) clearTimeout(likeTimers.current[feed.id]);
    likeTimers.current[feed.id] = setTimeout(async () => {
      try {
        if (feed.user_liked && feed.idUserLiked) {
          await unlikeFeed({ schoolId, feedId: feed.id, likeId: feed.idUserLiked });
        } else {
          const res = await likeFeed({ schoolId, feedId: feed.id });
          setFeeds((prev) =>
            prev.map((f) => (f.id === feed.id ? { ...f, idUserLiked: res?.id } : f))
          );
        }
      } catch {
        // Revert on error
        setFeeds((prev) =>
          prev.map((f) =>
            f.id === feed.id ? { ...f, user_liked: feed.user_liked, likes: feed.likes } : f
          )
        );
      }
    }, 500);
  };

  const deleteById = async (feedId: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    await deleteFeed({ schoolId, feedId });
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
  };

  const updateCommentCount = (feedId: string, delta: number) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === feedId ? { ...f, comments: Math.max(0, f.comments + delta) } : f))
    );
  };

  return {
    feeds,
    loading,
    loadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    toggleLike,
    deleteById,
    updateCommentCount,
  };
};
