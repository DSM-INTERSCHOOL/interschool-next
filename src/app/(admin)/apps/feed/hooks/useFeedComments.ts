"use client";

import { useState, useCallback } from "react";
import { FeedComment } from "@/interfaces/IFeed";
import { getFeedComments, createFeedComment, deleteFeedComment } from "@/services/feed.service";
import { getOrgConfig } from "@/lib/orgConfig";

export const useFeedComments = (feedId: string) => {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getFeedComments({ schoolId, feedId });
      setComments(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  }, [feedId]);

  const addComment = async (text: string): Promise<boolean> => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !text.trim()) return false;
    try {
      setSubmitting(true);
      const comment = await createFeedComment({ schoolId, feedId, text: text.trim() });
      setComments((prev) => [...prev, comment]);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar el comentario");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    await deleteFeedComment({ schoolId, feedId, commentId });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, loading, submitting, error, loadComments, addComment, deleteComment };
};
