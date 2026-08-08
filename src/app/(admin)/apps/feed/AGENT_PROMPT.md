# Implement the Feed (Noticias) Feature in Next.js

## Context and Goal

You are implementing the **Feed (Noticias)** feature for a Next.js web admin portal called **Interschool**. The feature already exists in a companion React Native mobile app. Your job is to replicate its behaviour, API calls, and data schema in Next.js, following the existing conventions of this project.

The target directory is:
```
src/app/(admin)/apps/feed/
```

---

## Project Conventions You Must Follow

### Stack
- Next.js App Router (`"use client"` directive on every interactive component)
- TypeScript
- **DaisyUI + Tailwind CSS** for all styling — use DaisyUI component classes (`card`, `btn`, `badge`, `modal`, `alert`, `loading`, etc.)
- **Iconify** for icons: `<span className="iconify lucide--{icon-name} size-5"></span>` — never import icon libraries
- `axios` instances imported from `@/services/communicationApi` (already configured with auth interceptors)
- `moment` for relative date formatting

### Auth and School
```ts
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";

const personId = useAuthStore((state) => state.personId);        // number | null
const personPhoto = useAuthStore((state) => state.personPhoto);  // string | null
const name = useAuthStore((state) => state.name);                // string | null
const { schoolId } = getOrgConfig();                             // string | null from localStorage
```

### Existing Shared Components (import from `@/components/`)
- `<PageTitle title="..." items={[{label:...}, {label:..., active:true}]} />`
- `<LoadingSpinner message="..." />`
- `<DeleteConfirmationModal isOpen onConfirm onCancel loading />`

### Service Pattern
```ts
// src/services/feed.service.ts
import communicationApi from "./communicationApi";
export const someCall = async ({ schoolId, ... }) => {
  const response = await communicationApi.get(`/v1/schools/${schoolId}/feeds`);
  return response.data;
};
```

### Page Pattern
```tsx
// page.tsx — server component wrapper, no "use client"
import FeedListPage from "./FeedListPage";
export default function Page() { return <FeedListPage />; }
```

---

## API Reference

**Base URL:** `process.env.NEXT_PUBLIC_API_COMMUNICATION_URL` — already wired into `communicationApi`. No manual auth headers needed; the axios interceptor adds Bearer token, `x-url-origin`, and `x-device-id` automatically.

### 1. List Feeds (paginated)
```
GET /v1/schools/{schoolId}/feeds
  ?offset={offset}
  &limit={limit}
  &filters=authorized::eq::true,person_id::eq::{personId},start_date::lte::{nowISO},end_date::gte::{nowISO}
```

- `nowISO` format: `new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')` → `"2026-06-10T15:30:00Z"`
- `personId` is the numeric person ID from `useAuthStore` cast to string in the filter
- Use `limit=5` (consistent with mobile app)
- Returns `FeedRead[]`

### 2. Get Single Feed
```
GET /v1/schools/{schoolId}/feeds/{feedId}
```

### 3. Create Feed
```
POST /v1/schools/{schoolId}/feeds
```
Body:
```json
{
  "title": "Noticia App",
  "publisher_person_id": "{personId as string}",
  "content": "{html string}",
  "start_date": "{nowISO}",
  "end_date": "{oneYearFromNowISO}",
  "accept_comments": true,
  "created_by": "{userId string}",
  "status": "ACTIVO",
  "authorized": true,
  "persons": [],
  "academic_years": [],
  "academic_stages": [],
  "academic_programs": [],
  "academic_modalities": [],
  "program_years": [],
  "academic_groups": [],
  "attachments": []
}
```

### 4. Delete Feed
```
DELETE /v1/schools/{schoolId}/feeds/{feedId}
```
Only the author can delete (compare `feed.publisher?.id` to `String(personId)`).

