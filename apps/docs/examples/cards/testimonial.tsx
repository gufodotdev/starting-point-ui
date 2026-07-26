import { StarFilledIcon } from "@radix-ui/react-icons";

export default function Testimonial() {
  return (
    <div className="card">
      <div className="card-content flex flex-col gap-6">
        <div className="flex gap-1">
          <StarFilledIcon className="size-4.5 text-primary" />
          <StarFilledIcon className="size-4.5 text-primary" />
          <StarFilledIcon className="size-4.5 text-primary" />
          <StarFilledIcon className="size-4.5 text-primary" />
          <StarFilledIcon className="size-4.5 text-primary" />
        </div>
        <p className="text-sm/6 text-muted-foreground">
          Starting Point UI has transformed how we build interfaces. The
          components are beautifully designed and easy to customize.
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
