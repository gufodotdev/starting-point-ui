const files = [
  { name: "Tech requirements.pdf", ext: "pdf", color: "bg-red-500", size: "200 KB", uploaded: "Jan 4, 2026", by: "Leila Navarro" },
  { name: "Dashboard screenshot.jpg", ext: "jpg", color: "bg-purple-500", size: "720 KB", uploaded: "Jan 4, 2026", by: "Maya Okonkwo" },
  { name: "Dashboard prototype recording.mp4", ext: "mp4", color: "bg-blue-600", size: "16 MB", uploaded: "Jan 2, 2026", by: "Devin Ross" },
  { name: "Dashboard prototype FINAL.fig", ext: "fig", color: "bg-violet-600", size: "4.2 MB", uploaded: "Jan 6, 2026", by: "Priya Raman" },
  { name: "UX design guidelines.docx", ext: "docx", color: "bg-blue-500", size: "400 KB", uploaded: "Jan 8, 2026", by: "Grace Adeyemi" },
  { name: "Dashboard interaction.aep", ext: "aep", color: "bg-indigo-500", size: "12 MB", uploaded: "Jan 6, 2026", by: "Theo Lindqvist" },
  { name: "Briefing call recording.mp3", ext: "mp3", color: "bg-pink-500", size: "18.6 MB", uploaded: "Jan 4, 2026", by: "Camille Laurent" },
];

export default function TableRowActions() {
  return (
    <div className="card card-sm w-full gap-0">
      <div className="card-header border-b">
        <h3 className="card-title">Files uploaded</h3>
        <p className="card-description max-sm:col-start-1">7 files · 52.1 MB</p>
        <div className="card-action flex items-center gap-2 self-end max-sm:col-start-1 max-sm:row-start-3 max-sm:mt-2 max-sm:justify-self-start">
          <button className="btn btn-outline btn-sm" type="button">Download all</button>
          <button className="btn btn-sm" type="button">
            <svg className="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Upload
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header bg-muted/40">
            <tr className="table-row hover:bg-transparent">
              <th className="table-head w-10 ps-4 pe-3">
                <input type="checkbox" className="checkbox align-middle" data-sp-toggle-all aria-label="Select all files" />
              </th>
              <th className="table-head">File name</th>
              <th className="table-head w-32">File size</th>
              <th className="table-head w-40">Date uploaded</th>
              <th className="table-head w-44">Uploaded by</th>
              <th className="table-head w-11 pe-4"></th>
            </tr>
          </thead>
          <tbody className="table-body">
            {files.map((file, index) => (
              <tr key={file.name} className="table-row h-16.5 border-border/50">
                <td className="table-cell ps-4 pe-3">
                  <input type="checkbox" className="checkbox align-middle" aria-label={`Select ${file.name}`} />
                </td>
                <td className="table-cell">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9.5 w-8 shrink-0 items-end justify-center rounded-sm border bg-background pb-1">
                      <span className={`rounded-xs px-0.75 py-px font-mono text-[8px] font-semibold tracking-wide text-white uppercase ${file.color}`}>{file.ext}</span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[13px] font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-[13px]">{file.size}</td>
                <td className="table-cell text-[13px] text-muted-foreground">{file.uploaded}</td>
                <td className="table-cell text-[13px]">{file.by}</td>
                <td className="table-cell pe-4 text-end">
                  <button type="button" id={`file-menu-${index}`} className="btn btn-ghost btn-sm btn-icon text-muted-foreground" aria-label={`Open menu for ${file.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                  <div className="dropdown w-54" data-sp-toggle={`#file-menu-${index}`} data-sp-placement="bottom-end">
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>
                      Cut
                      <span className="dropdown-shortcut">⌘X</span>
                    </button>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copy
                      <span className="dropdown-shortcut">⌘C</span>
                    </button>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 14h10"/><path d="M16 4h2a2 2 0 0 1 2 2v1.344"/><path d="m17 18 4-4-4-4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
                      Paste
                      <span className="dropdown-shortcut">⌘V</span>
                    </button>
                    <div className="dropdown-separator"></div>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                      Rename
                    </button>
                    <button className="dropdown-item" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="15" x2="15" y1="12" y2="18"/><line x1="12" x2="18" y1="15" y2="15"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Duplicate
                      <span className="dropdown-shortcut">⌘D</span>
                    </button>
                    <button className="dropdown-item dropdown-item-destructive" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Delete
                      <span className="dropdown-shortcut">⌘⌫</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer justify-between border-t text-xs text-muted-foreground">
        <span>Showing 7 of 42 files</span>
        <div className="flex gap-1.5">
          <button className="btn btn-outline btn-sm" type="button" disabled>Previous</button>
          <button className="btn btn-outline btn-sm" type="button">Next</button>
        </div>
      </div>
    </div>
  );
}
