import { PlusIcon } from "@radix-ui/react-icons";

export default function Profile() {
  return (
    <div className="card">
      <div className="card-content">
        <img
          src="https://images.unsplash.com/photo-1604573824303-d0177f69461f?rect=0,0,4000,4000&w=640&h=640&fit=crop&auto=format&q=100"
          alt="Vivienne Kleinfeld"
          className="aspect-square w-full rounded-xl object-cover"
        />
      </div>
      <div className="card-header">
        <h3 className="card-title">Vivienne Kleinfeld</h3>
        <p className="card-description">
          Product Designer who focuses on simplicity &amp; usability.
          Currently designing at Acme Inc.
        </p>
      </div>
      <div className="card-footer gap-6">
        <div className="leading-tight">
          <p className="text-sm font-semibold tabular-nums">312</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tabular-nums">48</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
        <button className="btn btn-sm ml-auto">
          Follow
          <PlusIcon className="icon-end" stroke="currentColor" strokeWidth="0.5" />
        </button>
      </div>
    </div>
  );
}
