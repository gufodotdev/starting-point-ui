import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <img
        src="https://cdn.gufo.dev/stockphotos/1fb406af.webp"
        alt="Product"
        className="aspect-3/2 object-cover rounded-t-xl w-full"
      />
      <div className="card-content grid gap-6">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight text-accent">
            <span>Furniture</span>
          </span>
          <h3 className="text-lg font-semibold tracking-tight mt-2">
            Classic Wooden Table
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Handcrafted solid oak table with ergonomic design and natural
            finish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <i className="ri-star-fill text-lg/none text-primary"></i>
            <i className="ri-star-fill text-lg/none text-primary"></i>
            <i className="ri-star-fill text-lg/none text-primary"></i>
            <i className="ri-star-fill text-lg/none text-primary"></i>
            <i className="ri-star-fill text-lg/none text-muted"></i>
          </div>
          <span className="text-sm text-muted-foreground">(128)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">$149</span>
            <span className="text-sm text-muted-foreground line-through">
              $199
            </span>
          </div>
          <button className="btn btn-sm">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
