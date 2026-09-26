const AVATAR = (id: string) =>
  `https://images.unsplash.com/${id}?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5`;

const people = {
  leila: { name: "Leila Navarro", initials: "LN", src: AVATAR("photo-1750390200282-bf7f669a9946") },
  maya: { name: "Maya Santoso", initials: "MS", src: AVATAR("photo-1573497019236-17f8177b81e8") },
  sofia: { name: "Sofia Lindqvist", initials: "SL", src: AVATAR("photo-1573497019940-1c28c88b4f3e") },
  anouk: { name: "Anouk Visser", initials: "AV", src: AVATAR("photo-1513673054901-2b5f51551112") },
  amara: { name: "Amara Okafor", initials: "AO", src: AVATAR("photo-1573496527892-904f897eb744") },
};

const files = [
  { name: "Q3 roadmap.pdf", ext: "pdf", color: "bg-red-500", meta: "PDF", shared: [people.leila, people.amara], size: "2.4 MB", modified: "Sep 12, 2026" },
  { name: "Homepage hero.png", ext: "png", color: "bg-purple-500", meta: "PNG", shared: [people.maya], size: "5.8 MB", modified: "Sep 10, 2026" },
  { name: "Onboarding walkthrough.mp4", ext: "mp4", color: "bg-blue-600", meta: "MP4", shared: [people.sofia, people.anouk, people.amara], size: "312 MB", modified: "Sep 8, 2026" },
  { name: "Podcast intro.wav", ext: "wav", color: "bg-pink-500", meta: "WAV", shared: [], size: "48 MB", modified: "Sep 3, 2026" },
  { name: "Brand kit.zip", ext: "zip", color: "bg-amber-500", meta: "ZIP", shared: [people.leila], size: "96 MB", modified: "Aug 28, 2026" },
  { name: "Dashboard prototype.fig", ext: "fig", color: "bg-violet-600", meta: "Figma", shared: [people.leila, people.maya, people.sofia], size: "4.2 MB", modified: "Aug 21, 2026" },
  { name: "Team offsite notes.docx", ext: "docx", color: "bg-blue-500", meta: "Word", shared: [people.anouk], size: "400 KB", modified: "Aug 14, 2026" },
];

export default function FileTable() {
  return (
    <div className="card card-sm w-full gap-0">
      <div className="card-header border-b">
        <h3 className="card-title">All files</h3>
        <p className="card-description">24 files · 2.4 GB of 10 GB used</p>
        <div className="card-action flex gap-2 self-end">
          <button className="btn btn-outline btn-sm" type="button">
            <svg className="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
            New folder
          </button>
          <button className="btn btn-sm" type="button">
            <svg className="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Upload
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header bg-muted/40">
            <tr className="table-row">
              <th className="table-head w-10 ps-4">
                <input type="checkbox" className="checkbox" aria-label="Select all files" />
              </th>
              <th className="table-head">Name</th>
              <th className="table-head">Shared with</th>
              <th className="table-head">Size</th>
              <th className="table-head">Modified</th>
              <th className="table-head pe-4"></th>
            </tr>
          </thead>
          <tbody className="table-body">
            {files.map((file, index) => (
              <tr key={file.name} className="table-row">
                <td className="table-cell ps-4">
                  <input type="checkbox" className="checkbox" aria-label={`Select ${file.name}`} />
                </td>
                <td className="table-cell">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9.5 w-8 shrink-0 items-end justify-center rounded-sm border bg-background pb-1">
                      <span className={`rounded-xs px-0.75 py-px font-mono text-[8px] font-semibold tracking-wide text-white uppercase ${file.color}`}>{file.ext}</span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.meta}</span>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  {file.shared.length ? (
                    <span className="avatar-group">
                      {file.shared.map((person) => (
                        <span key={person.name} className="avatar avatar-sm">
                          <img className="avatar-image" src={person.src} alt={person.name} />
                          <span className="avatar-fallback">{person.initials}</span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Only you</span>
                  )}
                </td>
                <td className="table-cell">{file.size}</td>
                <td className="table-cell text-muted-foreground">{file.modified}</td>
                <td className="table-cell pe-4 text-end">
                  <button type="button" id={`file-table-menu-${index}`} className="btn btn-ghost btn-sm btn-icon" aria-label={`Open menu for ${file.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                  <div className="dropdown" data-sp-toggle={`#file-table-menu-${index}`} data-sp-placement="bottom-end">
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                      Share
                    </button>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      Copy link
                    </button>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
                      Download
                    </button>
                    <div className="dropdown-separator"></div>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                      Rename
                    </button>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><path d="M2 13h10"/><path d="m9 16 3-3-3-3"/></svg>
                      Move to
                    </button>
                    <div className="dropdown-separator"></div>
                    <button className="dropdown-item dropdown-item-destructive" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Delete
                    </button>
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
          <nav className="pagination pagination-sm max-sm:hidden" aria-label="Files pages">
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
