export default function BlogPost() {
  return (
    <div className="card">
      <img
        src="https://cdn.gufo.dev/stockphotos/fdab3fb9.webp"
        alt="Blog post cover"
        className="aspect-3/2 w-full object-cover"
      />
      <div className="card-header">
        <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight text-muted-foreground">
          <span>Mar 15, 2024</span>
          <span>·</span>
          <span>Design</span>
        </span>
        <h3 className="card-title">Design Systems with Tailwind</h3>
        <p className="card-description">
          Learn how utility classes can help you build and scale a
          beautiful design system across projects.
        </p>
      </div>
      <div className="card-footer gap-3">
        <span className="avatar">
            <img className="avatar-image" src="https://cdn.gufo.dev/stockphotos/1c7a7245.webp" alt="Sarah Johnson" />
            <span className="avatar-fallback">SJ</span>
          </span>
        <div className="text-sm">
          <p className="font-medium text-foreground">Sarah Johnson</p>
          <p className="text-muted-foreground">Product Designer</p>
        </div>
      </div>
    </div>
  );
}
