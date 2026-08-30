import { Check } from "lucide-react";

export default function InvoicePaid() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content flex flex-col items-center gap-4 text-center text-balance">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Check className="size-6" />
        </div>
        <div className="flex max-w-sm flex-col items-center gap-1">
          <div className="text-lg font-medium tracking-tight">
            Invoice paid
          </div>
          <div className="text-sm/relaxed text-muted-foreground">
            You paid $17,975.30. A receipt copy was sent to
            accounting@example.com.
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          <button type="button" className="btn w-full">
            Next invoice
          </button>
          <button type="button" className="btn btn-outline w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
