// Chromium only honors `size`/orientation from the single unnamed `@page`
// rule -- named pages (the `page: <name>` property + `@page <name> {...}`)
// only apply margin-box overrides, never `size`, so having several named
// `@page` rules in print.css for different screens (receipt vs. report vs.
// landscape report) silently falls back to the browser/printer default
// instead of the one the printed subtree actually wants.
//
// Working around that means swapping in a single unnamed `@page` rule with
// a <style> tag right before printing, scoped to just that print job.
//
// `filename`, when given, is used the same way: Chrome's "Guardar como
// PDF" suggests `document.title` as the filename, which is otherwise
// "<page> - Nexus" (src/app/layout.tsx's title template) -- not a name a
// cashier/admin would want on a saved report, so it's swapped out for the
// print job and restored right after.
export function printPage(size: string, margin: string = "12mm", filename?: string) {
  const style = document.createElement("style");
  style.media = "print";
  style.textContent = `@page { size: ${size}; margin: ${margin}; }`;
  document.head.appendChild(style);

  const previousTitle = document.title;
  if (filename) document.title = filename;

  const cleanup = () => {
    style.remove();
    if (filename) document.title = previousTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  window.print();
}