### 5. Like / Unlike Feed
```
POST   /v1/schools/{schoolId}/feeds/{feedId}/likes
DELETE /v1/schools/{schoolId}/feeds/{feedId}/likes/{likeId}
```
The POST response will contain the `id` of the like — store it on the feed object as `idUserLiked` for later deletion.

### 6. Comments on a Feed
```
GET    /v1/schools/{schoolId}/feeds/{feedId}/comments
POST   /v1/schools/{schoolId}/feeds/{feedId}/comments
DELETE /v1/schools/{schoolId}/feeds/{feedId}/comments/{commentId}
```

---

## Data Model

```ts
// src/interfaces/IFeed.ts

export interface FeedRead {
  id: string;
  school_id: number;
  title: string | null;
  content: string | null;         // HTML string (rich text)
  start_date: string | null;      // ISO date-time
  end_date: string | null;        // ISO date-time
  accept_comments: boolean;
  views: number;
  likes: number;
  comments: number;               // count
  authorized: boolean;
  status: string | null;          // "ACTIVO"
  created_at: string | null;
  modified_at: string | null;
  created_by: string | null;
  user_liked: boolean | null;
  idUserLiked?: string;           // populated after a like call
  publisher: {
    id: string;
    school_id: number;
    given_name: string | null;
    paternal_surname: string | null;
    maternal_surname?: string | null;
    profile_picture_url: string | null;
    official_picture_url?: string | null;
    type?: string | null;
  } | null;
  attachments: FeedAttachment[] | null;
}

export interface FeedAttachment {
  id: string;
  school_id: number;
  file_name: string;
  file_path: string;
  file_type: string;          // e.g. "image/jpeg", "application/pdf"
  file_size: number;
  bucket_name: string;
  public_url: string;
  uploaded_at: string;
  content_id: string | null;
  is_inline: boolean;         // true = embedded in content body; false = downloadable attachment
  inline_position: number;
}

export interface FeedComment {
  id: string;
  text: string;
  created_at: string;
  person: {
    id: string;
    given_name: string | null;
    paternal_surname: string | null;
    profile_picture_url: string | null;
  } | null;
}

export interface FeedCreateDto {
  title: string;
  publisher_person_id: string;
  content: string;
  start_date: string;
  end_date: string;
  accept_comments: boolean;
  created_by?: string;
  status: string;
  authorized: boolean;
  persons: string[];
  academic_years: string[];
  academic_stages: string[];
  academic_programs: string[];
  academic_modalities: string[];
  program_years: string[];
  academic_groups: string[];
  attachments: any[];
}
```

---

## Feature Behaviour

### Feed List Page (`/apps/feed`)

1. **Initial load**: Fetch with `offset=0, limit=5`. Show `<LoadingSpinner />` during load.
2. **Load more**: Show a "Cargar más" button at the bottom. On click, fetch the next page (`offset += 5`) and **append** results to the existing list. When the API returns fewer than `limit` items (or an empty array), hide the button and show a static inline message "No hay más noticias".
3. **Each card** displays:
   - Publisher avatar (`profile_picture_url` → fallback to DaisyUI `avatar placeholder` with initials)
   - Publisher full name: `given_name + ' ' + paternal_surname`
   - Relative time using `moment.utc(feed.start_date).local().locale('es').fromNow()`
   - HTML content rendered via `dangerouslySetInnerHTML={{ __html: feed.content ?? '' }}` inside a `prose prose-sm max-w-none` container
   - Non-inline attachments (`is_inline === false`): images as thumbnail grid (click to open in new tab); PDF/other files as download rows with file name
   - Like button (filled icon when `user_liked`, outline otherwise) with count
   - Comments button (disabled when `accept_comments === false`) with count — clicking opens a comments modal
   - Delete button (trash icon) — only when `feed.publisher?.id === String(personId)`. Clicking opens a confirmation modal, then calls DELETE.
4. **Empty state**: Large icon + "No hay noticias disponibles" + optional create button.
5. **Error state**: DaisyUI `alert-error` with message + retry button.

