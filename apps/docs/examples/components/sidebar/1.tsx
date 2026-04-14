import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "fullpage", classList: "min-h-[800px]" };

export default function Example() {
  return (
    <div className="sidebar">
      <div className="sidebar-backdrop"></div>
      <aside className="sidebar-panel" id="sidebar-1">
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
              <span className="menu-label">Platform</span>
              <button
                className="menu-btn"
                data-sp-toggle="collapsible"
                data-sp-target="#playground-1"
                aria-expanded="true"
              >
                <i className="ri-terminal-box-line"></i>
                Playground
                <i className="ri-arrow-right-s-line ml-auto transition-transform in-aria-expanded:rotate-90"></i>
              </button>
              <div id="playground-1" className="collapsible-panel open">
                <div className="menu-subgroup">
                  <a href="#" className="menu-btn menu-btn-sm">History</a>
                  <a href="#" className="menu-btn menu-btn-sm">Starred</a>
                  <a href="#" className="menu-btn menu-btn-sm">Settings</a>
                </div>
              </div>
              <a href="#" className="menu-btn">
                <i className="ri-robot-line"></i>
                Models
                <i className="ri-arrow-right-s-line ml-auto"></i>
              </a>
              <a href="#" className="menu-btn">
                <i className="ri-book-open-line"></i>
                Documentation
                <i className="ri-arrow-right-s-line ml-auto"></i>
              </a>
              <a href="#" className="menu-btn">
                <i className="ri-settings-3-line"></i>
                Settings
                <i className="ri-arrow-right-s-line ml-auto"></i>
              </a>
            </div>
            <div className="menu-group">
              <span className="menu-label">Projects</span>
              <a href="#" className="menu-btn">
                <i className="ri-layout-grid-line"></i>
                Design Engineering
              </a>
              <a href="#" className="menu-btn">
                <i className="ri-pie-chart-line"></i>
                Sales &amp; Marketing
              </a>
              <a href="#" className="menu-btn">
                <i className="ri-map-line"></i>
                Travel
              </a>
            </div>
            <div className="menu-group mt-auto">
              <a href="#" className="menu-btn menu-btn-sm">
                <i className="ri-lifebuoy-line"></i>
                Support
              </a>
              <a href="#" className="menu-btn menu-btn-sm">
                <i className="ri-feedback-line"></i>
                Feedback
              </a>
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
            data-sp-target="#sidebar-1"
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
