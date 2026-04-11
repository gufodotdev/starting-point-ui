import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Sign In</h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Enter your credentials to access your account.
          </p>
        </div>
        <form className="field-group">
          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              className="input"
              id="email"
              type="email"
              placeholder="m@example.com"
              name="email"
            />
          </div>
          <div className="field">
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="password">
                Password
              </label>
              <a
                href="#"
                className="text-sm underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              className="input"
              id="password"
              type="password"
              name="password"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Sign In
          </button>
        </form>
        <div className="relative" role="separator">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="btn" type="button">
            <i className="ri-google-fill"></i>Google
          </button>
          <button className="btn" type="button">
            <i className="ri-github-fill"></i>GitHub
          </button>
        </div>
        <p className="text-sm text-center text-muted-foreground">
          Don&#x27;t have an account?{" "}
          <a
            href="#"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
