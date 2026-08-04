"use client";

import { useState, useCallback } from "react";
import { IPublicationComment } from "@/interfaces/IPublication";
import * as announcementService from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import * as eventService from "@/services/event.service";
import { getOrgConfig } from "@/lib/orgConfig";

export type PublicationType = "announcement" | "assignment" | "event";

export const usePublicationComments = (
  type: PublicationType,
  publicationId: string,
  personId: number | null
) => {
  const [comments, setComments] = useState<IPublicationComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    try {
      setLoading(true);
      setError(null);
      let data: unknown;
      if (type === "announcement") {
        data = await announcementService.getComments({ schoolId, announcementId: publicationId });
      } else if (type === "assignment") {
        data = await assignmentService.getComments({ schoolId, assignmentId: publicationId });
      } else {
        data = await eventService.getComments({ schoolId, eventId: publicationId });
      }
      setComments(Array.isArray(data) ? (data as IPublicationComment[]) : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  }, [type, publicationId]);

  const addComment = async (text: string): Promise<boolean> => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId || !text.trim()) return false;
    try {
      setSubmitting(true);
      const dto = { person_id: String(personId), comment: text.trim() };
      let comment: unknown;
      if (type === "announcement") {
        comment = await announcementService.addComment({ schoolId, announcementId: publicationId, dto });
      } else if (type === "assignment") {
        comment = await assignmentService.addComment({ schoolId, assignmentId: publicationId, dto });
      } else {
        comment = await eventService.addComment({ schoolId, eventId: publicationId, dto });
      }
      setComments((prev) => [...prev, comment as IPublicationComment]);
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
    if (type === "announcement") {
      await announcementService.removeComment({ schoolId, announcementId: publicationId, commentId });
    } else if (type === "assignment") {
      await assignmentService.removeComment({ schoolId, assignmentId: publicationId, commentId });
    } else {
      await eventService.removeComment({ schoolId, eventId: publicationId, commentId });
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, loading, submitting, error, loadComments, addComment, deleteComment };
};
