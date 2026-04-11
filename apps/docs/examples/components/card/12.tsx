import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <img
          src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
          alt="Sarah Johnson"
          className="w-full aspect-square object-cover rounded-xl"
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
            <i className="ri-group-line text-muted-foreground" />
            <span>312</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <i className="ri-chat-3-line text-muted-foreground" />
            <span>48</span>
          </div>
          <button className="btn btn-primary btn-sm ml-auto">
            Follow
            <i className="ri-add-line" />
          </button>
        </div>
      </div>
    </div>
  );
}
