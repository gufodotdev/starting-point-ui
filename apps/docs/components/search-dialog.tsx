"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { searchDocs, type SearchResult } from "@/lib/search";

export function SearchDialog({
  variant = "navbar",
}: {
  variant?: "navbar" | "sidebar";
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = useCallback(() => {
    const el = dialogRef.current;
    if (!el) return;
    window.sp?.dialog(el)?.show();
    setTimeout(() => el.querySelector("input")?.focus(), 50);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openDialog();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDialog]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        const searchResults = await searchDocs(query);
        setResults(searchResults);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const command = el.querySelector<HTMLElement>(".command");

    const onSelect = (e: Event) => {
      const href = ((e as CustomEvent).detail.item as HTMLElement).dataset.href;
      if (!href) return;
      window.sp?.dialog(el)?.hide();
      router.push(href);
    };

    const onHidden = () => {
      setQuery("");
      setResults([]);
    };

    command?.addEventListener("sp-select", onSelect);
    el.addEventListener("sp-hidden", onHidden);
    return () => {
      command?.removeEventListener("sp-select", onSelect);
      el.removeEventListener("sp-hidden", onHidden);
    };
  }, [router]);

  return (
    <>
      {variant === "sidebar" ? (
        /* Sidebar: styled like a menu button so its icon lines up with the nav
           items, but with a border/background so it reads as a search input. */
        <button
          type="button"
          className="sidebar-menu-button border bg-background text-muted-foreground shadow-none hover:bg-background dark:bg-card dark:hover:bg-card"
          onClick={openDialog}
        >
          <Search className="opacity-50" />
          <span>Search the docs...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 items-center justify-center rounded-sm bg-muted px-1 font-sans text-xs font-medium select-none">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Search documentation"
          onClick={openDialog}
        >
          <Search className="size-4" />
        </button>
      )}

      <dialog
        ref={dialogRef}
        id="search-dialog"
        className="dialog command-dialog"
      >
        <div className="dialog-panel">
          <h2 className="dialog-title sr-only">Search documentation</h2>
          <p className="dialog-description sr-only">
            Search for a page and jump to it.
          </p>
          <div className="command" data-sp-filter="false">
            <div className="input-group">
              <input
                className="input"
                type="search"
                placeholder="Search documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="input-group-addon">
                <Search className="size-4 shrink-0 opacity-50" />
              </span>
            </div>
            <div className="command-list min-h-40">
              <div className="command-empty">
                {isSearching
                  ? "Searching..."
                  : query
                    ? `No results found for "${query}"`
                    : "Start typing to search..."}
              </div>
              {results.length > 0 && (
                <div className="command-group">
                  <div className="command-label">Results</div>
                  {results.map((result) => (
                    <button
                      type="button"
                      className="command-item"
                      key={result.id}
                      data-href={`/${result.slug}`}
                    >
                      <span className="line-clamp-1">{result.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex h-10 items-center gap-2 border-t bg-muted/50 px-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium select-none">
                <CornerDownLeft className="size-3" />
              </kbd>
              Go to Page
            </div>
            <div className="h-4 w-px bg-border" role="separator"></div>
            <div className="flex items-center gap-1">
              <kbd className="pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium select-none">
                esc
              </kbd>
              Close
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
