import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "fullpage",
  classList: "min-h-[800px]",
  description: "Default layout, collapsible navigation",
};

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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
                Playground
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto transition-transform in-aria-expanded:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <div id="playground-1" className="collapsible-panel open">
                <div className="menu-subgroup">
                  <a href="#" className="menu-btn menu-btn-sm">
                    History
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Starred
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Settings
                  </a>
                </div>
              </div>
              <button
                className="menu-btn"
                data-sp-toggle="collapsible"
                data-sp-target="#models-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                Models
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto transition-transform in-aria-expanded:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <div id="models-1" className="collapsible-panel">
                <div className="menu-subgroup">
                  <a href="#" className="menu-btn menu-btn-sm">
                    Genesis
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Explorer
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Quantum
                  </a>
                </div>
              </div>
              <button
                className="menu-btn"
                data-sp-toggle="collapsible"
                data-sp-target="#docs-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                Documentation
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto transition-transform in-aria-expanded:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <div id="docs-1" className="collapsible-panel">
                <div className="menu-subgroup">
                  <a href="#" className="menu-btn menu-btn-sm">
                    Introduction
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Get Started
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Tutorials
                  </a>
                </div>
              </div>
              <button
                className="menu-btn"
                data-sp-toggle="collapsible"
                data-sp-target="#settings-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
                Settings
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto transition-transform in-aria-expanded:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <div id="settings-1" className="collapsible-panel">
                <div className="menu-subgroup">
                  <a href="#" className="menu-btn menu-btn-sm">
                    General
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Team
                  </a>
                  <a href="#" className="menu-btn menu-btn-sm">
                    Billing
                  </a>
                </div>
              </div>
            </div>
            <div className="menu-group">
              <span className="menu-label">Projects</span>
              <a href="#" className="menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                Design Engineering
              </a>
              <a href="#" className="menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/></svg>
                Sales &amp; Marketing
              </a>
              <a href="#" className="menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>
                Travel
              </a>
            </div>
            <div className="menu-group mt-auto">
              <a href="#" className="menu-btn menu-btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>
                Support
              </a>
              <a href="#" className="menu-btn menu-btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>
                Feedback
              </a>
            </div>
          </nav>
          <footer className="sidebar-footer">
            <div className="dropdown" data-sp-placement="right-end">
              <button
                className="menu-btn menu-btn-lg"
                data-sp-toggle="dropdown"
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
              <div className="dropdown-menu min-w-56">
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