### Like / Unlike (optimistic)

- Toggle `user_liked` and ±1 `likes` in UI immediately before the API call.
- Debounce the actual API call 500 ms to handle rapid tapping.
- On API error, revert the optimistic update.

### Comments Modal

- Opens as a DaisyUI modal when the comment button is clicked.
- Loads comments for that feed item (`GET /feeds/{id}/comments`).
- Displays list: avatar, name, text, relative time.
- Textarea at the bottom + "Enviar" button.
- Current user's own comments have a delete icon.
- On submit/delete, update local comment list and ±1 the feed's `comments` count in the main list.

### Create Feed Page (`/apps/feed/create`)

#### Step 1 — Content form fields
- **Contenido** (required): `<textarea>` for the message. Wrap submitted text as `<p>{content}</p>` for the `content` HTML field.
- **Acepta comentarios**: DaisyUI toggle (default `true`)
- **Archivos adjuntos** (optional): see multimedia section below.

#### Step 2 — Recipient mode selector

Show two mutually exclusive options as a styled radio/card selector at the top of the form:

| Option | Label | Icon | Behaviour |
|--------|-------|------|-----------|
| `todos` | Todos | `lucide--users` | On page load, fetch all active recipients and send them all as `persons` |
| `especificos` | Selección específica | `lucide--user-check` | Show full recipient selector flow below |

Default to `todos`.

#### Step 3a — "Todos" mode: pre-load all recipients on mount

When the page loads (or when the user switches back to `todos` mode), **automatically** fetch all enrolled persons using the following sequence. Do not wait for the user to click anything — this runs in the background and shows a loading indicator near the mode label.

```ts
import { getActiveAcademicYears } from "@/services/academic-year.service";
import { getRecipientsWithEnrollmentFilters } from "@/services/recipient.service";
import { PersonType } from "@/interfaces/IRecipient";

const loadAllRecipients = async () => {
  setLoadingAllRecipients(true);
  try {
    // 1. Get all active academic years
    const activeYears = await getActiveAcademicYears();
    if (activeYears.length === 0) {
      setAllRecipients([]);
      return;
    }
    // 2. Fetch all persons across all years (all 4 person types, no further filters)
    const recipients = await getRecipientsWithEnrollmentFilters(
      [PersonType.STUDENT, PersonType.RELATIVE, PersonType.TEACHER, PersonType.USER],
      { academic_years: activeYears.map((y) => y.id) }
    );
    setAllRecipients(recipients);  // store IRecipient[]
  } catch (e) {
    setAllRecipients([]);
  } finally {
    setLoadingAllRecipients(false);
  }
};

// Call on mount and whenever mode switches back to 'todos'
useEffect(() => {
  if (recipientMode === 'todos') loadAllRecipients();
}, [recipientMode]);
```

State needed for this mode:
```ts
const [allRecipients, setAllRecipients] = useState<IRecipient[]>([]);
const [loadingAllRecipients, setLoadingAllRecipients] = useState(false);
```

Show the recipient count once loaded: `"Destinatarios: {allRecipients.length}"` below the mode selector, with a spinner while loading.

#### Step 3b — "Selección específica" mode: manual recipient picker

Reuse the **existing components and hooks** from `@/app/(admin)/apps/publications/`. Do not reimplement them.

**Components** (from `@/app/(admin)/apps/publications/components`):
- `RecipientTypeSelector` — chip grid to pick STUDENT / RELATIVE / TEACHER / USER
- `AcademicSelector` — generic cascading selector (Academic Years → Stages → Programs → Program Years → Groups)
- `RecipientTable` — person table with individual checkboxes and a "Buscar Destinatarios" button

**Hooks** (from `@/app/(admin)/apps/publications/hooks`):
- `useAcademicData` — loads academic years, stages, programs, program years, groups
- `useSelections` — manages all `Set<number>` / `Set<string>` selection state and toggle handlers
- `useRecipients` — calls the recipient service and manages loading/error state
- `useUserRole` — returns `'admin' | 'teacher' | 'alumno' | 'unknown'`

