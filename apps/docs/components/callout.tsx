export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-2xl bg-muted p-4 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_p]:m-0">
      {children}
    </div>
  );
}
