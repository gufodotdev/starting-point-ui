import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "default",
  description: "Share document",
};

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Share Document
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Invite others to view or edit this document and work together
            seamlessly.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            type="text"
            readOnly
            defaultValue="https://example.com/doc/abc123"
          />
          <button className="btn btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
        <div className="separator"></div>
        <div className="grid gap-6">
          <span className="text-sm font-medium">People with access</span>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                className="avatar"
                src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
                alt="Sarah Johnson"
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-muted-foreground">sarah@example.com</p>
              </div>
            </div>
            <select className="select h-8 w-22">
              <option value="write">Write</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                className="avatar"
                src="https://cdn.gufo.dev/stockphotos/7bd8889a.webp"
                alt="Michael Chen"
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Michael Chen</p>
                <p className="text-muted-foreground">michael@example.com</p>
              </div>
            </div>
            <select className="select h-8 w-22">
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                className="avatar"
                src="https://cdn.gufo.dev/stockphotos/a8a338c1.webp"
                alt="Emma Wilson"
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Emma Wilson</p>
                <p className="text-muted-foreground">emma@example.com</p>
              </div>
            </div>
            <select className="select h-8 w-22">
              <option value="read">Read</option>
              <option value="write">Write</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
