type MegaMenuItem = {
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
};

const resources: MegaMenuItem[] = [
  {
    title: "Blog",
    badge: "New",
    description: "The latest industry news and guides curated by our expert team.",
    icon: (
      <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
    ),
  },
  {
    title: "Customer stories",
    description: "Learn how teams use Acme to move faster with fewer tools.",
    icon: (
      <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
    ),
  },
  {
    title: "Video tutorials",
    description: "Get up and running on our newest features and in-depth guides.",
    icon: (
      <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"/><circle cx="12" cy="12" r="10"/></svg>
    ),
  },
  {
    title: "Documentation",
    description: "In-depth articles on our tools and technologies to empower teams.",
    icon: (
      <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/></svg>
    ),
  },
];

function MenuLink({ item }: { item: MegaMenuItem }) {
  return (
    <a className="item" href="#">
      <div className="item-media item-media-icon">{item.icon}</div>
      <div className="item-content">
        <div className="item-title">
          {item.title}
          {item.badge && <span className="badge badge-secondary">{item.badge}</span>}
        </div>
        <div className="item-description">{item.description}</div>
      </div>
    </a>
  );
}

export default function MegaMenu() {
  return (
    <>
      <button type="button" id="mega-menu-trigger" className="group btn btn-ghost">
        Resources
        <svg className="size-3 text-muted-foreground transition-transform group-aria-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div className="popover w-2xl max-w-[calc(100vw-2rem)] gap-0 overflow-clip p-0 md:flex-row" data-sp-toggle="#mega-menu-trigger" data-sp-mode="hover" data-sp-placement="bottom">
        <div className="flex-1 p-1">
          {resources.map((item) => (
            <MenuLink key={item.title} item={item} />
          ))}
        </div>
        <div className="w-full shrink-0 bg-muted/50 p-2 md:w-72">
          <div className="flex flex-col gap-3 p-2">
            <img
              src="https://images.unsplash.com/photo-1592765213254-f101ad9b8f76?rect=0,0,3000,2000&w=640&h=427&fit=crop&auto=format&q=100"
              alt="White blossoms in muted warm tones"
              className="h-40 w-full rounded-md object-cover"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">We've just released an update!</span>
              <span className="text-sm text-muted-foreground">Check out the all new dashboard view. Pages now load up to 3x faster.</span>
            </div>
            <a className="btn btn-link btn-sm self-start px-0" href="#">
              Explore the feature
              <svg className="icon-end" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
