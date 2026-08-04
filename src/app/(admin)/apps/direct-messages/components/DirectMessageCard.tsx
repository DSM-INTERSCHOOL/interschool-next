"use client";

import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import {
  getSenderName, getRecipientName, isSentByMe, isUnread,
  formatMsgDate, PERSON_TYPE_LABEL, initials, TYPE_COLOR,
} from "../utils/directMessage.utils";

interface Props {
  msg: DirectMessageRead;
  personId: number | null;
  isSent: boolean;
  onClick: () => void;
  onReply: () => void;
  onDelete: () => void;
}

const PREVIEW_CHARS = 80;

export const DirectMessageCard = ({ msg, personId, isSent, onClick, onReply, onDelete }: Props) => {
  const unread     = !isSent && isUnread(msg);
  const fromMe     = isSentByMe(msg, personId);
  const name       = isSent ? getRecipientName(msg) : getSenderName(msg);
  const personType = isSent ? (msg.recipients?.[0]?.type ?? "") : (msg.type ?? "");
  const color      = TYPE_COLOR[personType] ?? "#37474F";
  const preview    = msg.body?.replace(/\n/g, " ").slice(0, PREVIEW_CHARS) ?? "";

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-base-200 last:border-b-0 transition-colors hover:bg-base-200/60 ${
        unread ? "bg-base-100 font-medium" : "bg-base-100/40"
      }`}
      onClick={onClick}
    >
      {/* Unread dot */}
      <div className="w-2 shrink-0">
        {unread && <span className="block w-2 h-2 rounded-full bg-primary" />}
      </div>

      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold select-none"
        style={{ backgroundColor: color }}
      >
        {initials(name)}
      </div>

      {/* From / To — fixed width column */}
      <div className="w-40 shrink-0 truncate">
        <p className={`text-sm truncate leading-tight ${unread ? "font-semibold text-base-content" : "text-base-content/70"}`}>
          {name || "—"}
        </p>
        {PERSON_TYPE_LABEL[personType] && (
          <p className="text-[10px] text-base-content/35 leading-tight truncate">
            {PERSON_TYPE_LABEL[personType]}
          </p>
        )}
      </div>

      {/* Subject + preview — flex-1 */}
      <div className="flex-1 min-w-0 truncate">
        <p className={`text-sm truncate leading-tight ${unread ? "font-semibold text-base-content" : "text-base-content/80"}`}>
          {msg.subject}
        </p>
        <p className="text-[10px] text-base-content/35 leading-tight truncate">
          {preview}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div
        className="hidden group-hover:flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {!fromMe && (
          <button
            className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-primary"
            title="Responder"
            onClick={onReply}
          >
            <span className="iconify lucide--reply size-3.5" />
          </button>
        )}
        {fromMe && (
          <button
            className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
            title="Eliminar"
            onClick={onDelete}
          >
            <span className="iconify lucide--trash-2 size-3.5" />
          </button>
        )}
      </div>

      {/* Date — fixed width, right-aligned */}
      <div className={`w-16 text-right shrink-0 text-xs group-hover:hidden ${unread ? "font-semibold text-base-content/70" : "text-base-content/40"}`}>
        {formatMsgDate(msg.created_at)}
      </div>
    </div>
  );
};
