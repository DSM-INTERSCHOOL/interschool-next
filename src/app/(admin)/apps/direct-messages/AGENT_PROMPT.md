# Implement the Módulo de Mensajes Directos (Direct Messages) in Next.js

## Context and Goal

You are implementing the **Mensajes Directos** (Direct Messages) feature for a Next.js web admin portal called **Interschool**. The feature already exists in a companion React Native mobile app. Your job is to replicate its behaviour, API calls, data schemas, and UI flows in Next.js, following the existing conventions of this project.

Target directory:
```
src/app/(admin)/apps/direct-messages/
```

---

## Project Conventions (read before writing any code)

### Stack
- Next.js App Router — `"use client"` on every interactive component
- TypeScript
- **DaisyUI + Tailwind CSS** — use DaisyUI component classes only (`card`, `btn`, `badge`, `modal`, `alert`, `input`, `textarea`, `table`, `loading`, etc.). No inline styles, no custom CSS files.
- **Iconify** for icons: `<span className="iconify lucide--{name} size-5"></span>` — never import icon packages
- `moment` for date formatting (already installed)

### Auth and School
```ts
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";

const personId   = useAuthStore((s) => s.personId);    // number | null — numeric person ID
const personType = useAuthStore((s) => s.personType);  // string | null — e.g. "USER", "TEACHER"
const { schoolId } = getOrgConfig();                   // string | null — from localStorage
```

### HTTP Clients
| Client | Env var | Used for |
|--------|---------|----------|
| `communicationApi` (`@/services/communicationApi`) | `NEXT_PUBLIC_API_COMMUNICATION_URL` | Direct message CRUD, mark-as-read, delete |
| `api` (`@/services/api`) | `NEXT_PUBLIC_API_CONSULTATION_URL` | Recipient search, school config |

Both clients add Bearer token, `x-url-origin`, and `x-device-id` via interceptors automatically.

### Existing shared components
```ts
import { PageTitle }                from "@/components/PageTitle";
import { LoadingSpinner }           from "@/components/LoadingSpinner";
import { DeleteConfirmationModal }  from "@/components/DeleteConfirmationModal";
```

### Page pattern
```tsx
// page.tsx — server component, no "use client"
import DirectMessagesPage from "./DirectMessagesPage";
export default function Page() { return <DirectMessagesPage />; }
```

---

## Data Model

### Raw API response (one direct message)
```json
{
  "id": "23c8833c-9dca-4cc2-af49-65d717eb9644",
  "school_id": 1000,
  "subject": "Wellness",
  "body": "The first thing that comes to mind...",
  "sender_id": "3",
  "thread_id": "23c8833c-9dca-4cc2-af49-65d717eb9644",
  "parent_direct_message_id": null,
  "has_attachments": false,
  "created_at": "2026-07-03T17:37:52.293694Z",
  "updated_at": "2026-07-03T17:37:52.295038Z",
  "status": null,
  "given_name": "DATA",
  "paternal_surname": "SOLUTIONS",
  "maternal_surname": "DATA",
  "type": "USER",
  "attachments": [],
  "recipient_id": null,
  "recipient_status": null,
  "is_read": null,
  "read_at": null,
  "recipients": [
    {
      "direct_message_id": "23c8833c-9dca-4cc2-af49-65d717eb9644",
      "recipient_id": "2565",
      "is_read": false,
      "read_at": null,
      "status": "active",
      "created_at": "2026-07-03T17:37:52.295642Z",
      "given_name": "CAJA",
      "paternal_surname": "1",
      "maternal_surname": "CAJA",
      "type": "USER"
    }
  ]
}
```

### TypeScript interfaces to create at `src/interfaces/IDirectMessage.ts`

```ts
export interface DirectMessageRecipient {
  direct_message_id: string;
  recipient_id: string;
  is_read: boolean | null;
  read_at: string | null;
  status: string | null;
  created_at: string;
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  type: string | null;         // "USER" | "STUDENT" | "TEACHER" | "RELATIVE" | "ACADEMIC"
}

export interface DirectMessageRead {
  id: string;
  school_id: number;
  subject: string;
  body: string;
  sender_id: string;
  thread_id: string;
  parent_direct_message_id: string | null;
  has_attachments: boolean;
  created_at: string;
  updated_at: string;
  status: string | null;
  // Sender info (root-level fields)
  given_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  type: string | null;         // sender's person type
  attachments: DirectMessageAttachment[];
  recipients: DirectMessageRecipient[];
  // Legacy flat fields (may be null in new API responses)
  recipient_id: string | null;
  recipient_status: string | null;
  is_read: boolean | null;
  read_at: string | null;
}

export interface DirectMessageAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  is_inline: boolean;
}

export interface DirectMessageCreateDto {
  subject: string;
  body: string;
  recipients: string[];          // array of recipient person_id strings
  sender_id: string;             // current user's personId as string
  thread_id?: string;            // only for replies
  parent_direct_message_id?: string; // only for replies
}
```

