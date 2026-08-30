export default function BlogPost() {
  return (
    <div className="card w-full max-w-sm">
      <img
        src="https://images.unsplash.com/photo-1592765213254-f101ad9b8f76?rect=0,0,3000,2000&w=640&h=427&fit=crop&auto=format&q=100"
        alt="White blossoms in muted warm tones"
        className="aspect-3/2 w-full object-cover"
      />
      <div className="card-header">
        <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight text-muted-foreground">
          <span>Mar 15, 2024</span>
          <span>·</span>
          <span>Design</span>
        </span>
        <h3 className="card-title">Finding Color Palettes in Nature</h3>
        <p className="card-description">
          How muted, organic tones from the natural world can ground the
          color system of your next project.
        </p>
      </div>
      <div className="card-footer gap-3">
        <span className="avatar avatar-lg">
            <img className="avatar-image" src="https://images.unsplash.com/photo-1750390200282-bf7f669a9946?w=640&h=640&fit=facearea&facepad=3.2&auto=format&q=100&bg-remove=true&bg=e5e5e5" alt="Leila Navarro" />
            <span className="avatar-fallback">LN</span>
          </span>
        <div className="text-sm">
          <p className="font-medium text-foreground">Leila Navarro</p>
          <p className="text-muted-foreground">Product Designer</p>
        </div>
      </div>
    </div>
  );
}
