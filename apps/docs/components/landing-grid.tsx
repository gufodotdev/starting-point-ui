// Inlined card masonry for the home page hero.

export function LandingGrid() {
  return (
    <div className="columns-4 gap-4 shrink-0">
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <img
            src="https://cdn.gufo.dev/stockphotos/1fb406af.webp"
            alt="Product"
            className="aspect-3/2 object-cover w-full"
          />
          <div className="card-content grid gap-6">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight text-muted-foreground">
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-muted"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
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
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <div className="card-content grid gap-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Share Document
              </h3>
              <p className="text-sm/6 text-muted-foreground mt-2">
                Invite others to view or edit this document and work together
                seamlessly.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="text"
                readOnly
                defaultValue="https://example.com/doc/abc123"
              />
              <button className="btn btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
            <div className="separator"></div>
            <div className="grid gap-6">
              <span className="text-sm font-medium">People with access</span>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="avatar">
                    <img className="avatar-image" src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp" alt="Sarah Johnson" />
                    <span className="avatar-fallback">SJ</span>
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      Sarah Johnson
                    </p>
                    <p className="text-muted-foreground">sarah@example.com</p>
                  </div>
                </div>
                <select className="select h-8 w-22">
                  <option value="write">Write</option>
                  <option value="read">Read</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="avatar">
                    <img className="avatar-image" src="https://cdn.gufo.dev/stockphotos/7bd8889a.webp" alt="Michael Chen" />
                    <span className="avatar-fallback">MC</span>
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      Michael Chen
                    </p>
                    <p className="text-muted-foreground">michael@example.com</p>
                  </div>
                </div>
                <select className="select h-8 w-22">
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="avatar">
                    <img className="avatar-image" src="https://cdn.gufo.dev/stockphotos/a8a338c1.webp" alt="Emma Wilson" />
                    <span className="avatar-fallback">EW</span>
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Emma Wilson</p>
                    <p className="text-muted-foreground">emma@example.com</p>
                  </div>
                </div>
                <select className="select h-8 w-22">
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <div className="card-content grid gap-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Payment Method
              </h3>
              <p className="text-sm/6 text-muted-foreground mt-2">
                Choose how you&#x27;d like to pay for your order.
              </p>
            </div>
            <div className="grid gap-3">
              <span className="label sr-only">Payment method</span>
              <div
                className="grid gap-5"
                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
                  <input
                    type="radio"
                    className="sr-only"
                    name="payment"
                    defaultChecked
                    defaultValue="card"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/></svg>
                  <span className="label">Card</span>
                </label>
                <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
                  <input
                    type="radio"
                    className="sr-only"
                    name="payment"
                    defaultValue="paypal"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"/></svg>
                  <span className="label">PayPal</span>
                </label>
                <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
                  <input
                    type="radio"
                    className="sr-only"
                    name="payment"
                    defaultValue="apple"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
                  <span className="label">Apple</span>
                </label>
              </div>
            </div>
            <form className="field-group">
              <div className="field">
                <label className="label" htmlFor="cardholder-name">
                  Cardholder Name
                </label>
                <input
                  className="input"
                  id="cardholder-name"
                  type="text"
                  placeholder="John Doe"
                  name="cardholder-name"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="card-number">
                  Card Number
                </label>
                <input
                  className="input"
                  id="card-number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  name="card-number"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="field">
                  <label className="label" htmlFor="month">
                    Month
                  </label>
                  <input
                    className="input"
                    id="month"
                    type="text"
                    placeholder="MM"
                    name="month"
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="year">
                    Year
                  </label>
                  <input
                    className="input"
                    id="year"
                    type="text"
                    placeholder="YY"
                    name="year"
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="cvv">
                    CVV
                  </label>
                  <input
                    className="input"
                    id="cvv"
                    type="text"
                    placeholder="123"
                    name="cvv"
                  />
                </div>
              </div>
              <button className="btn" type="submit">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
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
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <img
            src="https://cdn.gufo.dev/stockphotos/fdab3fb9.webp"
            alt="Blog post cover"
            className="aspect-3/2 object-cover w-full"
          />
          <div className="card-content grid gap-6">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight text-muted-foreground">
                <span>Mar 15, 2024</span>
                <span>·</span>
                <span>Design</span>
              </span>
              <h3 className="text-lg font-semibold tracking-tight mt-2">
                Design Systems with Tailwind
              </h3>
              <p className="text-sm/6 text-muted-foreground mt-2">
                Learn how utility classes can help you build and scale a
                beautiful design system across projects.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="avatar">
                    <img className="avatar-image" src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp" alt="Sarah Johnson" />
                    <span className="avatar-fallback">SJ</span>
                  </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-muted-foreground">Product Designer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                Google
              </button>
              <button className="btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
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
              <button className="btn" type="submit">
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
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <div className="card-content grid gap-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Submit Feedback
              </h3>
              <p className="text-sm/6 text-muted-foreground mt-2">
                Share your thoughts to help us improve.
              </p>
            </div>
            <form className="field-group">
              <div className="field">
                <label className="label" htmlFor="title">
                  Title
                </label>
                <input
                  className="input"
                  id="title"
                  type="text"
                  placeholder="Feedback title"
                  name="title"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="type">
                  Type
                </label>
                <select className="select" id="type" name="type">
                  <option value="">Select type</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="praise">Praise</option>
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="textarea"
                  id="description"
                  name="description"
                  placeholder="Tell us more..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn" type="button">
                  Cancel
                </button>
                <button className="btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <div className="card-content grid gap-6">
            <h3 className="text-lg/snug font-semibold tracking-tight">
              Premium Plan
            </h3>
            <div>
              <span className="text-4xl font-bold sm:text-5xl">$29</span>
              <span className="text-muted-foreground ml-1">/ month</span>
            </div>
            <p className="text-sm/6 text-muted-foreground">
              Everything you need to scale your project and collaborate with
              your entire team.
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
            <button className="btn btn-lg w-full mt-2">
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <div className="card-content grid gap-6">
            <img
              src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
              alt="Sarah Johnson"
              className="w-full aspect-square object-cover rounded-xl"
            />
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Sarah Johnson
              </h3>
              <p className="text-sm/6 text-muted-foreground mt-2">
                Product Designer who focuses on simplicity &amp; usability.
                Currently designing at Acme Inc.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
                <span>312</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-muted-foreground"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
                <span>48</span>
              </div>
              <button className="btn btn-sm ml-auto">
                Follow
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <div className="card-content grid gap-6">
            <div className="flex gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
            </div>
            <div>
              <p className="text-sm/6 text-muted-foreground">
                Starting Point UI has transformed how we build interfaces. The
                components are beautifully designed and easy to customize.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="avatar">
                    <img className="avatar-image" src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp" alt="Sarah Johnson" />
                    <span className="avatar-fallback">SJ</span>
                  </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-muted-foreground">Product Designer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
        <div className="card w-full max-w-sm">
          <img
            src="https://cdn.gufo.dev/stockphotos/f5ddf336.webp"
            alt="Album cover"
            className="aspect-square object-cover w-full"
          />
          <div className="card-content grid gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold tracking-tight">
                Midnight Dreams
              </h3>
              <p className="text-sm/6 text-muted-foreground mt-2">
                Luna Eclipse
              </p>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/></svg>
              </button>
              <button className="btn btn-ghost btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z"/><path d="M3 20V4"/></svg>
              </button>
              <button className="btn btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
              </button>
              <button className="btn btn-ghost btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4v16"/><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/></svg>
              </button>
              <button className="btn btn-ghost btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 break-inside-avoid">
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
              <button className="btn" type="submit">
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
            <div className="grid grid-cols-2 gap-5">
              <button className="btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                Google
              </button>
              <button className="btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
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
      </div>
    </div>
  );
}
