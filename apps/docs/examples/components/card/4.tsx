import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "default",
  description: "Price listing",
};

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Up to 10 team members</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>50GB cloud storage</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Priority email support</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Advanced analytics dashboard</span>
          </li>
          <li className="text-muted-foreground flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 mr-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>API access</span>
          </li>
        </ul>
        <button className="btn btn-primary btn-lg w-full mt-2">Buy Now</button>
      </div>
    </div>
  );
}
