"use client";

import { useState } from "react";
import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import { sendMessage, RecipientCandidate } from "@/services/directMessage.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { getSenderName, formatMsgDateFull } from "../utils/directMessage.utils";

export interface ComposeState {
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  threadId?: string;
  parentId?: string;
}

const buildReplyBody = (original: DirectMessageRead): string => {
  const name = getSenderName(original);
  const date = formatMsgDateFull(original.created_at);
  return `\n\n--- Mensaje original ---\nDe: ${name}\nFecha: ${date}\nAsunto: ${original.subject}\n\n${original.body}`;
};

export const useCompose = (onSuccess: () => void) => {
  const personId = useAuthStore((s) => s.personId);
  const [sending, setSending]   = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [form, setForm] = useState<ComposeState>({
    recipientId: "", recipientName: "", subject: "", body: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ComposeState, string>>>({});

  const openBlank = () => {
    setForm({ recipientId: "", recipientName: "", subject: "", body: "" });
    setSendError(null);
    setFieldErrors({});
  };

  const openReply = (original: DirectMessageRead) => {
    setForm({
      recipientId: original.sender_id,
      recipientName: getSenderName(original),
      subject: `Re: ${original.subject}`,
      body: buildReplyBody(original),
      threadId: original.thread_id,
      parentId: original.id,
    });
    setSendError(null);
    setFieldErrors({});
  };

  const setRecipient = (candidate: RecipientCandidate) => {
    setForm((f) => ({
      ...f,
      recipientId: String(candidate.person_id),
      recipientName: candidate.full_name,
    }));
  };

  const updateField = (field: keyof ComposeState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSend = async () => {
    if (!personId) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    const errors: Partial<Record<keyof ComposeState, string>> = {};
    if (!form.recipientId) errors.recipientId = "Selecciona un destinatario";
    if (!form.subject.trim()) errors.subject = "El asunto es requerido";
    if (!form.body.trim()) errors.body = "El mensaje no puede estar vacío";
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    try {
      setSending(true);
      setSendError(null);
      await sendMessage(schoolId, {
        subject: form.subject.trim(),
        body: form.body.trim(),
        recipients: [form.recipientId],
        sender_id: String(personId),
        ...(form.threadId ? { thread_id: form.threadId } : {}),
        ...(form.parentId ? { parent_direct_message_id: form.parentId } : {}),
      });
      onSuccess();
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  return { form, fieldErrors, sending, sendError, openBlank, openReply, setRecipient, updateField, handleSend };
};
