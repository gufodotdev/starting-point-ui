import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center size-6 rounded-sm overflow-hidden shrink-0 bg-primary text-primary-foreground text-sm font-bold">
        ui
      </div>
      <div className="text-sm font-medium truncate">Starting Point</div>
    </Link>
  );
}
