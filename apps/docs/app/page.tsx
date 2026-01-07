import Link from "next/link";

export const metadata = {
  title: "Starting Point UI",
  description:
    "A component library built for Tailwind CSS. Copy, paste, and customize. Beautiful, accessible, open source, and works in any project.",
};

export default function Home() {
  return (
    <>
      <section className="relative lg:h-[calc(100vh-4rem)] flex items-start lg:items-center overflow-x-hidden lg:overflow-hidden bg-muted/25 flex-col lg:flex-row">
        <div className="container-wide pb-12 pt-6">
          <div className="max-w-lg">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Built with Tailwind CSS v4
            </div>
            <h1 className="text-4xl sm:text-5xl/tight font-extrabold tracking-tight gradient-text">
              Beautiful Components For Tailwind CSS
            </h1>
            <p className="text-base sm:text-lg/8 text-muted-foreground mt-6">
              A component library built for Tailwind CSS. Copy, paste, and
              customize. Beautiful, accessible, open source, and works in any
              project.
            </p>
            <div className="flex items-center gap-4 sm:flex-row mt-8">
              <Link href="/docs/guides/installation" className="btn btn-lg">
                Get Started
              </Link>
              <a
                href="https://github.com/gufodotdev/starting-point-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                View Source
              </a>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto overflow-x-auto lg:overflow-visible lg:absolute lg:top-0 lg:left-1/2 lg:pl-6">
          <div className="px-6 pb-12 lg:pb-12 lg:px-0 columns-3 gap-6 w-max *:w-sm *:mb-6 *:break-inside-avoid">
            {/* 1 */}
            <div>
              <div className="card">
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <h3 className="text-lg/6 font-semibold">Sign Up</h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Create an account to get started on the platform and
                      unlock all features and benefits.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="btn btn-outline" type="button">
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        ></path>
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        ></path>
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        ></path>
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        ></path>
                      </svg>
                      Google
                    </button>
                    <button className="btn btn-outline" type="button">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      GitHub
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label className="label" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        className="input"
                        type="email"
                        placeholder="m@example.com"
                      />
                    </div>
                    <div className="grid gap-3">
                      <label className="label" htmlFor="password">
                        Password
                      </label>
                      <input id="password" className="input" type="password" />
                    </div>
                    <button className="btn" type="submit">
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* 2 */}
            <div>
              <div className="card">
                <img
                  src="https://images.pexels.com/photos/7034439/pexels-photo-7034439.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Blog post cover"
                  className="aspect-video object-cover rounded-t-xl"
                />
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <span className="flex items-center gap-1.5 text-xs/5 font-medium text-muted-foreground">
                      <a href="#">Mar 15, 2024</a>
                      <span>·</span>
                      <a href="#">Articles</a>
                    </span>
                    <h3 className="text-lg/6 font-semibold">
                      Building Modern Web Applications with Laravel and React
                    </h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Learn how to build scalable and maintainable web
                      applications using React and modern development practices.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      className="avatar"
                      src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                      alt="Sarah Johnson"
                    />
                    <div className="grid gap-1.5">
                      <span className="text-sm/none font-medium">
                        Sarah Johnson
                      </span>
                      <span className="text-xs/none text-muted-foreground font-medium">
                        Technical Writer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 3 */}
            <div>
              <div className="card">
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <h3 className="text-lg/6 font-semibold">Notifications</h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Choose how you want to be notified.
                    </p>
                  </div>
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="grid gap-1.5">
                        <span className="text-sm font-medium">
                          Email notifications
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Receive updates and alerts via email.
                        </span>
                      </div>
                      <input
                        className="switch"
                        type="checkbox"
                        role="switch"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="grid gap-1.5">
                        <span className="text-sm font-medium">
                          Push notifications
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Get instant alerts on your mobile device.
                        </span>
                      </div>
                      <input className="switch" type="checkbox" role="switch" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="grid gap-1.5">
                        <span className="text-sm font-medium">
                          Marketing emails
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Stay informed about new features and offers.
                        </span>
                      </div>
                      <input className="switch" type="checkbox" role="switch" />
                    </div>
                  </div>
                  <button className="btn">Save preferences</button>
                </div>
              </div>
            </div>
            {/* 4 */}
            <div>
              <div className="card">
                <img
                  src="https://images.pexels.com/photos/11112728/pexels-photo-11112728.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Product"
                  className="aspect-square object-cover rounded-t-xl"
                />
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <span className="flex items-center gap-1.5 text-xs/5 font-medium text-muted-foreground">
                      <a href="#">Furniture</a>
                    </span>
                    <h3 className="text-lg/6 font-semibold">
                      Classic Wooden Chair
                    </h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Handcrafted solid oak chair with ergonomic design and
                      natural finish.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star size-4 text-primary fill-primary"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star size-4 text-primary fill-primary"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star size-4 text-primary fill-primary"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star size-4 text-primary fill-primary"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star size-4 text-muted fill-muted"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
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
            {/* 5 */}
            <div>
              <div className="card">
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <h3 className="text-lg/6 font-semibold">Share Document</h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Invite others to view or edit this document and work
                      together seamlessly.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      type="text"
                      readOnly
                      value="https://example.com/doc/abc123"
                    />
                    <button className="btn btn-outline btn-icon">
                      <svg
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="separator"></div>
                  <div className="grid gap-6">
                    <span className="text-sm font-medium">
                      People with access
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="avatar"
                          src="https://images.pexels.com/photos/2773682/pexels-photo-2773682.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                          alt="Sarah Johnson"
                        />
                        <div className="grid gap-1.5">
                          <span className="text-sm/none font-medium">
                            Sarah Johnson
                          </span>
                          <span className="text-xs/none text-muted-foreground font-medium">
                            sarah@example.com
                          </span>
                        </div>
                      </div>
                      <select className="select select-sm w-22">
                        <option value="write">Write</option>
                        <option value="read">Read</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="avatar"
                          src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                          alt="Michael Chen"
                        />
                        <div className="grid gap-1.5">
                          <span className="text-sm/none font-medium">
                            Michael Chen
                          </span>
                          <span className="text-xs/none text-muted-foreground font-medium">
                            michael@example.com
                          </span>
                        </div>
                      </div>
                      <select className="select select-sm w-22">
                        <option value="read">Read</option>
                        <option value="write">Write</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="avatar"
                          src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                          alt="Emma Wilson"
                        />
                        <div className="grid gap-1.5">
                          <span className="text-sm/none font-medium">
                            Emma Wilson
                          </span>
                          <span className="text-xs/none text-muted-foreground font-medium">
                            emma@example.com
                          </span>
                        </div>
                      </div>
                      <select className="select select-sm w-22">
                        <option value="read">Read</option>
                        <option value="write">Write</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 6 */}
            <div>
              <div className="card">
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <h3 className="text-lg/6 font-semibold">Submit Feedback</h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Share your thoughts to help us improve.
                    </p>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label className="label" htmlFor="title">
                        Title
                      </label>
                      <input
                        id="title"
                        className="input"
                        type="text"
                        placeholder="Feedback title"
                      />
                    </div>
                    <div className="grid gap-3">
                      <label className="label" htmlFor="type">
                        Type
                      </label>
                      <select id="type" className="select">
                        <option value="">Select type</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="complaint">Complaint</option>
                        <option value="praise">Praise</option>
                      </select>
                    </div>
                    <div className="grid gap-3">
                      <label className="label" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        className="textarea"
                        placeholder="Tell us more..."
                        rows={4}
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline" type="button">
                        Cancel
                      </button>
                      <button className="btn" type="submit">
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 7 */}
            <div>
              <div className="card">
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <h3 className="text-lg/6 font-semibold">Premium Plan</h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Everything you need to scale
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="grid gap-4 text-sm">
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check size-4 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      Up to 10 team members
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check size-4 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      50GB cloud storage
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check size-4 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      Priority email support
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check size-4 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      Advanced analytics dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check size-4 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                      API access
                    </li>
                  </ul>
                  <button className="btn">Buy Now</button>
                </div>
              </div>
            </div>
            {/* 8 */}
            <div>
              <div className="card">
                <img
                  src="https://images.pexels.com/photos/5331154/pexels-photo-5331154.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Album cover"
                  className="aspect-square object-cover rounded-t-xl"
                />
                <div className="card-content grid gap-6">
                  <div className="grid gap-2 text-center">
                    <h3 className="text-lg/6 font-semibold">Midnight Dreams</h3>
                    <p className="text-sm/6 text-muted-foreground">
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shuffle size-4"
                        aria-hidden="true"
                      >
                        <path d="m18 14 4 4-4 4"></path>
                        <path d="m18 2 4 4-4 4"></path>
                        <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"></path>
                        <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"></path>
                        <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"></path>
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-skip-back size-4"
                        aria-hidden="true"
                      >
                        <path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z"></path>
                        <path d="M3 20V4"></path>
                      </svg>
                    </button>
                    <button className="btn btn-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pause size-5"
                        aria-hidden="true"
                      >
                        <rect x="14" y="3" width="5" height="18" rx="1"></rect>
                        <rect x="5" y="3" width="5" height="18" rx="1"></rect>
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-skip-forward size-4"
                        aria-hidden="true"
                      >
                        <path d="M21 4v16"></path>
                        <path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"></path>
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-repeat size-4"
                        aria-hidden="true"
                      >
                        <path d="m17 2 4 4-4 4"></path>
                        <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
                        <path d="m7 22-4-4 4-4"></path>
                        <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* 9 */}
            <div>
              <div className="card">
                <div className="card-content grid gap-6">
                  <div className="grid gap-2">
                    <h3 className="text-lg/6 font-semibold">Payment Method</h3>
                    <p className="text-sm/6 text-muted-foreground">
                      Choose how you&apos;d like to pay for your order.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/5">
                      <input
                        type="radio"
                        className="sr-only"
                        name="payment"
                        defaultChecked
                        value="card"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                        ></path>
                      </svg>
                      <span className="text-sm font-medium">Card</span>
                    </label>
                    <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/5">
                      <input
                        type="radio"
                        className="sr-only"
                        name="payment"
                        value="paypal"
                      />
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.724c2.332 0 4.063.642 5.143 1.908.503.59.84 1.263 1.003 2.005.17.776.144 1.7-.08 2.744l-.004.015v.042c-.336 1.732-1.017 3.124-2.025 4.14-.958.965-2.232 1.591-3.788 1.86-.616.106-1.284.16-1.987.16H8.33a.77.77 0 0 0-.758.63l-.737 4.665a.641.641 0 0 1-.633.54h-.025l-.001.137z"></path>
                      </svg>
                      <span className="text-sm font-medium">PayPal</span>
                    </label>
                    <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/5">
                      <input
                        type="radio"
                        className="sr-only"
                        name="payment"
                        value="apple"
                      />
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"></path>
                      </svg>
                      <span className="text-sm font-medium">Apple</span>
                    </label>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label className="label" htmlFor="cardholder-name">
                        Cardholder Name
                      </label>
                      <input
                        id="cardholder-name"
                        className="input"
                        type="text"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid gap-3">
                      <label className="label" htmlFor="card-number">
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        className="input"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-3">
                        <label className="label" htmlFor="month">
                          Month
                        </label>
                        <input
                          id="month"
                          className="input"
                          type="text"
                          placeholder="MM"
                        />
                      </div>
                      <div className="grid gap-3">
                        <label className="label" htmlFor="year">
                          Year
                        </label>
                        <input
                          id="year"
                          className="input"
                          type="text"
                          placeholder="YY"
                        />
                      </div>
                      <div className="grid gap-3">
                        <label className="label" htmlFor="cvv">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          className="input"
                          type="text"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <button className="btn" type="submit">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container h-16 flex items-center text-sm text-muted-foreground">
          Built by Gufo. Source on{" "}
          <a
            href="https://github.com/gufodotdev/starting-point-ui"
            className="underline underline-offset-4 hover:text-foreground ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </div>
      </section>
    </>
  );
}
