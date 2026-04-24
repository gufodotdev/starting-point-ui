import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "default",
  description: "Blog post",
};

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <img
        src="https://cdn.gufo.dev/stockphotos/fdab3fb9.webp"
        alt="Blog post cover"
        className="aspect-3/2 object-cover rounded-t-card w-full"
      />
      <div className="card-content grid gap-6">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight text-accent">
            <span>Mar 15, 2024</span>
            <span>·</span>
            <span>Design</span>
          </span>
          <h3 className="text-lg font-semibold tracking-tight mt-2">
            Design Systems with Tailwind
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Learn how utility classes can help you build and scale a beautiful
            design system across projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img
            className="avatar"
            src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
            alt="Sarah Johnson"
          />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Sarah Johnson</p>
            <p className="text-muted-foreground">Product Designer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
