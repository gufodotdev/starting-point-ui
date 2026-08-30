import { Minus, Plus, X } from "lucide-react";

type CartItem = {
  name: string;
  variant: string;
  qty: number;
  price: string;
  compareAt?: string;
  image: string;
};

const items: CartItem[] = [
  {
    name: "Vintage Leather Sofa",
    variant: "Full-grain aniline",
    qty: 1,
    price: "$899",
    compareAt: "$1,099",
    image:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?rect=220,0,3264,3264&w=640&h=640&fit=crop&auto=format&q=100",
  },
  {
    name: "Cable Knit Sweater",
    variant: "Cream · Size S",
    qty: 1,
    price: "$79",
    image:
      "https://images.unsplash.com/photo-1571139627661-cf707929f465?rect=0,57,2592,2592&w=640&h=640&fit=crop&auto=format&q=100",
  },
  {
    name: "Oversized Cotton Tee",
    variant: "Sand · Size M · $29 each",
    qty: 2,
    price: "$58",
    image:
      "https://images.unsplash.com/photo-1710954962775-c46bd6a5f67f?rect=0,0,3072,3072&w=640&h=640&fit=crop&auto=format&q=100",
  },
];

export default function ShoppingCart() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-header">
        <div className="card-title">Shopping Cart</div>
        <div className="card-description">
          You have {items.length} items in your cart.
        </div>
        <div className="card-action -mr-2.5">
          <button type="button" className="btn btn-ghost btn-sm">
            Clear
          </button>
        </div>
      </div>
      <div className="card-content flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.name} className="flex gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-md border">
              <img
                src={item.image}
                alt={item.name}
                className="size-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-sm font-medium">{item.name}</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon -mt-1.5 -mr-1.5 size-6 text-muted-foreground"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {item.variant}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="btn-group rounded-md bg-muted">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-icon"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus />
                  </button>
                  <div className="btn-group-text border-0 bg-transparent px-2 text-xs shadow-none tabular-nums">
                    {item.qty}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-icon"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus />
                  </button>
                </div>
                <p className="text-sm font-medium tabular-nums">
                  {item.compareAt && (
                    <span className="mr-1.5 text-xs font-normal text-muted-foreground line-through">
                      {item.compareAt}
                    </span>
                  )}
                  {item.price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card-footer flex-col">
        <div className="separator mb-4"></div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-base font-semibold tabular-nums">$1,036</span>
        </div>
        <button className="btn mt-4 w-full">Checkout</button>
        <p className="mt-3 w-full text-center text-xs text-muted-foreground">
          Free shipping &amp; returns on all orders
        </p>
      </div>
    </div>
  );
}
