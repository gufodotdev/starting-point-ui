import { Check } from "lucide-react";

export default function PremiumPlan() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-header">
        <h3 className="card-title">Premium Plan</h3>
      </div>
      <div className="card-content flex flex-col gap-6">
        <div>
          <span className="text-4xl font-bold sm:text-5xl">$29</span>
          <span className="ml-1 text-muted-foreground">/ month</span>
        </div>
        <p className="text-sm/6 text-muted-foreground">
          Everything you need to scale your project and collaborate with
          your entire team.
        </p>
        <div className="separator"></div>
        <ul className="grid gap-4 text-sm">
          <li className="flex items-center text-muted-foreground">
            <Check className="mr-4 size-4 text-primary" />
            <span>Up to 10 team members</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <Check className="mr-4 size-4 text-primary" />
            <span>50GB cloud storage</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <Check className="mr-4 size-4 text-primary" />
            <span>Priority email support</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <Check className="mr-4 size-4 text-primary" />
            <span>Advanced analytics dashboard</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <Check className="mr-4 size-4 text-primary" />
            <span>API access</span>
          </li>
        </ul>
      </div>
      <div className="card-footer">
        <button className="btn btn-lg w-full">Buy Now</button>
      </div>
    </div>
  );
}
