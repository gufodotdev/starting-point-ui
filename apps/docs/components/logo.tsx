import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-base whitespace-nowrap">
      <span className="font-semibold tracking-tight">Starting Point </span>
      <span className="font-normal text-muted-foreground tracking-wide">
        UI
      </span>
    </Link>
  );
}
