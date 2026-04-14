export function SidebarIllustration() {
  return (
    <div className="pointer-events-none [--border:--alpha(var(--color-black)/7%)] dark:[--border:--alpha(var(--color-white)/3%)]">
      <div className="relative flex h-40 w-full max-w-52 mx-auto rounded-2xl border bg-linear-to-b from-[color-mix(in_srgb,var(--card)_96%,var(--color-white))] to-[color-mix(in_srgb,var(--card)_99%,var(--color-black))] text-card-foreground shadow-md/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_-1px_--theme(--color-white/6%),0_1px_--theme(--color-black/6%)] not-dark:bg-clip-padding dark:to-[color-mix(in_srgb,var(--card)_98%,var(--color-white))] [--radius-2xl:14px] overflow-hidden">
        <div className="w-12 border-r bg-muted/40 flex flex-col p-2 py-3 gap-1">
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/30 mb-2" />
          <div className="h-1.5 w-full rounded-full bg-primary" />
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/15" />
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/15" />
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/15" />
          <div className="mt-auto h-1.5 w-full rounded-full bg-muted-foreground/15" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-7 border-b flex items-center gap-1.5 px-2">
            <div className="h-1 w-6 rounded-full bg-muted-foreground/20" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground/15" />
            <div className="h-1 w-8 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              <div className="flex-1 h-10 rounded-sm bg-muted/50" />
              <div className="flex-1 h-10 rounded-sm bg-muted/50" />
            </div>
            <div className="flex-1 rounded-sm bg-muted/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
