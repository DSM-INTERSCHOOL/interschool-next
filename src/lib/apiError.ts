/**
 * Extracts a human-readable message from an API error response.
 * Handles FastAPI-style `{ detail: string | { msg: string }[] }` payloads.
 * Falls back to `fallback` when nothing useful is found.
 */
export const getApiErrorMessage = (
  err: unknown,
  fallback = "Ocurrió un error. Intenta de nuevo."
): string => {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) return detail.trim();
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        if (typeof first === "string") return first;
        if (first && typeof first === "object" && "msg" in first)
          return String((first as { msg: unknown }).msg);
      }
    }
  }
  return fallback;
};
