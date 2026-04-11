"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { searchDocs, type SearchResult } from "@/lib/search";

export function SearchDialog() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = useCallback(() => {
    if (dialogRef.current) {
      window.sp?.dialog.open(dialogRef.current);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  const closeDialog = useCallback(() => {
    if (dialogRef.current) {
      window.sp?.dialog.close(dialogRef.current);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
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
        setSelectedIndex(0);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      closeDialog();
    }
  }

  function navigateToResult(result: SearchResult) {
    closeDialog();
    router.push(`/docs/${result.slug}`);
  }

  return (
    <>
      {/* Mobile: icon button */}
      <button
        type="button"
        className="btn btn-ghost btn-icon-sm md:hidden"
        aria-label="Search documentation"
        onClick={openDialog}
      >
        <Search className="size-4" />
      </button>

      {/* Desktop: input-style button */}
      <button
        type="button"
        className="hidden md:inline-flex items-center gap-2 rounded-md border bg-background hover:bg-muted/50 dark:bg-card dark:hover:bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground shadow-none h-8 w-48 lg:w-56 xl:w-64 justify-start relative"
        onClick={openDialog}
      >
        <Search className="size-4" />
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="absolute right-1.5 top-1.5 pointer-events-none inline-flex h-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none">
          ⌘K
        </kbd>
      </button>

      <dialog ref={dialogRef} id="search-dialog" className="dialog">
        <div className="dialog-backdrop" onClick={closeDialog}></div>
        <div className="dialog-panel w-[calc(100%-2rem)] max-w-lg rounded-xl border-none bg-card p-2 pb-11 shadow-2xl ring-4 ring-border/80 dark:bg-card">
          <div className="relative">
            <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/50 px-3">
              <Search
                className="size-4 shrink-0 opacity-50"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search documentation..."
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="max-h-80 min-h-40 overflow-y-auto overflow-x-hidden p-1">
            {isSearching && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!isSearching && query && results.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {!query && !isSearching && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Start typing to search...
              </div>
            )}

            {results.length > 0 && (
              <div className="overflow-hidden p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Results
                </div>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    aria-selected={index === selectedIndex}
                    data-selected={index === selectedIndex}
                    className="relative flex w-full cursor-default select-none items-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-sm outline-none data-[selected=true]:border-border data-[selected=true]:bg-muted/50"
                    onClick={() => navigateToResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="line-clamp-1">{result.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t bg-muted/50 px-4 text-xs font-medium text-muted-foreground">
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
