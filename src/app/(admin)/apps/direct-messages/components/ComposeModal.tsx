"use client";

import { useState, useEffect, useRef } from "react";
import { useCompose } from "../hooks/useCompose";
import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import { RecipientSelectorModal } from "./RecipientSelectorModal";

interface Props {
  initial?: { mode: "reply"; msg: DirectMessageRead } | { mode: "blank" };
  onClose: () => void;
  onSent: () => void;
}

export const ComposeModal = ({ initial, onClose, onSent }: Props) => {
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // In reply mode: focus the body textarea and place cursor at the very top
  useEffect(() => {
    if (initial?.mode !== "reply") return;
    const raf = requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(0, 0);
      el.scrollTop = 0;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const { form, fieldErrors, sending, sendError, openBlank, openReply, setRecipient, updateField, handleSend } =
    useCompose(() => { onSent(); onClose(); });

  // Initialise form once
  useState(() => {
    if (initial?.mode === "reply") openReply(initial.msg);
    else openBlank();
  });

  if (showRecipientSelector) {
    return (
      <RecipientSelectorModal
        onSelect={(c) => { setRecipient(c); setShowRecipientSelector(false); }}
        onClose={() => setShowRecipientSelector(false)}
      />
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="iconify lucide--pencil size-5 text-primary" />
            <h3 className="font-bold text-lg">
              {initial?.mode === "reply" ? "Responder mensaje" : "Nuevo mensaje"}
            </h3>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} disabled={sending}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 px-1 pb-1">

          {/* Para */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Para</p>
            {initial?.mode === "reply" ? (
              <div className="input input-bordered flex items-center bg-base-200 text-base-content/70 w-full">
                {form.recipientName || "—"}
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="input input-bordered flex items-center flex-1 bg-base-200 text-base-content/70 truncate">
                  {form.recipientName || <span className="text-base-content/30">Sin destinatario</span>}
                </div>
                <button
                  className="btn btn-sm btn-outline btn-primary shrink-0"
                  onClick={() => setShowRecipientSelector(true)}
                  disabled={sending}
                >
                  <span className="iconify lucide--user-search size-4" />
                  Buscar
                </button>
              </div>
            )}
            {fieldErrors.recipientId && (
              <span className="text-xs text-error">{fieldErrors.recipientId}</span>
            )}
          </div>

          {/* Asunto */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Asunto</p>
            <input
              type="text"
              className={`input input-bordered focus:input-primary w-full ${fieldErrors.subject ? "input-error" : ""}`}
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              disabled={sending}
              placeholder="Escribe el asunto…"
            />
            {fieldErrors.subject && (
              <span className="text-xs text-error">{fieldErrors.subject}</span>
            )}
          </div>

          {/* Mensaje */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Mensaje</p>
            <textarea
              ref={bodyRef}
              className={`textarea textarea-bordered textarea-md focus:textarea-primary resize-none w-full ${fieldErrors.body ? "textarea-error" : ""}`}
              rows={8}
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              disabled={sending}
              placeholder="Escribe tu mensaje…"
            />
            {fieldErrors.body && (
              <span className="text-xs text-error">{fieldErrors.body}</span>
            )}
          </div>

          {/* Send error */}
          {sendError && (
            <div className="alert alert-error py-2">
              <span className="iconify lucide--alert-circle size-4" />
              <span className="text-sm">{sendError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-base-200 shrink-0">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={sending}>
            Cancelar
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending}>
            {sending
              ? <><span className="loading loading-spinner loading-xs" /> Enviando…</>
              : <><span className="iconify lucide--send size-4" /> Enviar</>
            }
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={!sending ? onClose : undefined} />
    </div>
  );
};
