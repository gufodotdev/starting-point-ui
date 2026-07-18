export default function PremiumPlan() {
  return (
    <div className="card">
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 size-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Up to 10 team members</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 size-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>50GB cloud storage</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 size-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Priority email support</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 size-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Advanced analytics dashboard</span>
          </li>
          <li className="flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 size-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
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
