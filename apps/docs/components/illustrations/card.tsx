export function CardIllustration() {
  return (
    <div className="pointer-events-none [--border:--alpha(var(--color-black)/7%)] [--btn-from:--alpha(var(--color-primary)/90%)] [--btn-to:var(--color-primary)] dark:[--border:--alpha(var(--color-white)/3%)] dark:[--btn-from:var(--color-primary)] dark:[--btn-to:--alpha(var(--color-primary)/90%)]">
      <div className="relative flex w-full max-w-36 mx-auto flex-col rounded-2xl border bg-linear-to-b from-[color-mix(in_srgb,var(--card)_96%,var(--color-white))] to-[color-mix(in_srgb,var(--card)_99%,var(--color-black))] text-card-foreground shadow-md/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_-1px_--theme(--color-white/6%),0_1px_--theme(--color-black/6%)] not-dark:bg-clip-padding dark:to-[color-mix(in_srgb,var(--card)_98%,var(--color-white))] [--radius-2xl:14px] overflow-hidden">
        <div className="h-20 bg-muted/60 border-b flex items-center justify-center">
          <svg className="size-6 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3.5">
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-[55%] rounded-full bg-muted-foreground/40" />
            <div className="h-1.5 w-[85%] rounded-full bg-muted-foreground/20" />
          </div>
          <div className="h-3.5 w-full rounded-sm bg-linear-to-b from-(--btn-from) to-(--btn-to)" />
        </div>
      </div>
    </div>
  );
}
