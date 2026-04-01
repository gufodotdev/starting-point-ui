import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Notifications
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Choose how you want to be notified.
          </p>
        </div>
        <div className="grid gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <label className="label" htmlFor="email">
                Email notifications
              </label>
              <span className="text-sm text-muted-foreground">
                Receive updates and alerts via email.
              </span>
            </div>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              id="email"
              name="email"
              defaultChecked
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <label className="label" htmlFor="push">
                Push notifications
              </label>
              <span className="text-sm text-muted-foreground">
                Get instant alerts on your mobile device.
              </span>
            </div>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              id="push"
              name="push"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <label className="label" htmlFor="marketing">
                Marketing emails
              </label>
              <span className="text-sm text-muted-foreground">
                Stay informed about new features and offers.
              </span>
            </div>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              id="marketing"
              name="marketing"
            />
          </div>
        </div>
        <button className="btn">Save preferences</button>
      </div>
    </div>
  );
}
