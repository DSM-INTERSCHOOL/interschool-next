"use client";

import { useState, useCallback, useEffect } from "react";
import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import { getReceivedMessages, getSentMessages, deleteMessage, markAsRead } from "@/services/directMessage.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { isUnread, getFirstRecipient, isSentByMe } from "../utils/directMessage.utils";

export const useDirectMessages = () => {
  const personId = useAuthStore((s) => s.personId);
  const [received, setReceived] = useState<DirectMessageRead[]>([]);
  const [sent, setSent]         = useState<DirectMessageRead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId) return;
    try {
      setLoading(true);
      setError(null);
      const [recv, snt] = await Promise.all([
        getReceivedMessages(schoolId, personId),
        getSentMessages(schoolId, personId),
      ]);
      setReceived(recv);
      setSent(snt);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (msg: DirectMessageRead) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId) return;
    setSent((prev) => prev.filter((m) => m.id !== msg.id));
    try {
      await deleteMessage(schoolId, msg.id, personId);
    } catch {
      setSent((prev) => [msg, ...prev]);
    }
  };

  const handleMarkAsRead = (msg: DirectMessageRead) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId) return;
    if (isSentByMe(msg, personId) || !isUnread(msg)) return;
    const recipient = getFirstRecipient(msg);
    if (!recipient?.recipient_id) return;
    setReceived((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? { ...m, recipients: m.recipients.map((r, i) => i === 0 ? { ...r, is_read: true } : r) }
          : m
      )
    );
    markAsRead(schoolId, msg.id, recipient.recipient_id).catch(() => {});
  };

  return { received, sent, loading, error, load, handleDelete, handleMarkAsRead };
};
