"use client";

import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import {
  getSenderName, getRecipientName, isSentByMe,
  formatMsgDateFull, PERSON_TYPE_LABEL, TYPE_COLOR, initials,
} from "../utils/directMessage.utils";

interface Props {
  msg: DirectMessageRead;
  personId: number | null;
  onClose: () => void;
  onReply: () => void;
}

export const DirectMessageDetailModal = ({ msg, personId, onClose, onReply }: Props) => {
  const fromMe          = isSentByMe(msg, personId);
  const counterpartName = fromMe ? getRecipientName(msg) : getSenderName(msg);
  const counterpartType = fromMe
    ? msg.recipients?.[0]?.type ?? ""
    : msg.type ?? "";
  const typeLabel = PERSON_TYPE_LABEL[counterpartType] ?? "";
  const avatarColor = TYPE_COLOR[counterpartType] ?? "#37474F";

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg flex flex-col" style={{ maxHeight: "85vh" }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-3 shrink-0">
          <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">

            {/* Direction icon + avatar */}
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: avatarColor }}
              >
                {initials(counterpartName)}
              </div>
              {/* Received / Sent badge */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  fromMe ? "bg-primary" : "bg-success"
                }`}
                title={fromMe ? "Enviado" : "Recibido"}
              >
                <span className={`iconify size-2.5 text-white ${fromMe ? "lucide--send" : "lucide--inbox"}`} />
              </span>
            </div>

            {/* Name + type + subject */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{counterpartName || "—"}</p>
              {typeLabel && (
                <p className="text-xs text-base-content/40 leading-tight mb-1">{typeLabel}</p>
              )}
              <h3 className="font-bold text-base leading-snug mt-1">{msg.subject}</h3>
            </div>
          </div>

          {/* Close + date */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              <span className="iconify lucide--x size-5" />
            </button>
            <p className="text-xs text-base-content/35">{formatMsgDateFull(msg.created_at)}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <div className="divider my-0 mb-3" />
          <p className="text-sm text-base-content/85 whitespace-pre-wrap leading-relaxed">
            {msg.body}
          </p>

          {/* Attachments */}
          {msg.attachments?.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide">Adjuntos</p>
              {msg.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <span className="iconify lucide--paperclip size-4 text-base-content/50 shrink-0" />
                  <span className="text-sm truncate flex-1">{att.file_name}</span>
                  <span className="iconify lucide--download size-4 text-base-content/40 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-base-200 shrink-0">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <span className="iconify lucide--arrow-left size-4" />
            Volver
          </button>
          {!fromMe && (
            <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onReply(); }}>
              <span className="iconify lucide--reply size-4" />
              Responder
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};