**Cascade rules (same as PublicationsApp):**
1. Always show `RecipientTypeSelector`.
2. Show `AcademicSelector` for **Academic Years** when `!isOnlyUser` (i.e. selected types ≠ just USER).
3. Show **Niveles** (stages) selector when `isAdmin && !isOnlyUser`.
4. Show **Programas** selector when `selectedAcademicStages.size > 0`.
5. Show **Años de Programa** selector when `selectedAcademicStages.size > 0 && selectedAcademicPrograms.size > 0`.
6. Show **Grupos** selector when `selectedProgramYears.size > 0`.
7. Show `RecipientTable` when `selectedRecipientTypes.size > 0`. The "Buscar Destinatarios" button inside it triggers `recipientsData.loadRecipients(...)`.
8. Clear downstream selections whenever an upstream selector changes — follow the same `useEffect` chain in `PublicationsApp`.

**`useEffect` chain to copy into `CreateFeedPage`:**
```ts
useEffect(() => {
  academicData.loadAcademicPrograms(selections.selectedAcademicStages);
  selections.setSelectedAcademicPrograms(new Set());
}, [selections.selectedAcademicStages]);

useEffect(() => {
  academicData.loadProgramYears(selections.selectedAcademicStages, selections.selectedAcademicPrograms);
  selections.setSelectedProgramYears(new Set());
}, [selections.selectedAcademicStages, selections.selectedAcademicPrograms]);

useEffect(() => {
  academicData.loadAcademicGroups(selections.selectedProgramYears);
  selections.setSelectedAcademicGroups(new Set());
}, [selections.selectedProgramYears]);

useEffect(() => {
  recipientsData.clearRecipients();
  selections.setSelectedRecipients(new Set());
}, [
  selections.selectedRecipientTypes,
  selections.selectedAcademicYears,
  selections.selectedAcademicStages,
  selections.selectedAcademicPrograms,
  selections.selectedProgramYears,
  selections.selectedAcademicGroups,
]);
```

**Load recipients handler:**
```ts
const handleLoadRecipients = () => {
  recipientsData.loadRecipients(
    selections.selectedRecipientTypes,
    {
      academic_years: selections.selectedAcademicYears.size > 0 ? Array.from(selections.selectedAcademicYears) : undefined,
      academic_stages: selections.selectedAcademicStages.size > 0 ? Array.from(selections.selectedAcademicStages) : undefined,
      academic_programs: selections.selectedAcademicPrograms.size > 0 ? Array.from(selections.selectedAcademicPrograms) : undefined,
      program_years: selections.selectedProgramYears.size > 0 ? Array.from(selections.selectedProgramYears) : undefined,
      academic_groups: selections.selectedAcademicGroups.size > 0 ? Array.from(selections.selectedAcademicGroups) : undefined,
    },
    userRole
  );
};
```

#### Step 4 — Submit payload construction

```ts
const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const oneYearFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  .toISOString().replace(/\.\d{3}Z$/, 'Z');

// Resolve persons array based on mode
const personsArray: string[] =
  recipientMode === 'todos'
    ? allRecipients.map((r) => String(r.person_id))           // all pre-loaded recipients
    : Array.from(selections.selectedRecipients).map(String);  // manually chosen recipients

const payload: FeedCreateDto = {
  title: 'Noticia App',
  publisher_person_id: String(personId),
  content: `<p>${content}</p>`,
  start_date: now,
  end_date: oneYearFromNow,
  accept_comments: acceptComments,
  created_by: String(personId),
  status: 'ACTIVO',
  authorized: true,
  attachments: [],
  persons: personsArray,
  // Academic filter arrays — always empty for 'todos'; populated for 'especificos'
  academic_years: recipientMode === 'especificos'
    ? Array.from(selections.selectedAcademicYears).map(String) : [],
  academic_stages: recipientMode === 'especificos'
    ? Array.from(selections.selectedAcademicStages).map(String) : [],
  academic_programs: recipientMode === 'especificos'
    ? Array.from(selections.selectedAcademicPrograms).map(String) : [],
  academic_modalities: [],
  program_years: recipientMode === 'especificos'
    ? Array.from(selections.selectedProgramYears).map(String) : [],
  academic_groups: recipientMode === 'especificos'
    ? Array.from(selections.selectedAcademicGroups).map(String) : [],
};
```

