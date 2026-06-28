"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Title-case a URL segment as a fallback when it isn't a known label.
function humanize(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const SECTION_LABELS: Record<string, string> = {
  docs: "Docs",
  guides: "Guides",
  components: "Components",
  examples: "Examples",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  // Build cumulative crumbs; the last one is the current page.
  const crumbs = segments.map((segment, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: SECTION_LABELS[segment] ?? humanize(segment),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav className="breadcrumb max-md:hidden" aria-label="Breadcrumb">
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="contents">
          {crumb.isLast ? (
            <span className="breadcrumb-page" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <>
              <Link href={crumb.href} className="breadcrumb-link">
                {crumb.label}
              </Link>
              <span className="breadcrumb-separator" aria-hidden="true">
                <ChevronRight />
              </span>
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
