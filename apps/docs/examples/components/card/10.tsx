import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <img
        src="https://cdn.gufo.dev/stockphotos/f5ddf336.webp"
        alt="Album cover"
        className="aspect-square object-cover rounded-t-xl w-full"
      />
      <div className="card-content grid gap-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold tracking-tight">
            Midnight Dreams
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">Luna Eclipse</p>
        </div>
        <div className="grid gap-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button className="btn btn-ghost btn-icon">
            <i className="ri-shuffle-line" />
          </button>
          <button className="btn btn-ghost btn-icon">
            <i className="ri-skip-back-fill" />
          </button>
          <button className="btn btn-primary btn-icon">
            <i className="ri-pause-fill" />
          </button>
          <button className="btn btn-ghost btn-icon">
            <i className="ri-skip-forward-fill" />
          </button>
          <button className="btn btn-ghost btn-icon">
            <i className="ri-repeat-line" />
          </button>
        </div>
      </div>
    </div>
  );
}
