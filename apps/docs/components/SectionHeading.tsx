import { cn } from "@/lib/utils";

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h4 className={cn("text-xs text-muted-foreground font-medium", className)}>
      {children}
    </h4>
  );
}
