export function SkeletonContributionHistory() {
  const bars = ["60%", "80%", "65%", "95%", "50%", "100%"];
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-44 rounded-md" />
        <div className="skeleton h-4 w-52 rounded-md" />
      </div>
      <div className="card-content">
        <div className="flex h-50 w-full items-end gap-3">
          {bars.map((height, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="skeleton w-full rounded-t-md rounded-b-none" style={{ height }} />
              <div className="skeleton mx-auto h-3 w-6 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="card-content">
        <div className="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl bg-muted p-4">
            <div className="skeleton h-3 w-20 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-5 w-28 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-3 w-24 rounded-md bg-muted-foreground/15" />
          </div>
          <div className="hidden flex-col gap-2 rounded-xl bg-muted p-4 xl:flex">
            <div className="skeleton h-3 w-24 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-5 w-32 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-3 w-28 rounded-md bg-muted-foreground/15" />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonClaimableBalance() {
  return (
    <div className="card">
      <div className="card-header gap-3">
        <div className="skeleton h-4 w-36 rounded-md" />
        <div className="skeleton h-12 w-56 rounded-lg" />
        <div className="skeleton h-6 w-32 rounded-full" />
      </div>
      <div className="card-content flex flex-1 flex-col justify-end">
        <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-28 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-4 w-20 rounded-md bg-muted-foreground/15" />
          </div>
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-32 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-4 w-16 rounded-md bg-muted-foreground/15" />
          </div>
          <div className="skeleton h-px w-full rounded-none bg-muted-foreground/15" />
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-36 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-4 w-24 rounded-md bg-muted-foreground/15" />
          </div>
        </div>
      </div>
      <div className="card-footer flex-col gap-2">
        <div className="skeleton h-3 w-full rounded-md" />
        <div className="skeleton h-3 w-11/12 rounded-md" />
        <div className="skeleton h-3 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonDividendIncome() {
  const miniBars = ["40%", "60%", "80%", "50%"];
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-48 rounded-md" />
        <div className="skeleton h-4 w-64 rounded-md" />
        <div className="card-action">
          <div className="skeleton size-8 rounded-md" />
        </div>
      </div>
      <div className="card-content">
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-4 w-28 rounded-md bg-muted-foreground/15" />
                <div className="skeleton h-3 w-20 rounded-md bg-muted-foreground/15" />
              </div>
              <div className="hidden h-8 w-24 items-end gap-1 md:flex">
                {miniBars.map((height, i) => (
                  <div key={i} className="skeleton flex-1 rounded-t-sm rounded-b-none bg-muted-foreground/15" style={{ height }} />
                ))}
              </div>
              <div className="skeleton hidden h-4 w-16 rounded-md bg-muted-foreground/15 md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonPayoutThreshold() {
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-44 rounded-md" />
        <div className="skeleton h-4 w-72 rounded-md" />
      </div>
      <div className="card-content flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-32 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div className="skeleton h-3 w-40 rounded-md" />
            <div className="skeleton h-7 w-24 rounded-md" />
          </div>
          <div className="skeleton h-2 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <div className="skeleton h-3 w-16 rounded-md" />
            <div className="skeleton h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-16 rounded-md" />
          <div className="skeleton h-25 w-full rounded-lg" />
        </div>
      </div>
      <div className="card-footer">
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonSavingsTargets() {
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-36 rounded-md" />
        <div className="flex flex-col gap-1.5">
          <div className="skeleton h-4 w-full max-w-64 rounded-md" />
          <div className="skeleton h-4 w-48 rounded-md" />
        </div>
      </div>
      <div className="card-content">
        <div className="flex flex-col gap-3">
          {[0, 1].map((row) => (
            <div key={row} className="flex flex-col gap-3 rounded-xl bg-muted p-4">
              <div className="skeleton h-3 w-24 rounded-md bg-muted-foreground/15" />
              <div className="skeleton h-8 w-36 rounded-md bg-muted-foreground/15" />
              <div className="skeleton h-2 w-full rounded-full bg-muted-foreground/15" />
              <div className="flex items-center justify-between">
                <div className="skeleton h-3 w-24 rounded-md bg-muted-foreground/15" />
                <div className="skeleton h-3 w-20 rounded-md bg-muted-foreground/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer justify-center">
        <div className="skeleton h-3 w-56 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonNewMilestone() {
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-44 rounded-md" />
        <div className="skeleton h-4 w-72 rounded-md" />
      </div>
      <div className="card-content flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-20 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-24 rounded-md" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-20 rounded-md" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="card-footer flex-col gap-2">
        <div className="skeleton h-9 w-full rounded-lg" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonAccountAccess() {
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-36 rounded-md" />
        <div className="skeleton h-4 w-64 rounded-md" />
      </div>
      <div className="card-content flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="skeleton h-3 w-32 rounded-md" />
            <div className="skeleton h-3 w-12 rounded-md" />
          </div>
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
      </div>
      <div className="card-footer flex-col gap-4">
        <div className="skeleton h-9 w-full rounded-lg" />
        <div className="skeleton h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonUiElements() {
  return (
    <div className="card">
      <div className="card-content flex flex-col gap-6">
        <div className="skeleton h-8 w-full rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-9 w-20 rounded-lg" />
          <div className="skeleton h-9 w-24 rounded-lg" />
          <div className="skeleton h-9 w-20 rounded-lg" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="skeleton h-9 w-full rounded-lg" />
          <div className="skeleton h-20 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div className="skeleton h-5 w-12 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
          <div className="ml-auto flex gap-3">
            <div className="skeleton size-4 rounded-full" />
            <div className="skeleton size-4 rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton size-4 rounded-sm" />
          </div>
          <div className="skeleton ml-auto h-5 w-9 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="skeleton h-9 w-24 rounded-lg" />
          <div className="flex">
            <div className="skeleton h-9 w-28 rounded-l-lg rounded-r-none" />
            <div className="skeleton ml-px h-9 w-9 rounded-l-none rounded-r-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonQrConnect() {
  return (
    <div className="card">
      <div className="card-content flex justify-center pt-6">
        <div className="skeleton size-44 rounded-xl" />
      </div>
      <div className="card-header items-center gap-2 text-center">
        <div className="skeleton h-5 w-56 rounded-md" />
        <div className="skeleton h-4 w-64 rounded-md" />
        <div className="skeleton h-4 w-48 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonTransferFunds() {
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-36 rounded-md" />
        <div className="skeleton h-4 w-64 rounded-md" />
        <div className="card-action">
          <div className="skeleton size-8 rounded-md" />
        </div>
      </div>
      <div className="card-content flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-32 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-20 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-28 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-4 w-24 rounded-md bg-muted-foreground/15" />
          </div>
          <div className="skeleton h-px w-full rounded-none bg-muted-foreground/15" />
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-28 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-4 w-12 rounded-md bg-muted-foreground/15" />
          </div>
          <div className="skeleton h-px w-full rounded-none bg-muted-foreground/15" />
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-24 rounded-md bg-muted-foreground/15" />
            <div className="skeleton h-4 w-20 rounded-md bg-muted-foreground/15" />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonPayments() {
  return (
    <div className="card">
      <div className="card-header flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="skeleton h-4 w-12 rounded-md" />
          <div className="skeleton size-1.5 rounded-full" />
          <div className="skeleton size-7 rounded-md" />
          <div className="skeleton size-1.5 rounded-full" />
          <div className="skeleton h-4 w-20 rounded-md" />
        </div>
      </div>
      <div className="card-content">
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <div className="skeleton size-9 rounded-lg bg-muted-foreground/15" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-4 w-40 rounded-md bg-muted-foreground/15" />
                <div className="skeleton h-3 w-56 rounded-md bg-muted-foreground/15" />
              </div>
              <div className="skeleton size-4 rounded-md bg-muted-foreground/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonEmptyDistributeTrack() {
  return (
    <div className="card">
      <div className="card-content">
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="skeleton size-12 rounded-xl" />
          <div className="flex flex-col items-center gap-2">
            <div className="skeleton h-5 w-40 rounded-md" />
            <div className="skeleton h-3 w-64 rounded-md" />
            <div className="skeleton h-3 w-48 rounded-md" />
          </div>
          <div className="skeleton h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAnalytics() {
  return (
    <div className="card card-sm pb-0">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-24 rounded-md" />
        <div className="skeleton h-4 w-40 rounded-md" />
        <div className="card-action">
          <div className="skeleton h-7 w-28 rounded-lg" />
        </div>
      </div>
      <div className="skeleton mx-6 mb-6 aspect-[1/0.35] w-auto rounded-lg" />
    </div>
  );
}

export function SkeletonNotificationSettings() {
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-32 rounded-md" />
        <div className="skeleton h-4 w-64 rounded-md" />
      </div>
      <div className="card-content flex flex-col gap-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-start gap-3">
            <div className="skeleton size-4 rounded-sm" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton h-4 w-40 rounded-md" />
              <div className="skeleton h-3 w-56 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <div className="card-footer">
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonPowerUsage() {
  const bars = ["30%", "70%", "80%", "60%", "90%", "75%", "100%", "85%"];
  return (
    <div className="card">
      <div className="card-header gap-2">
        <div className="skeleton h-5 w-32 rounded-md" />
        <div className="skeleton h-4 w-24 rounded-md" />
      </div>
      <div className="card-content flex flex-col gap-4">
        <div className="flex h-35 w-full items-end gap-2">
          {bars.map((height, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1.5">
              <div className="skeleton w-full rounded-t rounded-b-none" style={{ height }} />
              <div className="skeleton mx-auto h-3 w-5 rounded-md" />
            </div>
          ))}
        </div>
        <div className="skeleton h-px w-full rounded-none" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-24 rounded-md" />
            <div className="skeleton h-5 w-16 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-20 rounded-md" />
            <div className="skeleton h-5 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
