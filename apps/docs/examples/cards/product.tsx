import { Plus, Star } from "lucide-react";

export default function Product() {
  return (
    <div className="card relative">
      <img
        src="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?rect=0,0,4896,3264&w=640&h=427&fit=crop&auto=format&q=100"
        alt="Vintage leather sofa"
        className="aspect-3/2 w-full object-cover"
      />
      <span className="badge absolute top-3 left-3">Sale</span>
      <div className="card-header">
        <span className="text-xs font-medium tracking-tight text-muted-foreground">
          Furniture
        </span>
        <h3 className="card-title">Vintage Leather Sofa</h3>
        <p className="card-description">
          Full-grain aniline leather sofa with a sturdy oak hardwood frame
          and a soft, lived-in feel.
        </p>
      </div>
      <div className="card-content flex items-center gap-2">
        <div className="flex gap-1">
          <Star className="size-4.5 text-primary" fill="currentColor" />
          <Star className="size-4.5 text-primary" fill="currentColor" />
          <Star className="size-4.5 text-primary" fill="currentColor" />
          <Star className="size-4.5 text-primary" fill="currentColor" />
          <Star className="size-4.5 text-muted" fill="currentColor" />
        </div>
        <span className="text-sm text-muted-foreground">(128)</span>
      </div>
      <div className="card-footer justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">$899</span>
          <span className="text-sm text-muted-foreground line-through">
            $1,099
          </span>
        </div>
        <button className="btn btn-sm">
          Add to Cart
          <Plus className="icon-end" />
        </button>
      </div>
    </div>
  );
}
