import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default", description: "Testimonial" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div className="flex gap-1">
          <i className="ri-star-fill text-lg/none text-primary"></i>
          <i className="ri-star-fill text-lg/none text-primary"></i>
          <i className="ri-star-fill text-lg/none text-primary"></i>
          <i className="ri-star-fill text-lg/none text-primary"></i>
          <i className="ri-star-fill text-lg/none text-primary"></i>
        </div>
        <div>
          <p className="text-sm/6 text-muted-foreground">
            Starting Point UI has transformed how we build interfaces. The
            components are beautifully designed and easy to customize.
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
