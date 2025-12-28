import Link from "next/link";
import { ArrowDown, MoreHorizontal, X } from "lucide-react";

export const metadata = {
  title: "Starting Point UI",
  description:
    "A component library built for Tailwind CSS. Copy, paste, and customize. Beautiful, accessible, open source, and works in any project.",
};

export default function Home() {
  return (
    <>
      <section className="relative min-h-[calc(100vh-4rem)] py-16">
        <div className="container">
          <div className="text-center">
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

            <p className="mx-auto max-w-3xl text-base sm:text-lg/8 text-muted-foreground mt-6">
              A component library built for Tailwind CSS. Copy, paste, and
              customize. Beautiful, accessible, open source, and works in any
              project.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mt-8">
              <Link
                href="/docs/guides/installation"
                className="btn btn-lg rounded-full px-8"
              >
                Get Started
              </Link>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-center gap-3 text-[11px] text-muted-foreground uppercase tracking-wider">
            <span className="font-medium">Library Includes</span>
            <ArrowDown className="size-4 animate-bounce" />
            <Link
              href="/docs/components/button"
              className="hover:text-foreground transition-colors underline underline-offset-4"
            >
              and more
            </Link>
          </div>

          <div className="mt-4">
            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="card card-outline">
                  <div className="card-content sm:card-content-lg flex items-center justify-center gap-4">
                    <button className="btn">Button</button>
                    <button className="btn btn-outline">Button</button>
                  </div>
                </div>

                <div className="card card-outline">
                  <div className="card-content sm:card-content-lg flex items-center justify-center">
                    <button
                      className="btn btn-outline"
                      data-sp-toggle="dialog"
                      data-sp-target="#showcase-dialog"
                    >
                      Open Dialog
                    </button>
                    <dialog id="showcase-dialog" className="dialog">
                      <div className="dialog-backdrop"></div>
                      <div className="dialog-panel">
                        <button
                          className="btn btn-ghost btn-icon absolute top-2 right-2"
                          aria-label="Close"
                          data-sp-dismiss="dialog"
                        >
                          <X />
                        </button>
                        <h2 className="text-lg font-semibold mb-2">
                          Dialog Title
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          This is a modal dialog. Click the backdrop or press
                          Escape to close.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-outline"
                            data-sp-dismiss="dialog"
                          >
                            Cancel
                          </button>
                          <button className="btn" data-sp-dismiss="dialog">
                            Confirm
                          </button>
                        </div>
                      </div>
                    </dialog>
                  </div>
                </div>

                <div className="card card-outline">
                  <div className="card-content sm:card-content-lg flex items-center justify-center">
                    <button
                      className="btn btn-outline"
                      data-sp-toggle="dialog"
                      data-sp-target="#showcase-sheet"
                    >
                      Open Sheet
                    </button>
                    <dialog id="showcase-sheet" className="dialog">
                      <div className="sheet-backdrop"></div>
                      <div className="sheet-panel">
                        <button
                          className="btn btn-ghost btn-icon absolute top-4 right-4"
                          aria-label="Close"
                          data-sp-dismiss="dialog"
                        >
                          <X />
                        </button>
                        <h2 className="text-lg font-semibold">Sheet</h2>
                        <p className="text-muted-foreground text-sm">
                          A sheet slides in from any edge of the screen.
                        </p>
                      </div>
                    </dialog>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="card card-outline lg:col-span-4">
                  <form className="card-content sm:card-content-lg grid gap-8">
                    <div className="grid gap-3">
                      <h3 className="font-semibold leading-none">
                        Welcome Back
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Enter your credentials to continue.
                      </p>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <label className="label" htmlFor="email">
                          Email
                        </label>
                        <input
                          className="input"
                          type="email"
                          id="email"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <label className="label" htmlFor="password">
                            Password
                          </label>
                          <a
                            href="#"
                            className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <input
                          className="input"
                          type="password"
                          id="password"
                          placeholder="Enter password"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <button type="button" className="btn">
                        Sign In
                      </button>
                      <a href="#" className="btn btn-ghost">
                        Sign up for new account
                      </a>
                    </div>
                  </form>
                </div>

                <div className="card card-outline lg:col-span-8">
                  <div className="card-content sm:card-content-lg grid gap-6">
                    <div className="grid gap-3">
                      <h3 className="font-semibold leading-none">
                        Recent Orders
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        View and manage your recent customer orders.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead className="table-header">
                          <tr className="table-row">
                            <th className="table-head">Customer</th>
                            <th className="table-head">Date</th>
                            <th className="table-head">Amount</th>
                            <th className="table-head w-0">Status</th>
                            <th className="table-head w-0"></th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          <tr className="table-row">
                            <td className="table-cell">
                              <div className="flex items-center gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
                                  alt="Sarah Chen"
                                  className="avatar avatar-sm"
                                />
                                <span className="font-medium">Sarah Chen</span>
                              </div>
                            </td>
                            <td className="table-cell text-muted-foreground">
                              Dec 24, 2024
                            </td>
                            <td className="table-cell font-medium">$249.00</td>
                            <td className="table-cell">
                              <span className="badge bg-green-500/10 text-green-500 border-transparent">
                                Paid
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <div
                                className="dropdown -mr-2"
                                data-sp-placement="bottom-end"
                              >
                                <button
                                  className="btn btn-ghost btn-icon-sm"
                                  type="button"
                                  data-sp-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                                <div className="dropdown-menu">
                                  <a href="#" className="dropdown-item">
                                    View order
                                  </a>
                                  <a href="#" className="dropdown-item">
                                    Customer details
                                  </a>
                                  <div className="dropdown-separator"></div>
                                  <a href="#" className="dropdown-item">
                                    Refund
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr className="table-row">
                            <td className="table-cell">
                              <div className="flex items-center gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                                  alt="Marcus Johnson"
                                  className="avatar avatar-sm"
                                />
                                <span className="font-medium">
                                  Marcus Johnson
                                </span>
                              </div>
                            </td>
                            <td className="table-cell text-muted-foreground">
                              Dec 23, 2024
                            </td>
                            <td className="table-cell font-medium">$89.00</td>
                            <td className="table-cell">
                              <span className="badge bg-green-500/10 text-green-500 border-transparent">
                                Paid
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <div
                                className="dropdown -mr-2"
                                data-sp-placement="bottom-end"
                              >
                                <button
                                  className="btn btn-ghost btn-icon-sm"
                                  type="button"
                                  data-sp-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                                <div className="dropdown-menu">
                                  <a href="#" className="dropdown-item">
                                    View order
                                  </a>
                                  <a href="#" className="dropdown-item">
                                    Customer details
                                  </a>
                                  <div className="dropdown-separator"></div>
                                  <a href="#" className="dropdown-item">
                                    Refund
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr className="table-row">
                            <td className="table-cell">
                              <div className="flex items-center gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
                                  alt="Emily Davis"
                                  className="avatar avatar-sm"
                                />
                                <span className="font-medium">Emily Davis</span>
                              </div>
                            </td>
                            <td className="table-cell text-muted-foreground">
                              Dec 22, 2024
                            </td>
                            <td className="table-cell font-medium">$149.00</td>
                            <td className="table-cell">
                              <span className="badge bg-yellow-500/10 text-yellow-500 border-transparent">
                                Pending
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <div
                                className="dropdown -mr-2"
                                data-sp-placement="bottom-end"
                              >
                                <button
                                  className="btn btn-ghost btn-icon-sm"
                                  type="button"
                                  data-sp-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                                <div className="dropdown-menu">
                                  <a href="#" className="dropdown-item">
                                    View order
                                  </a>
                                  <a href="#" className="dropdown-item">
                                    Customer details
                                  </a>
                                  <div className="dropdown-separator"></div>
                                  <a href="#" className="dropdown-item">
                                    Refund
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr className="table-row">
                            <td className="table-cell">
                              <div className="flex items-center gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
                                  alt="Alex Turner"
                                  className="avatar avatar-sm"
                                />
                                <span className="font-medium">Alex Turner</span>
                              </div>
                            </td>
                            <td className="table-cell text-muted-foreground">
                              Dec 21, 2024
                            </td>
                            <td className="table-cell font-medium">$349.00</td>
                            <td className="table-cell">
                              <span className="badge bg-red-500/10 text-red-500 border-transparent">
                                Refunded
                              </span>
                            </td>
                            <td className="table-cell text-right">
                              <div
                                className="dropdown -mr-2"
                                data-sp-placement="bottom-end"
                              >
                                <button
                                  className="btn btn-ghost btn-icon-sm"
                                  type="button"
                                  data-sp-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                                <div className="dropdown-menu">
                                  <a href="#" className="dropdown-item">
                                    View order
                                  </a>
                                  <a href="#" className="dropdown-item">
                                    Customer details
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
