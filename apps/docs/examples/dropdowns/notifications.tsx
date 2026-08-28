const notifications = [
  {
    name: "Maya Okonkwo",
    action: "liked your photo",
    target: "Golden hour in Lisbon",
    time: "2 minutes ago",
    src: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "MO",
    accent: "text-rose-600",
    unread: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
  },
  {
    name: "Devin Ross",
    action: "replied to your comment on",
    target: "Weekly design critique",
    time: "18 minutes ago",
    src: "https://images.unsplash.com/photo-1513673054901-2b5f51551112?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "DR",
    accent: "text-blue-600",
    unread: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
    ),
  },
  {
    name: "Priya Raman",
    action: "wants to follow you",
    time: "1 hour ago",
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "PR",
    accent: "text-green-600",
    unread: true,
    request: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
    ),
  },
  {
    name: "Theo Lindqvist",
    action: "mentioned you in",
    target: "#launch-planning",
    time: "Yesterday at 4:12 PM",
    src: "https://images.unsplash.com/photo-1750390200293-92d5a788d3a2?w=640&h=640&fit=facearea&facepad=3&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "TL",
    accent: "text-violet-600",
    unread: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
    ),
  },
  {
    name: "Grace Adeyemi",
    action: "reposted your photo",
    target: "Golden hour in Lisbon",
    time: "Tuesday",
    src: "https://images.unsplash.com/photo-1573496527892-904f897eb744?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "GA",
    accent: "text-amber-600",
    unread: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
    ),
  },
  {
    name: "Luca Moretti",
    action: "liked your comment on",
    target: "Weekly design critique",
    time: "Monday",
    src: "https://images.unsplash.com/photo-1705645930353-0e335311ef20?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "LM",
    accent: "text-rose-600",
    unread: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
  },
  {
    name: "Camille Laurent",
    action: "started following you",
    time: "Last week",
    src: "https://images.unsplash.com/photo-1752486268240-0507bb1ebc7e?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "CL",
    accent: "text-green-600",
    unread: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
    ),
  },
  {
    name: "Emilie Dahl",
    action: "commented on your photo",
    target: "Golden hour in Lisbon",
    time: "Last week",
    src: "https://images.unsplash.com/photo-1634149134664-ca3598f29da5?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5",
    initials: "ED",
    accent: "text-blue-600",
    unread: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
    ),
  },
];

export default function Notifications() {
  return (
    <>
      <button type="button" id="notifications-trigger" className="btn btn-outline btn-icon" aria-label="Open notifications">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
        <span className="btn-badge bg-destructive">3</span>
      </button>

      <div className="popover w-84 gap-0 overflow-clip p-0" data-sp-toggle="#notifications-trigger" data-sp-placement="bottom-end">
        <div className="item item-xs ps-3.5 pe-2">
          <div className="item-content">
            <div className="item-title">Notifications</div>
          </div>
          <div className="item-actions">
            <button type="button" id="notifications-menu" className="btn btn-ghost btn-sm btn-icon" aria-label="Notification options">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>

        <div className="dropdown w-52" data-sp-toggle="#notifications-menu" data-sp-placement="bottom-end">
          <button className="dropdown-item" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
            Mark all read
          </button>
          <a className="dropdown-item" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            View all notifications
          </a>
        </div>

        <div className="separator"></div>

        <div className="scroll-fade scrollbar-none max-h-80 overflow-y-auto p-1" role="list">
          {notifications.map((notification) => {
            const Row = notification.request ? "div" : "a";
            return (
              <Row
                key={notification.name + notification.time}
                {...(notification.request ? {} : { href: "#" })}
                className="item item-xs items-start"
                role="listitem"
              >
                <div className="item-media">
                  <span className="avatar avatar-lg">
                    <img className="avatar-image" src={notification.src} alt="" />
                    <span className="avatar-fallback">{notification.initials}</span>
                    <span className={`avatar-badge bg-background shadow-sm ${notification.accent}`}>{notification.icon}</span>
                  </span>
                </div>
                <div className="item-content">
                  <div className="item-title">
                    <span>
                      {notification.name}{" "}
                      <span className="font-normal text-muted-foreground">{notification.action}</span>
                      {notification.target && <> {notification.target}</>}
                    </span>
                  </div>
                  <div className="item-description">{notification.time}</div>
                  {notification.request && (
                    <div className="mt-1.5 flex gap-2">
                      <button className="btn btn-xs" type="button">Accept</button>
                      <button className="btn btn-outline btn-xs" type="button">Decline</button>
                    </div>
                  )}
                </div>
                {notification.unread && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" aria-label="Unread"></span>
                )}
              </Row>
            );
          })}
        </div>
      </div>
    </>
  );
}
