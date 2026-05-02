import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "fullpage",
  classList: "min-h-[800px]",
  description: "Inset layout, flat navigation",
};

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
              <a href="#" className="menu-btn active">
                Installation
              </a>
              <a href="#" className="menu-btn">
                Project Structure
              </a>
            </div>
            <div className="menu-group">
              <span className="menu-label">Build Your Application</span>
              <a href="#" className="menu-btn">
                Routing
              </a>
              <a href="#" className="menu-btn">
                Data Fetching
              </a>
              <a href="#" className="menu-btn">
                Rendering
              </a>
              <a href="#" className="menu-btn">
                Caching
              </a>
              <a href="#" className="menu-btn">
                Styling
              </a>
              <a href="#" className="menu-btn">
                Optimizing
              </a>
              <a href="#" className="menu-btn">
                Configuring
              </a>
              <a href="#" className="menu-btn">
                Testing
              </a>
            </div>
          </nav>
          <footer className="sidebar-footer">
            <button
              className="menu-btn menu-btn-lg"
              data-sp-toggle="dropdown"
              data-sp-target="#user-menu-2"
              data-sp-placement="right-end"
              aria-expanded="false"
            >
              <img
                src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
                alt="Sarah Johnson"
                className="size-8 rounded-lg"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Sarah Johnson</span>
                <span className="truncate text-xs text-muted-foreground">
                  sarah@example.com
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </footer>
          <div id="user-menu-2" className="dropdown min-w-56">
            <div className="dropdown-label flex items-center gap-2 px-1 py-1.5">
              <img
                src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp"
                alt="Sarah Johnson"
                className="size-8 rounded-lg"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Sarah Johnson</span>
                <span className="truncate text-xs text-muted-foreground">
                  sarah@example.com
                </span>
              </div>
            </div>
            <div className="dropdown-separator"></div>
            <a href="#" className="dropdown-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
            </a>
            <a href="#" className="dropdown-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Billing
            </a>
            <a href="#" className="dropdown-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
              Notifications
            </a>
            <div className="dropdown-separator"></div>
            <a href="#" className="dropdown-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
              Log out
            </a>
          </div>
        </div>
      </aside>
      <main className="sidebar-page flex flex-col">
        <header className="flex items-center gap-2 border-b px-4 h-14">
          <button
            className="btn btn-ghost btn-icon-sm -ml-2"
            data-sp-toggle="sidebar"
            data-sp-target="#sidebar-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>
          <div className="separator separator-vertical self-center h-4 -ml-1 mr-2"></div>
          <nav className="breadcrumb text-sm">
            <a href="#" className="breadcrumb-link">
              Build Your Application
            </a>
            <span className="breadcrumb-separator" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