### Derived helpers (put in a `utils/directMessage.utils.ts`)

```ts
export const PERSON_TYPE_LABEL: Record<string, string> = {
  STUDENT:  'Alumno',
  TEACHER:  'Profesor',
  USER:     'Usuario',
  RELATIVE: 'Familiar',
  ACADEMIC: 'Académico',
};

// Get sender full name from a DirectMessageRead
export const getSenderName = (msg: DirectMessageRead): string =>
  [msg.given_name, msg.paternal_surname, msg.maternal_surname]
    .filter(Boolean).join(' ');

// Get first recipient full name
export const getRecipientName = (msg: DirectMessageRead): string => {
  const r = msg.recipients?.[0];
  if (!r) return '';
  return [r.given_name, r.paternal_surname, r.maternal_surname].filter(Boolean).join(' ');
};

// Get first recipient object
export const getFirstRecipient = (msg: DirectMessageRead): DirectMessageRecipient | null =>
  msg.recipients?.[0] ?? null;

// Determine if a message was sent by the current user
export const isSentByMe = (msg: DirectMessageRead, personId: number | null): boolean =>
  msg.sender_id === String(personId);

// Is the message unread (for received messages)
export const isUnread = (msg: DirectMessageRead): boolean => {
  const r = getFirstRecipient(msg);
  return r ? r.is_read === false : (msg.is_read === false);
};
```

---

## API Reference

All direct-message endpoints use `communicationApi`. Recipient search uses `api`.

### 1. List received messages
```
GET /v1/schools/{schoolId}/direct-messages
  ?filters=recipient_person_id::eq::{personId},only_active_recipient::eq::True
```

### 2. List sent messages
```
GET /v1/schools/{schoolId}/direct-messages
  ?filters=sender_person_id::eq::{personId}
```

### 3. Get single message
```
GET /v1/schools/{schoolId}/direct-messages/{messageId}
```

### 4. Send message (new or reply)
```
POST /v1/schools/{schoolId}/direct-messages
Body: DirectMessageCreateDto
```

### 5. Mark as read
```
POST /v1/schools/{schoolId}/direct-messages/{messageId}/recipients/{recipientPersonId}/reads
```
- `recipientPersonId` = `getFirstRecipient(msg)?.recipient_id`
- Only call for received messages (`!isSentByMe`) when `isUnread(msg)` is true
- Call silently (fire-and-forget, do not block UI)

### 6. Delete message
```
DELETE /v1/schools/{schoolId}/direct-messages/{messageId}?person_id={personId}
```
- Only the sender can delete their own sent messages

### 7. Get messages by thread (for conversation view, optional)
```
GET /v1/schools/{schoolId}/direct-messages
  ?filters=thread_id::eq::{threadId}
```

### 8. Search potential recipients
```
GET /schools/{schoolId}/message-recipients       ← uses `api`, NOT communicationApi
  ?person_id={currentPersonId}
  &person_type={currentPersonType}               // e.g. "USER", "TEACHER"
  &search_term={text}                            // debounce 400ms
  &target_person_type={type}                     // optional filter, e.g. "STUDENT"
```

Returns array of recipient candidates. Each item:
```json
{
  "person_id": 2565,
  "person_internal_id": "9210014",
  "full_name": "CAJA 1 CAJA",
  "given_name": "CAJA",
  "paternal_name": "1",
  "maternal_name": "CAJA",
  "person_type": "USER",
  "job_position": "Administrador",
  "academic_year_key": null,
  "academic_stage_key": null,
  "academic_group_key": null
}
```

### 9. Get allowed recipient types
Derive from school config using `getSchool()` (`@/services/auth.service`):

```ts
import { getSchool } from "@/services/auth.service";
import { IInotyRecipientsConfig } from "@/interfaces/ISchool";

const SENDER_TYPE_NORMALIZE: Record<string, string> = {
  usuario: 'USER', teacher: 'TEACHER', student: 'STUDENT',
  relative: 'RELATIVE', academico: 'ACADEMIC',
};

const getAllowedRecipientTypes = async (schoolId: string, senderType: string): Promise<string[]> => {
  const school = await getSchool(schoolId);
  const recipientsConfig: IInotyRecipientsConfig =
    school.inoty_config?.inoty_recipients_config ?? {};
  const normalized = SENDER_TYPE_NORMALIZE[senderType.toLowerCase()] ?? senderType.toUpperCase();
  const targetsMap = recipientsConfig[normalized] ?? {};
  return Object.entries(targetsMap)
    .filter(([, scope]) => scope !== 'NONE' && scope !== null)
    .map(([targetType]) => targetType.toUpperCase());
};
```