#### Submit validation
- Mode `todos`: disable submit while `loadingAllRecipients` is true. Allow submit once recipients are loaded (even if `allRecipients.length === 0`, let the server decide).
- Mode `especificos`: require `selections.selectedRecipients.size > 0` before enabling the submit button. Show an inline error if the user tries to submit with no recipients selected.

#### Multimedia / Attachments

##### Upload endpoint
```
POST /v1/schools/{schoolId}/attachments?persist=false
Content-Type: multipart/form-data
Body field: file
```

This endpoint already has a wrapper in the project:
```ts
import { communicationService } from "@/services/communication.service";

const result: AttachmentResponse = await communicationService.uploadAttachment(schoolId, file);
```

`AttachmentResponse` (already defined in `@/services/communication.service.ts`):
```ts
{
  id: string;
  school_id: number;
  file_name: string;
  file_path: string;
  file_type: string;        // MIME type — "image/jpeg", "video/mp4", "application/pdf", etc.
  file_size: number;
  bucket_name: string;
  public_url: string;
  uploaded_at: string;
  content_id: string | null;
  is_inline: boolean;       // server returns false with persist=false
  inline_position: number;
}
```

##### Upload timing
Files are uploaded **before** calling the create feed API, one by one in a sequential loop. Only after all uploads succeed is the feed creation POST called. On any upload error, abort the full submit and show the specific file name that failed.

```ts
const uploadedAttachments: AttachmentResponse[] = [];
for (const file of pendingFiles) {
  try {
    const result = await communicationService.uploadAttachment(schoolId, file);
    uploadedAttachments.push(result);
  } catch {
    throw new Error(`Error al subir el archivo "${file.name}"`);
  }
}
// Then: payload.attachments = uploadedAttachments
```

##### Supported file types
All file types are accepted (`*/*`) — images, video, PDF, documents. The server stores whatever is uploaded and returns the MIME type in `file_type`. The feed list page already renders based on `file_type`:
- `image/*` → thumbnail (rendered inline below content)
- `video/*` → `<video controls>` element with `src={public_url}`
- everything else → download link with file name and size

##### UI component
Reuse the existing `AttachmentsManager` component from publications:
```ts
import { AttachmentsManager } from "@/app/(admin)/apps/publications/components/AttachmentsManager";
```

Props:
```ts
<AttachmentsManager
  attachments={pendingFiles}           // File[] — new files queued for upload
  existingAttachments={[]}             // IAttachmentRead[] — empty on create
  onAdd={(file) => setPendingFiles(prev => [...prev, file])}
  onRemove={(i) => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
  onRemoveExisting={() => {}}          // no-op on create
  publicationType="announcement"       // closest type — affects no feed-specific logic
/>
```

State needed:
```ts
const [pendingFiles, setPendingFiles] = useState<File[]>([]);
```

`AttachmentsManager` already handles drag-and-drop, click-to-open file picker, and a list of queued files with remove buttons. No custom file picker UI is needed.

##### `is_inline` behaviour
Feed attachments uploaded this way have `is_inline: false` (the server default for `persist=false`). This means they appear **below** the HTML content in the feed card — which is the correct behaviour. Do NOT pass `is_inline=true` in the query string; that is only used in the mobile app for embedding images inside the HTML body.

