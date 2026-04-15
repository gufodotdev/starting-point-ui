import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default", description: "Sign up form" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Sign Up</h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Create an account to get started on the platform and unlock all
            features and benefits.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <button className="btn" type="button">
            <i className="ri-google-fill"></i>Google
          </button>
          <button className="btn" type="button">
            <i className="ri-github-fill"></i>GitHub
          </button>
        </div>
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
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="input"
              id="password"
              type="password"
              name="password"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Create Account
          </button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a
            href="#"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
