import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "fullpage", classList: "min-h-[800px]", description: "Inset layout, flat navigation" };

export default function Example() {
  return (
    <div className="sidebar sidebar-inset">
      <div className="sidebar-backdrop"></div>
      <aside className="sidebar-panel" id="sidebar-2">
        <div className="sidebar-content">
          <header className="sidebar-header">
            <a href="#" className="menu-btn menu-btn-lg">
              <div className="flex items-center justify-center size-6 rounded-sm bg-primary text-primary-foreground text-sm font-bold shrink-0">
                ui
              </div>
              Starting Point
            </a>
          </header>
          <nav className="sidebar-menu">
            <div className="menu-group">
              <span className="menu-label">Getting Started</span>
              <a href="#" className="menu-btn active">Installation</a>
              <a href="#" className="menu-btn">Project Structure</a>
            </div>
            <div className="menu-group">
              <span className="menu-label">Build Your Application</span>
              <a href="#" className="menu-btn">Routing</a>
              <a href="#" className="menu-btn">Data Fetching</a>
              <a href="#" className="menu-btn">Rendering</a>
              <a href="#" className="menu-btn">Caching</a>
              <a href="#" className="menu-btn">Styling</a>
              <a href="#" className="menu-btn">Optimizing</a>
              <a href="#" className="menu-btn">Configuring</a>
              <a href="#" className="menu-btn">Testing</a>
            </div>
          </nav>
          <footer className="sidebar-footer">
            <div className="dropdown" data-sp-placement="right-end">
              <button className="menu-btn menu-btn-lg" data-sp-toggle="dropdown" aria-expanded="false">
                <img
                  src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
                  alt="Sarah Johnson"
                  className="size-8 rounded-lg"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sarah Johnson</span>
                  <span className="truncate text-xs text-muted-foreground">sarah@example.com</span>
                </div>
                <i className="ri-more-2-fill ml-auto"></i>
              </button>
              <div className="dropdown-menu min-w-56">
                <div className="dropdown-label flex items-center gap-2 px-1 py-1.5">
                  <img
                    src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
                    alt="Sarah Johnson"
                    className="size-8 rounded-lg"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Sarah Johnson</span>
                    <span className="truncate text-xs text-muted-foreground">sarah@example.com</span>
                  </div>
                </div>
                <div className="dropdown-separator"></div>
                <a href="#" className="dropdown-item">
                  <i className="ri-user-line"></i>
                  Account
                </a>
                <a href="#" className="dropdown-item">
                  <i className="ri-bank-card-line"></i>
                  Billing
                </a>
                <a href="#" className="dropdown-item">
                  <i className="ri-notification-3-line"></i>
                  Notifications
                </a>
                <div className="dropdown-separator"></div>
                <a href="#" className="dropdown-item">
                  <i className="ri-logout-box-line"></i>
                  Log out
                </a>
              </div>
            </div>
          </footer>
        </div>
      </aside>
      <main className="sidebar-page flex flex-col">
        <header className="flex items-center gap-2 border-b px-4 h-14">
          <button
            className="btn btn-ghost btn-icon-sm -ml-2"
            data-sp-toggle="sidebar"
            data-sp-target="#sidebar-2"
          >
            <i className="ri-side-bar-line"></i>
          </button>
          <div className="separator separator-vertical self-center h-4 -ml-1 mr-2"></div>
          <nav className="breadcrumb text-sm">
            <a href="#" className="breadcrumb-link">Build Your Application</a>
            <span className="breadcrumb-separator" aria-hidden="true">
              <i className="ri-arrow-right-s-line"></i>
            </span>
            <span className="breadcrumb-page">Data Fetching</span>
          </nav>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl"></div>
            <div className="bg-muted/50 aspect-video rounded-xl"></div>
            <div className="bg-muted/50 aspect-video rounded-xl"></div>
          </div>
          <div className="bg-muted/50 min-h-40 flex-1 rounded-xl"></div>
        </div>
      </main>
    </div>
  );
}