#### On save
- Upload all `pendingFiles` first (see above); abort and show error if any fail.
- `start_date` = now (ISO), `end_date` = 1 year from now (ISO)
- `payload.attachments` = array of `AttachmentResponse` objects returned from the upload calls
- On success: redirect to `/apps/feed?highlightId={newFeed.id}`
- On error: show DaisyUI `alert-error` inline (do not navigate away)

---

## Files to Create

```
src/
  interfaces/
    IFeed.ts

  services/
    feed.service.ts          ← getFeeds, getFeedById, createFeed, deleteFeed,
                                likeFeed, unlikeFeed,
                                getFeedComments, createFeedComment, deleteFeedComment

  app/(admin)/apps/feed/
    page.tsx                 ← server wrapper → <FeedListPage />
    FeedListPage.tsx         ← "use client"; list + load-more
    create/
      page.tsx               ← server wrapper → <CreateFeedPage />
      CreateFeedPage.tsx     ← "use client"; content form + recipient mode selector
                               + reused publications selectors + submit
    components/
      FeedCard.tsx
      FeedAttachments.tsx        ← renders images, videos, and download links for non-inline attachments
      FeedCommentModal.tsx
      FeedLikeButton.tsx
      RecipientModeSelector.tsx  ← "Todos" vs "Selección específica" card picker
      # AttachmentsManager is NOT duplicated here — import from publications/components
    hooks/
      useFeed.ts             ← pagination, loadMore, toggleLike, deleteById
      useFeedComments.ts     ← loadComments, addComment, deleteComment

  # DO NOT create new copies of these — import them directly:
  # @/app/(admin)/apps/publications/components/RecipientTypeSelector
  # @/app/(admin)/apps/publications/components/AcademicSelector
  # @/app/(admin)/apps/publications/components/RecipientTable
  # @/app/(admin)/apps/publications/hooks/useAcademicData
  # @/app/(admin)/apps/publications/hooks/useSelections
  # @/app/(admin)/apps/publications/hooks/useRecipients
  # @/app/(admin)/apps/publications/hooks/useUserRole
```

---

## useFeed Hook Reference Implementation

```ts
// hooks/useFeed.ts
"use client";
import { useState, useRef, useCallback } from "react";
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
    } catch (e: any) {
      setError(e.message || "Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  }, [personId]);

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
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = async (feed: FeedRead) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setFeeds((prev) =>
      prev.map((f) =>
        f.id === feed.id
          ? { ...f, user_liked: !f.user_liked, likes: f.user_liked ? f.likes - 1 : f.likes + 1 }
          : f
      )
    );
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
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === feed.id
            ? { ...f, user_liked: feed.user_liked, likes: feed.likes }
            : f
        )
      );
    }
  };

  const deleteById = async (feedId: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    await deleteFeed({ schoolId, feedId });
    setFeeds((prev) => prev.filter((f) => f.id !== feedId));
  };

  return { feeds, loading, loadingMore, hasMore, error, loadInitial, loadMore, toggleLike, deleteById };
};
```

---

## Key Constraints

1. **No SSR** — all components are `"use client"` because they depend on `localStorage` (`schoolId`) and Zustand stores.
2. **No "no more items" toast/modal** — just hide the load-more button and show a static inline text.
3. **HTML rendering** — feed `content` is safe admin-produced HTML; render with `dangerouslySetInnerHTML`. No sanitisation needed.
4. **Pagination is offset-based** — `offset` increments by `limit` each page; no cursor tokens.
5. **Like endpoint** — mirror the exact pattern used for announcements in `src/services/likes.service.ts`. If the feed-specific like endpoint turns out to differ, adapt accordingly.
6. **No WebSocket** — the mobile app's socket listener is an empty stub. Omit real-time updates entirely.
7. **Styling** — DaisyUI classes only. No inline styles, no separate CSS files.
8. **Inline attachments are already in the HTML** — do not render `is_inline === true` attachments separately. Only render `is_inline === false` ones below the content.
