import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "default",
  description: "User profile",
};

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <img
          src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
          alt="Sarah Johnson"
          className="w-full aspect-square object-cover rounded-card"
        />
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Sarah Johnson
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Product Designer who focuses on simplicity &amp; usability.
            Currently designing at Acme Inc.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
            <span>312</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
            <span>48</span>
          </div>
          <button className="btn btn-primary btn-sm ml-auto">
            Follow
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
