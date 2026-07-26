import Link from "next/link";

export function TocCta() {
  return (
    <div className="group relative flex flex-col gap-2 rounded-lg bg-muted p-6 text-sm">
      <div className="text-base font-semibold leading-tight text-balance group-hover:underline">
        Build faster with ready-made examples
      </div>
      <div className="text-muted-foreground">
        A growing collection of examples built with Starting Point UI
        components.
      </div>
      <span className="btn btn-sm mt-2 w-fit">Browse examples</span>
      <Link href="/examples" className="absolute inset-0">
        <span className="sr-only">Browse the example gallery</span>
      </Link>
    </div>
  );
}
