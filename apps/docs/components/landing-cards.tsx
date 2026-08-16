import Chat from "@/examples/cards/chat";
import {
  SkeletonAccountAccess,
  SkeletonAnalytics,
  SkeletonClaimableBalance,
  SkeletonContributionHistory,
  SkeletonDividendIncome,
  SkeletonEmptyDistributeTrack,
  SkeletonNewMilestone,
  SkeletonNotificationSettings,
  SkeletonPayments,
  SkeletonPayoutThreshold,
  SkeletonPowerUsage,
  SkeletonQrConnect,
  SkeletonSavingsTargets,
  SkeletonTransferFunds,
  SkeletonUiElements,
} from "@/components/landing-skeletons";

function Analytics() {
  return (
    <div className="card card-sm pb-0">
      <div className="card-header">
        <div className="card-title">Analytics</div>
        <div className="card-description">
          418.2K Visitors <span className="badge">+10%</span>
        </div>
        <div className="card-action">
          <button className="btn btn-outline btn-sm" type="button">View Analytics</button>
        </div>
      </div>
      <svg
        viewBox="0 0 100 86"
        preserveAspectRatio="none"
        className="aspect-[1/0.35] w-full text-chart-1"
        role="img"
        aria-label="Visitor trend"
      >
        <path d="M0 52L18 40L36 46L54 70L72 50L100 49V86H0Z" fill="currentColor" opacity="0.28" />
        <path d="M0 52L18 40L36 46L54 70L72 50L100 49" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function PowerUsage() {
  const hours = [
    ["6a", "31.6%"],
    ["8a", "73.7%"],
    ["10a", "81.6%"],
    ["12p", "63.2%"],
    ["2p", "89.5%"],
    ["4p", "76.3%"],
    ["6p", "100%"],
    ["8p", "84.2%"],
  ];
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Power Usage</div>
        <div className="card-description">Whole Home</div>
      </div>
      <div className="card-content flex flex-col gap-4">
        <div className="flex h-35 w-full items-end gap-2" role="img" aria-label="Power usage by hour">
          {hours.map(([hour, height]) => (
            <div key={hour} className="flex h-full flex-1 flex-col justify-end gap-1.5">
              <div className="min-h-2 rounded-t bg-chart-2" style={{ height }} />
              <span className="text-center text-xs text-muted-foreground">{hour}</span>
            </div>
          ))}
        </div>
        <div className="separator" role="separator"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-muted-foreground">Currently Using</span>
            <span className="text-lg font-semibold tabular-nums">3.4 kW</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-muted-foreground">Solar Gen</span>
            <span className="text-lg font-semibold tabular-nums">+1.2 kW</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const qrCells = [
  "111111100101101111111",
  "100000101001001000001",
  "101110101111101011101",
  "101110100100001011101",
  "101110101010101011101",
  "100000100111001000001",
  "111111101010101111111",
  "000000001101000000000",
  "101011111001111010110",
  "010100001110010101001",
  "111010111011101111010",
  "001101000101000010101",
  "110111101111010111011",
  "000000001001010001010",
  "111111101101111101001",
  "100000100010001001111",
  "101110101011101110100",
  "101110100110100010011",
  "101110101000111101110",
  "100000101101000011001",
  "111111101011101101111",
];

function QrConnect() {
  return (
    <div className="card">
      <div className="card-content flex justify-center pt-6">
        <div className="rounded-xl border bg-white p-4">
          <svg
            viewBox="0 0 21 21"
            className="size-40 text-black"
            role="img"
            aria-label="Connect device QR code"
            shapeRendering="crispEdges"
          >
            <rect width="21" height="21" fill="white" />
            {qrCells.map((row, y) =>
              [...row].map((cell, x) =>
                cell === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null,
              ),
            )}
          </svg>
        </div>
      </div>
      <div className="card-header text-center">
        <div className="card-title">Scan to connect your mobile device</div>
        <div className="card-description text-balance">
          Open the Ledger mobile app and scan this code to link your device.
        </div>
      </div>
    </div>
  );
}

function ClaimableBalance() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-description">Claimable Balance</div>
        <div className="card-title text-4xl tabular-nums">$1,211.29</div>
        <span className="badge badge-outline">
          <span className="size-2 rounded-full bg-yellow-500" />
          Pending Setup
        </span>
      </div>
      <div className="card-content flex flex-1 flex-col justify-end">
        <div className="item item-muted flex-col items-stretch">
          <div className="item-content gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Net Royalties</span>
              <span className="text-sm font-medium tabular-nums">$1,248.75</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Fee</span>
              <span className="text-sm font-medium tabular-nums">-$37.46</span>
            </div>
            <div className="separator" role="separator"></div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Ready to Claim</span>
              <span className="text-sm font-semibold tabular-nums">$1,211.29 USD</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <div className="card-description">
          Once your bank is connected, balances over $10.00 are automatically eligible for monthly
          distribution on the 15th of each month.
        </div>
      </div>
    </div>
  );
}

function DividendIncome() {
  const holdings = [
    { name: "Vanguard", shares: "450 Shares", bars: ["58.3%", "64.4%", "59.8%", "100%"] },
    { name: "S&P 500 VOO", shares: "112 Shares", bars: ["56.3%", "65.6%", "100%", "68.1%"] },
    { name: "Apple AAPL", shares: "85 Shares", bars: ["50%", "58.3%", "100%", "75%"] },
    { name: "Realty Income", shares: "320 Shares", bars: ["66.7%", "72.2%", "77.8%", "100%"] },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Q2 Dividend Income</div>
        <div className="card-description">
          Quarterly dividend payouts across your portfolio holdings.
        </div>
        <div className="card-action">
          <button className="btn btn-ghost btn-sm btn-icon bg-muted" type="button" aria-label="Dismiss dividend income">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="item-group" role="list">
          {holdings.map((holding) => (
            <div key={holding.name} className="item item-muted" role="listitem">
              <div className="item-content">
                <div className="item-title">{holding.name}</div>
                <div className="item-description">{holding.shares}</div>
              </div>
              <div className="hidden h-8 w-24 items-end gap-1 md:flex" role="img" aria-label={`${holding.name} quarterly dividends`}>
                {holding.bars.map((height, index) => (
                  <div key={index} className="min-h-1 flex-1 rounded-t-sm bg-chart-2" style={{ height }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContributionHistory() {
  const months = [
    ["Dec", "61.5%", "bg-chart-1"],
    ["Jan", "84.6%", "bg-chart-2"],
    ["Feb", "69.2%", "bg-chart-3"],
    ["Mar", "100%", "bg-chart-4"],
    ["Apr", "57.7%", "bg-chart-5"],
  ];
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Contribution History</div>
        <div className="card-description">Last 6 months of activity</div>
      </div>
      <div className="card-content">
        <div className="flex h-50 w-full items-end gap-3" role="img" aria-label="Last 6 months of contribution activity">
          {months.map(([month, height, color]) => (
            <div key={month} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className={`min-h-2 rounded-lg ${color}`} style={{ height }} />
              <span className="text-center text-xs text-muted-foreground">{month}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card-content">
        <div className="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="item item-muted flex-col items-stretch">
            <div className="item-content gap-1">
              <div className="item-description text-xs font-medium tracking-wider uppercase">Upcoming</div>
              <span className="text-base font-semibold">May 2024</span>
              <span className="text-sm text-muted-foreground">Scheduled</span>
            </div>
          </div>
          <div className="item item-muted hidden flex-col items-stretch xl:flex">
            <div className="item-content gap-1">
              <div className="item-description text-xs font-medium tracking-wider uppercase">Savings Plan</div>
              <span className="text-base font-semibold">Accelerated</span>
              <span className="text-sm text-muted-foreground">Recurring</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn w-full" type="button">View Full Report</button>
      </div>
    </div>
  );
}

function SavingsTargets() {
  const targets = [
    { label: "Retirement", amount: "$420,000", value: 65, achieved: "$273,000" },
    { label: "Real Estate", amount: "$85,000", value: 32, achieved: "$27,200" },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Savings Targets</div>
        <div className="card-description">
          Active milestones for 2024 across your portfolio. Monitor how close you are to each
          savings goal.
        </div>
      </div>
      <div className="card-content">
        <div className="item-group gap-3" role="list">
          {targets.map((target) => (
            <div key={target.label} className="item item-muted flex-col items-stretch" role="listitem">
              <div className="item-content gap-3">
                <div className="item-description text-xs font-medium tracking-wider uppercase">
                  {target.label}
                </div>
                <span className="text-3xl font-semibold tabular-nums">{target.amount}</span>
                <progress
                  className="progress"
                  value={target.value}
                  max={100}
                  aria-label={`${target.label} savings progress`}
                ></progress>
              </div>
              <div className="item-footer">
                <span className="text-sm text-muted-foreground">{target.value}% achieved</span>
                <span className="text-sm font-medium tabular-nums">{target.achieved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <div className="card-description text-center">
          You have not met your targets for this year.
        </div>
      </div>
    </div>
  );
}

function DistributeTrack() {
  return (
    <div className="card">
      <div className="card-content">
        <div className="empty p-4">
          <div className="empty-media empty-media-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <div className="empty-header">
            <div className="empty-title">Distribute Track</div>
            <div className="empty-description">
              Upload your first master to start reaching listeners on Spotify, Apple Music, and
              more.
            </div>
          </div>
          <div className="empty-content">
            <button className="btn" type="button">Create Release</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewMilestone() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Set a new milestone</div>
        <div className="card-description">
          Define your financial target and we&apos;ll help you pace your savings.
        </div>
      </div>
      <div className="card-content">
        <div className="field-group">
          <div className="field">
            <label className="label" htmlFor="landing-goal-name">Goal Name</label>
            <input className="input" id="landing-goal-name" placeholder="e.g. New Car, Home Downpayment" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="label" htmlFor="landing-target-amount">Target Amount</label>
              <input className="input" id="landing-target-amount" defaultValue="$15,000" />
            </div>
            <div className="field">
              <label className="label" htmlFor="landing-target-date">Target Date</label>
              <input className="input" id="landing-target-date" defaultValue="Dec 2025" />
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer flex-col gap-2">
        <button className="btn w-full" type="button">Create Goal</button>
        <button className="btn btn-outline w-full" type="button">Cancel</button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const notifications = [
    {
      id: "transactions",
      label: "Transaction alerts",
      description: "Deposits, withdrawals, and transfers.",
      defaultChecked: true,
    },
    {
      id: "security",
      label: "Security alerts",
      description: "Login attempts and account changes.",
      defaultChecked: true,
    },
    {
      id: "goals",
      label: "Goal milestones",
      description: "Updates at 25%, 50%, 75%, and 100%.",
      defaultChecked: false,
    },
    {
      id: "market",
      label: "Market updates",
      description: "Daily portfolio summary and price alerts.",
      defaultChecked: false,
    },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Notifications</div>
        <div className="card-description">
          Choose which email and push alerts you want to receive.
        </div>
      </div>
      <div className="card-content">
        <div className="field-group">
          {notifications.map((notification) => (
            <div key={notification.id} className="field field-horizontal">
              <input
                type="checkbox"
                className="checkbox"
                id={`landing-notify-${notification.id}`}
                defaultChecked={notification.defaultChecked}
              />
              <div className="field-content">
                <label className="label" htmlFor={`landing-notify-${notification.id}`}>
                  {notification.label}
                </label>
                <p className="field-description">{notification.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <button className="btn w-full" type="button">Save Preferences</button>
      </div>
    </div>
  );
}

function PayoutThreshold() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Payout Threshold</div>
        <div className="card-description">
          Set the minimum balance required before a payout is triggered.
        </div>
        <div className="card-action">
          <button className="btn btn-ghost btn-sm btn-icon bg-muted" type="button" aria-label="Dismiss payout threshold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="field-group">
          <div className="field">
            <label className="label" htmlFor="landing-preferred-currency">Preferred Currency</label>
            <select className="select w-full" id="landing-preferred-currency" defaultValue="usd">
              <option value="usd">USD — United States Dollar</option>
              <option value="eur">EUR — Euro</option>
              <option value="gbp">GBP — British Pound</option>
              <option value="jpy">JPY — Japanese Yen</option>
            </select>
          </div>
          <div className="field">
            <div className="flex items-baseline justify-between">
              <span className="label" id="landing-min-payout-label">Minimum Payout Amount</span>
              <span className="text-2xl font-semibold tabular-nums">$2500.00</span>
            </div>
            <progress
              className="progress"
              value={25}
              max={100}
              aria-labelledby="landing-min-payout-label"
              aria-valuetext="$2,500 of $10,000"
            ></progress>
            <div className="flex items-center justify-between">
              <p className="field-description">$50 (MIN)</p>
              <p className="field-description">$10,000 (MAX)</p>
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="landing-payout-notes">Notes</label>
            <textarea
              className="textarea min-h-25"
              id="landing-payout-notes"
              placeholder="Add any notes for this payout configuration..."
            ></textarea>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn w-full" type="button">Save Threshold</button>
      </div>
    </div>
  );
}

function AccountAccess() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Account Access</div>
        <div className="card-description">Update your credentials or re-authenticate.</div>
      </div>
      <div className="card-content">
        <div className="field-group">
          <div className="field">
            <label className="label" htmlFor="landing-email-address">Email Address</label>
            <input className="input" id="landing-email-address" type="email" placeholder="artist@studio.inc" />
          </div>
          <div className="field">
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="landing-current-password">Current Password</label>
              <a
                href="#"
                className="text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground"
              >
                Forgot?
              </a>
            </div>
            <input
              className="input"
              id="landing-current-password"
              type="password"
              placeholder="••••••••••••••••••••••••"
            />
          </div>
        </div>
      </div>
      <div className="card-footer flex-col gap-4">
        <button className="btn w-full" type="button">
          <span className="icon-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          Update Security
        </button>
        <a href="#" className="item item-muted">
          <div className="item-media item-media-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <div className="item-content">
            <div className="item-title">Danger Zone</div>
            <div className="item-description line-clamp-1">Archive account and remove catalog</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m9 18 6-6-6-6"/></svg>
        </a>
      </div>
    </div>
  );
}

function Payments() {
  const links = [
    {
      title: "Change transfer limit",
      description: "Adjust how much you can send from your balance.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      ),
    },
    {
      title: "Scheduled transfers",
      description: "Set up a transfer to send at a later date.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
      ),
    },
    {
      title: "Recurring card payments",
      description: "Manage your repeated card transactions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
      ),
    },
  ];
  return (
    <div className="card">
      <div className="card-header flex flex-col gap-3">
        <nav className="breadcrumb">
          <a href="#" className="breadcrumb-item">Home</a>
          <span className="breadcrumb-separator">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
          <button className="btn btn-ghost btn-sm btn-icon" type="button" id="landing-payments-menu" aria-label="Account options">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <div className="dropdown" data-sp-toggle="#landing-payments-menu" data-sp-placement="bottom-start">
            <button className="dropdown-item" type="button">Profile</button>
            <button className="dropdown-item" type="button">Statements</button>
            <button className="dropdown-item" type="button">Documents</button>
          </div>
          <span className="breadcrumb-separator">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
          <a href="#" className="breadcrumb-item active">Payments</a>
        </nav>
      </div>
      <div className="card-content">
        <div className="item-group" role="list">
          {links.map((link) => (
            <div key={link.title} role="listitem" className="w-full">
              <a href="#" className="item item-muted">
                <div className="item-media item-media-icon">{link.icon}</div>
                <div className="item-content">
                  <div className="item-title">{link.title}</div>
                  <div className="item-description">{link.description}</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UiElements() {
  return (
    <div className="card">
      <div className="card-content flex flex-col gap-6">
        <div className="flex gap-2">
          <button className="btn" type="button">
            Button
            <span className="icon-end">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </button>
          <button className="btn btn-secondary" type="button">Secondary</button>
          <button className="btn btn-outline" type="button">Outline</button>
        </div>
        <div className="field-group">
          <div className="field">
            <div className="input-group">
              <input className="input" placeholder="Name" aria-label="Name" />
              <div className="input-group-addon input-group-addon-end">
                <span className="input-group-text">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
              </div>
            </div>
          </div>
          <div className="field flex-1">
            <textarea className="textarea resize-none" placeholder="Message" aria-label="Message"></textarea>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <span className="badge">Badge</span>
            <span className="badge badge-secondary">Secondary</span>
          </div>
          <div className="ms-auto flex w-fit gap-3" role="radiogroup" aria-label="Fruit preference">
            <input type="radio" className="radio" name="landing-fruit" defaultChecked aria-label="Apple" />
            <input type="radio" className="radio" name="landing-fruit" aria-label="Banana" />
          </div>
          <div className="flex gap-3">
            <input type="checkbox" className="checkbox" defaultChecked aria-label="Enable email alerts" />
          </div>
          <input type="checkbox" className="switch" defaultChecked aria-label="Enable compact notifications" />
        </div>
        <div className="flex items-center gap-4">
          <button id="landing-alert-trigger" className="btn btn-outline" type="button">
            <span className="hidden md:flex">Alert Dialog</span>
            <span className="flex md:hidden">Dialog</span>
          </button>
          <dialog className="dialog" data-sp-toggle="#landing-alert-trigger">
            <div className="dialog-panel">
              <div className="dialog-header">
                <div className="dialog-title">Allow accessory to connect?</div>
                <p className="dialog-description">
                  Do you want to allow the USB accessory to connect to this device and your data?
                </p>
              </div>
              <div className="dialog-footer">
                <button className="btn btn-outline" data-sp-dismiss type="button">Don&apos;t allow</button>
                <button className="btn" data-sp-dismiss type="button">Allow</button>
              </div>
            </div>
          </dialog>
          <div className="btn-group ms-auto">
            <button className="btn btn-outline" type="button">Button Group</button>
            <button className="btn btn-outline btn-icon" type="button" id="landing-quick-actions" aria-label="Open quick actions">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
          </div>
          <div className="dropdown w-40" data-sp-toggle="#landing-quick-actions" data-sp-placement="top-end">
            <div className="dropdown-label">Quick Actions</div>
            <button className="dropdown-item" type="button">Mute Conversation</button>
            <button className="dropdown-item" type="button">Mark as Read</button>
            <button className="dropdown-item" type="button">Block User</button>
            <div className="dropdown-separator"></div>
            <button className="dropdown-item dropdown-item-destructive" type="button">Delete Conversation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const sidebarSections = [
  {
    label: "Planning",
    placement: "xl:col-start-1 xl:row-start-1",
    items: [
      { label: "Documents", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg> },
      { label: "Budget", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg> },
      { label: "Reports", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> },
      { label: "Goals", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
      { label: "Calendar", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg> },
    ],
  },
  {
    label: "Overview",
    placement: "xl:col-start-1 xl:row-start-2",
    items: [
      { label: "Analytics", active: true, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg> },
      { label: "Transactions", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg> },
      { label: "Investments", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg> },
      { label: "Accounts", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg> },
      { label: "Spending", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/></svg> },
    ],
  },
  {
    label: "Support",
    placement: "xl:col-start-2 xl:row-start-1",
    items: [
      { label: "Help Center", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg> },
      { label: "Docs", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg> },
      { label: "Contact Us", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg> },
      { label: "Status", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg> },
      { label: "Community", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> },
    ],
  },
  {
    label: "Account",
    placement: "xl:col-start-2 xl:row-start-2",
    items: [
      { label: "Profile", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { label: "Billing", active: true, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> },
      { label: "Notifications", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg> },
      { label: "Security", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg> },
      { label: "Appearance", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg> },
    ],
  },
];

function SidebarNav() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 xl:gap-6">
      {sidebarSections.map((section) => (
        <div key={section.label} className={`card w-full overflow-hidden rounded-3xl py-0 ${section.placement}`}>
          <div className="sidebar-content gap-0 overflow-hidden">
            <div className="sidebar-group">
              <span className="sidebar-group-label">{section.label}</span>
              <nav className="sidebar-menu gap-1">
                {section.items.map((item) => (
                  <div key={item.label} className="sidebar-menu-item">
                    <button className={`sidebar-menu-button${item.active ? " active" : ""}`} type="button">
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonRails() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-12 z-10 hidden min-[2200px]:block [&_.skeleton:nth-child(even)]:hidden"
    >
      <div className="absolute top-0 left-[calc(50%-950px-var(--rail-width)-var(--gap))] grid w-(--rail-width) grid-cols-[repeat(2,var(--rail-column))] gap-(--gap) opacity-50 [--rail-column:20rem] [--rail-width:calc(var(--rail-column)*2+var(--gap))]">
        <div className="flex flex-col gap-(--gap)">
          <SkeletonContributionHistory />
          <SkeletonClaimableBalance />
          <SkeletonDividendIncome />
          <SkeletonPayoutThreshold />
        </div>
        <div className="flex flex-col gap-(--gap)">
          <SkeletonUiElements />
          <SkeletonSavingsTargets />
          <SkeletonNewMilestone />
          <SkeletonPayoutThreshold />
          <SkeletonAccountAccess />
        </div>
      </div>
      <div className="absolute top-0 right-[calc(50%-950px-var(--rail-width)-var(--gap))] grid w-(--rail-width) grid-cols-[repeat(2,var(--rail-column))] gap-(--gap) opacity-50 [--rail-column:20rem] [--rail-width:calc(var(--rail-column)*2+var(--gap))]">
        <div className="flex flex-col gap-(--gap)">
          <SkeletonNewMilestone />
          <SkeletonPayoutThreshold />
          <SkeletonAccountAccess />
          <SkeletonQrConnect />
          <SkeletonTransferFunds />
          <SkeletonPayments />
          <SkeletonEmptyDistributeTrack />
        </div>
        <div className="flex flex-col gap-(--gap)">
          <SkeletonQrConnect />
          <SkeletonTransferFunds />
          <SkeletonPayments />
          <SkeletonEmptyDistributeTrack />
          <SkeletonAnalytics />
          <SkeletonNotificationSettings />
          <SkeletonPowerUsage />
        </div>
      </div>
    </div>
  );
}

export function LandingCards() {
  return (
    <div
      id="landing-cards"
      className="relative flex w-full max-w-none flex-col gap-(--gap) overflow-hidden bg-muted p-12 pb-0! [--gap:--spacing(8)] min-[1900px]:p-12 min-[1900px]:[--gap:--spacing(10)]! lg:p-6 lg:[--gap:--spacing(6)] dark:bg-background"
    >
      <SkeletonRails />
      <div className="relative z-10 mx-auto grid gap-(--gap) **:[.card]:w-full **:[.card]:max-w-none min-[1400px]:grid-cols-4! min-[1900px]:grid-cols-5! md:max-w-3xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3 xl:max-w-400 2xl:max-w-475">
        <div className="flex flex-col items-start gap-(--gap)">
          <UiElements />
          <SidebarNav />
          <SavingsTargets />
        </div>
        <div className="hidden flex-col gap-(--gap) lg:flex">
          <ContributionHistory />
          <ClaimableBalance />
          <DividendIncome />
        </div>
        <div className="hidden flex-col gap-(--gap) min-[1400px]:flex">
          <NewMilestone />
          <PayoutThreshold />
          <AccountAccess />
        </div>
        <div className="hidden flex-col gap-(--gap) md:flex">
          <QrConnect />
          <Chat />
          <Payments />
        </div>
        <div className="hidden flex-col gap-(--gap) min-[1900px]:flex">
          <DistributeTrack />
          <Analytics />
          <NotificationSettings />
          <PowerUsage />
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 z-1 h-120 bg-linear-to-b from-background via-muted to-transparent dark:hidden" />
      <div className="absolute inset-x-0 bottom-0 z-20 h-48 bg-linear-to-t from-background via-muted/80 to-transparent lg:h-80 xl:h-64 dark:via-background/80" />
    </div>
  );
}