---

## Service to create: `src/services/directMessage.service.ts`

```ts
import communicationApi from "./communicationApi";
import api from "./api";
import { DirectMessageRead, DirectMessageCreateDto } from "@/interfaces/IDirectMessage";

export const getReceivedMessages = async (schoolId: string, personId: number) => {
  const filters = `recipient_person_id::eq::${personId},only_active_recipient::eq::True`;
  const res = await communicationApi.get<DirectMessageRead[]>(
    `/v1/schools/${schoolId}/direct-messages`, { params: { filters } }
  );
  return res.data;
};

export const getSentMessages = async (schoolId: string, personId: number) => {
  const filters = `sender_person_id::eq::${personId}`;
  const res = await communicationApi.get<DirectMessageRead[]>(
    `/v1/schools/${schoolId}/direct-messages`, { params: { filters } }
  );
  return res.data;
};

export const getMessageById = async (schoolId: string, messageId: string) => {
  const res = await communicationApi.get<DirectMessageRead>(
    `/v1/schools/${schoolId}/direct-messages/${messageId}`
  );
  return res.data;
};

export const sendMessage = async (schoolId: string, dto: DirectMessageCreateDto) => {
  const res = await communicationApi.post<DirectMessageRead>(
    `/v1/schools/${schoolId}/direct-messages`, dto
  );
  return res.data;
};

export const markAsRead = async (schoolId: string, messageId: string, recipientId: string) => {
  await communicationApi.post(
    `/v1/schools/${schoolId}/direct-messages/${messageId}/recipients/${recipientId}/reads`
  );
};

export const deleteMessage = async (schoolId: string, messageId: string, personId: number) => {
  await communicationApi.delete(
    `/v1/schools/${schoolId}/direct-messages/${messageId}`,
    { params: { person_id: String(personId) } }
  );
};

export const searchRecipients = async (
  schoolId: string,
  personId: number,
  personType: string,
  searchTerm: string,
  targetPersonType?: string,
) => {
  const params: any = {
    person_id: personId,
    person_type: personType,
    search_term: searchTerm,
    ...(targetPersonType ? { target_person_type: targetPersonType } : {}),
  };
  const res = await api.get(`/schools/${schoolId}/message-recipients`, { params });
  return res.data as RecipientCandidate[];
};

export interface RecipientCandidate {
  person_id: number;
  person_internal_id: string;
  full_name: string;
  given_name: string | null;
  paternal_name: string | null;
  maternal_name: string | null;
  person_type: string;
  job_position: string | null;
  academic_year_key: string | null;
  academic_stage_key: string | null;
  academic_group_key: string | null;
}
```

---

## Feature Behaviour

### View 1 — Message List (`/apps/direct-messages`)

- Two tabs: **Recibidos** and **Enviados**, each with a badge showing the count.
- Load both lists in parallel on mount with `Promise.all`.
- Pull-to-refresh (reload both tabs).

**Each message card shows:**
- Unread indicator dot (blue/primary) — only for unread received messages
- **"De: [senderName]  [senderTypeLabel]"** (Recibidos) or **"Para: [recipientName]  [recipientTypeLabel]"** (Enviados)
- Date (formatted: today → HH:mm, yesterday → "Ayer", older → DD/MM/YY)
- Subject (bold if unread)
- Read status badge: "Nuevo" (unread) / "Leído" (read) — Recibidos only
- Action icon: reply arrow (Recibidos) / trash (Enviados)

**Actions:**
- Click card body → open detail view
- Click reply icon → open compose in reply mode
- Click trash icon → confirm delete, then DELETE API call and remove from list

**Empty state:** icon + "No hay mensajes recibidos / enviados"

### View 2 — Message Detail

Shown when clicking a card. Can be implemented as a modal or a sub-route (`/apps/direct-messages/{id}`).

**Header:**
1. Date — full format (e.g. "3 de julio de 2026, 17:37"), right-aligned
2. "De: [senderName]  [tipo]" or "Para: [recipientName]  [tipo]" — depending on `isSentByMe`
3. Subject

**Body:** plain text (`white-space: pre-wrap`)

**Actions:**
- "Volver" button
- "Responder" button (disabled for sent messages) → opens compose in reply mode

**Mark as read:**
- Fire-and-forget on open, only if `!isSentByMe` and `isUnread(msg)`
- After call, optimistically update local state to mark as read and remove the unread dot

### View 3 — Compose / Reply

A form panel (modal or inline section) with:

**Fields:**
| Field | Behaviour |
|-------|-----------|
| Para | Read-only display when pre-filled (reply/create-from-selector). Editable via "Buscar destinatario" button when creating fresh. |
| Asunto | Text input. Pre-filled with "Re: [original subject]" in reply mode |
| Mensaje | Textarea (at least 4 rows). Pre-filled with quoted original in reply mode: `\n\n--- Mensaje original ---\nDe: [name]\nFecha: [date]\nAsunto: [subject]\n\n[body]` |

