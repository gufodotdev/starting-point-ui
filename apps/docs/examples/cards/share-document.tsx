import { CopyIcon } from "@radix-ui/react-icons";

export default function ShareDocument() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Share Document</h3>
        <p className="card-description">
          Invite others to view or edit this document and work together
          seamlessly.
        </p>
      </div>
      <div className="card-content flex flex-col gap-6">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            type="text"
            readOnly
            defaultValue="https://example.com/doc/abc123"
            aria-label="Document link"
          />
          <button className="btn btn-outline btn-icon" aria-label="Copy link">
            <CopyIcon />
          </button>
        </div>
        <div className="separator"></div>
        <span className="text-sm font-medium">People with access</span>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="avatar avatar-lg">
            <img className="avatar-image" src="https://images.unsplash.com/photo-1750390200282-bf7f669a9946?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5" alt="Leila Navarro" />
            <span className="avatar-fallback">LN</span>
          </span>
            <div className="text-sm">
              <p className="font-medium text-foreground">Leila Navarro</p>
              <p className="text-muted-foreground">leila@example.com</p>
            </div>
          </div>
          <select className="select h-8 w-22" aria-label="Permission for Leila Navarro">
            <option value="write">Write</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="avatar avatar-lg">
            <img className="avatar-image" src="https://images.unsplash.com/photo-1750390200293-92d5a788d3a2?w=640&h=640&fit=facearea&facepad=3&auto=format&q=100&bg-remove=true&bg=e5e5e5" alt="Theo Marchetti" />
            <span className="avatar-fallback">TM</span>
          </span>
            <div className="text-sm">
              <p className="font-medium text-foreground">Theo Marchetti</p>
              <p className="text-muted-foreground">theo@example.com</p>
            </div>
          </div>
          <select className="select h-8 w-22" aria-label="Permission for Theo Marchetti">
            <option value="read">Read</option>
            <option value="write">Write</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="avatar avatar-lg">
            <img className="avatar-image" src="https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5" alt="Maya Santoso" />
            <span className="avatar-fallback">MS</span>
          </span>
            <div className="text-sm">
              <p className="font-medium text-foreground">Camille Laurent</p>
              <p className="text-muted-foreground">camille@example.com</p>
            </div>
          </div>
          <select className="select h-8 w-22" aria-label="Permission for Camille Laurent">
            <option value="read">Read</option>
            <option value="write">Write</option>
          </select>
        </div>
      </div>
    </div>
  );
}
