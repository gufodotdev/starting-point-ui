const AVATAR = (id: string) =>
  `https://images.unsplash.com/${id}?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5`;

const users = [
  { name: "Leila Navarro", email: "leila@acme.com", initials: "LN", src: AVATAR("photo-1750390200282-bf7f669a9946"), role: "Owner", status: "Active", lastActive: "Just now" },
  { name: "Maya Santoso", email: "maya@acme.com", initials: "MS", src: AVATAR("photo-1573497019236-17f8177b81e8"), role: "Admin", status: "Active", lastActive: "12 minutes ago" },
  { name: "Sofia Lindqvist", email: "sofia@acme.com", initials: "SL", src: AVATAR("photo-1573497019940-1c28c88b4f3e"), role: "Member", status: "Active", lastActive: "2 hours ago" },
  { name: "Anouk Visser", email: "anouk@acme.com", initials: "AV", src: AVATAR("photo-1513673054901-2b5f51551112"), role: "Member", status: "Invited", lastActive: "Never" },
  { name: "Amara Okafor", email: "amara@acme.com", initials: "AO", src: AVATAR("photo-1573496527892-904f897eb744"), role: "Viewer", status: "Active", lastActive: "Yesterday" },
  { name: "Zara Delacroix", email: "zara@acme.com", initials: "ZD", src: AVATAR("photo-1631377307475-9acfa929b062"), role: "Member", status: "Suspended", lastActive: "Aug 21, 2026" },
  { name: "Paulina Nowak", email: "paulina@acme.com", initials: "PN", src: AVATAR("photo-1780733057947-7b57f5108f68"), role: "Admin", status: "Active", lastActive: "3 days ago" },
] as const;

const statusBadge = {
  Active: "badge badge-outline",
  Invited: "badge badge-secondary",
  Suspended: "badge badge-destructive",
} as const;

export default function UserTable() {
  return (
    <div className="card card-sm w-full gap-0">
      <div className="card-header border-b">
        <h3 className="card-title">Team members</h3>
        <p className="card-description">Manage who has access to the workspace.</p>
        <div className="card-action self-end">
          <button className="btn btn-sm" type="button">
            <svg className="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            Invite member
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header bg-muted/40">
            <tr className="table-row">
              <th className="table-head w-10 ps-4">
                <input type="checkbox" className="checkbox" aria-label="Select all members" />
              </th>
              <th className="table-head">Member</th>
              <th className="table-head">Role</th>
              <th className="table-head">Status</th>
              <th className="table-head">Last active</th>
              <th className="table-head pe-4"></th>
            </tr>
          </thead>
          <tbody className="table-body">
            {users.map((user, index) => (
              <tr key={user.email} className="table-row">
                <td className="table-cell ps-4">
                  <input type="checkbox" className="checkbox" aria-label={`Select ${user.name}`} />
                </td>
                <td className="table-cell">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="avatar">
                      <img className="avatar-image" src={user.src} alt="" />
                      <span className="avatar-fallback">{user.initials}</span>
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="table-cell">{user.role}</td>
                <td className="table-cell">
                  <span className={statusBadge[user.status]}>{user.status}</span>
                </td>
                <td className="table-cell text-muted-foreground">{user.lastActive}</td>
                <td className="table-cell pe-4 text-end">
                  <button type="button" id={`user-table-menu-${index}`} className="btn btn-ghost btn-sm btn-icon" aria-label={`Open menu for ${user.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                  <div className="dropdown" data-sp-toggle={`#user-table-menu-${index}`} data-sp-placement="bottom-end">
                    <button className="dropdown-item" type="button">Edit profile</button>
                    <button className="dropdown-item" type="button">Change role</button>
                    <button className="dropdown-item" type="button">Reset password</button>
                    <div className="dropdown-separator"></div>
                    <button className="dropdown-item dropdown-item-destructive" type="button">Remove from team</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer justify-between border-t">
          <button className="btn btn-outline btn-sm max-sm:btn-icon" type="button" disabled>
            <svg className="icon-start max-sm:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <svg className="sm:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span className="max-sm:sr-only">Previous</span>
          </button>
          <nav className="pagination pagination-sm max-sm:hidden" aria-label="Members pages">
            <a href="#" className="pagination-item active">1</a>
            <a href="#" className="pagination-item">2</a>
            <a href="#" className="pagination-item">3</a>
            <a href="#" className="pagination-item">4</a>
            <a href="#" className="pagination-item">5</a>
            <span className="pagination-ellipsis">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              <span className="sr-only">More pages</span>
            </span>
            <a href="#" className="pagination-item">10</a>
          </nav>
          <span className="text-sm sm:hidden">Page 1 of 10</span>
          <button className="btn btn-outline btn-sm max-sm:btn-icon" type="button">
            <span className="max-sm:sr-only">Next</span>
            <svg className="icon-end max-sm:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <svg className="sm:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
      </div>
    </div>
  );
}