**Validation:**
- All three fields required
- Show inline error if any is empty on submit attempt

**On send:**
- Payload:
  ```ts
  {
    subject: asunto,
    body: cuerpo,
    recipients: [String(recipientPersonId)],
    sender_id: String(personId),
    // only for reply:
    thread_id: mensajePadre.thread_id,
    parent_direct_message_id: mensajePadre.id,
  }
  ```
- On success: show success toast/alert, close compose, refresh list
- On error: show inline `alert-error`

### View 4 — Recipient Selector

A modal/panel with:

1. **Person type filter pills** — loaded from school config (`getAllowedRecipientTypes`). One pill per allowed type + "Todos" pill. Active pill highlighted in primary color.
2. **Search input** — debounced 400ms. Triggers `searchRecipients()` on type change or input change.
3. **Results list** — each row:
   - Avatar circle with initials (colored by type)
   - Full name + type label (in Spanish) + job_position (if present)
4. **Select** → pre-fill recipient in compose form and close selector

**Color map for avatar backgrounds:**
```ts
const TYPE_COLOR: Record<string, string> = {
  USER:     '#1565C0',
  STUDENT:  '#2E7D32',
  TEACHER:  '#6A1B9A',
  RELATIVE: '#E65100',
  ACADEMIC: '#37474F',
};
```

**Empty state:** "Sin resultados" after searching; "Selecciona un tipo o escribe para buscar" before first search.

---

## Files to Create

```
src/
  interfaces/
    IDirectMessage.ts             ← DirectMessageRead, DirectMessageRecipient,
                                     DirectMessageAttachment, DirectMessageCreateDto

  services/
    directMessage.service.ts      ← all API calls + RecipientCandidate

  app/(admin)/apps/direct-messages/
    page.tsx                      ← server wrapper → <DirectMessagesPage />
    DirectMessagesPage.tsx        ← "use client"; tabs + list
    components/
      DirectMessageCard.tsx       ← single card in the list
      DirectMessageDetailModal.tsx ← detail view (modal or panel)
      ComposeModal.tsx            ← compose/reply form
      RecipientSelectorModal.tsx  ← search + select recipient
    hooks/
      useDirectMessages.ts        ← load received+sent, delete, markRead, optimistic updates
      useCompose.ts               ← form state, validation, send
      useRecipientSearch.ts       ← allowed types, debounced search
    utils/
      directMessage.utils.ts      ← PERSON_TYPE_LABEL, getSenderName, getRecipientName,
                                     isSentByMe, isUnread, getFirstRecipient
```

---

## useDirectMessages Hook Skeleton

```ts
"use client";
import { useState, useCallback } from "react";
import { DirectMessageRead } from "@/interfaces/IDirectMessage";
import {
  getReceivedMessages, getSentMessages,
  deleteMessage, markAsRead
} from "@/services/directMessage.service";
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
    } catch (e: any) {
      setError(e.message || "Error al cargar mensajes");
    } finally {
      setLoading(false);
    }
  }, [personId]);

  const handleDelete = async (msg: DirectMessageRead) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId) return;
    setSent((prev) => prev.filter((m) => m.id !== msg.id));
    try {
      await deleteMessage(schoolId, msg.id, personId);
    } catch {
      setSent((prev) => [msg, ...prev]); // revert
    }
  };

  const handleMarkAsRead = async (msg: DirectMessageRead) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId) return;
    if (isSentByMe(msg, personId) || !isUnread(msg)) return;
    const recipient = getFirstRecipient(msg);
    if (!recipient?.recipient_id) return;
    // Optimistic update
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
```

---

## Key Constraints

1. **No SSR** — all components are `"use client"` (depend on `localStorage` and Zustand).
2. **Recipient search uses `api`** (core backend), not `communicationApi`. Do not mix them up.
3. **Mark-as-read is fire-and-forget** — never block navigation waiting for it; update UI optimistically.
4. **Delete is sender-only** — only show the trash icon when `isSentByMe(msg, personId)` is true.
5. **Reply pre-fills sender as recipient** — the `nombreUsuario` / `sender_id` of the received message becomes the recipient of the reply.
6. **Thread continuity** — always pass `thread_id` and `parent_direct_message_id` when replying, so the backend links the conversation.
7. **Allowed types** depend on the school's `inoty_config.inoty_recipients_config` and the sender's person type. If the config is absent or returns empty, show all types in the search filter.
8. **Styling** — DaisyUI only. Unread messages: bold subject + primary-colored dot indicator. Read messages: normal weight.
