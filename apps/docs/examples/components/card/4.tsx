import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6 card-content-lg">
        <h3 className="text-lg/snug font-semibold tracking-tight">
          Premium Plan
        </h3>
        <div>
          <span className="text-4xl font-bold sm:text-5xl">$29</span>
          <span className="text-muted-foreground ml-1">/ month</span>
        </div>
        <p className="text-sm/6 text-muted-foreground">
          Everything you need to scale your project and collaborate with your
          entire team.
        </p>
        <div className="separator"></div>
        <ul className="grid gap-4 text-sm">
          <li className="text-muted-foreground flex items-center">
            <i className="ri-check-line mr-4 text-lg/none text-green-600"></i>
            <span>Up to 10 team members</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <i className="ri-check-line mr-4 text-lg/none text-green-600"></i>
            <span>50GB cloud storage</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <i className="ri-check-line mr-4 text-lg/none text-green-600"></i>
            <span>Priority email support</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <i className="ri-check-line mr-4 text-lg/none text-green-600"></i>
            <span>Advanced analytics dashboard</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <i className="ri-check-line mr-4 text-lg/none text-green-600"></i>
            <span>API access</span>
          </li>
        </ul>
        <button className="btn btn-primary btn-lg w-full mt-2">Buy Now</button>
      </div>
    </div>
  );
}
