import { useEffect, useRef } from "react";

// Catalogs (products, colors, sizes, warehouses, ...) are fetched once on
// mount and then kept in plain useState -- if a screen was already open
// (or got restored from the browser's back/forward cache, or Next's
// client router cache) before something else created/changed a record,
// that snapshot never updates on its own. Re-running `reload` whenever
// the tab regains focus or becomes visible again keeps every screen built
// on top of this honest without requiring a manual full-page refresh.
export function useRefetchOnFocus(reload: () => void) {
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  useEffect(() => {
    const handleFocus = () => reloadRef.current();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") reloadRef.current();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
