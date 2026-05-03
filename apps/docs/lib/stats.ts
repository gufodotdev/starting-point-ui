export function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

export async function getGithubStars(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/gufodotdev/starting-point-ui",
      { cache: "force-cache" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return data.stargazers_count && data.stargazers_count > 0
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export async function getNpmDownloads(): Promise<number | null> {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 540 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  try {
    const res = await fetch(
      `https://api.npmjs.org/downloads/range/${start}:${end}/starting-point-ui`,
      { cache: "force-cache" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      downloads?: { downloads: number; day: string }[];
    };
    if (!data.downloads) return null;
    const total = data.downloads.reduce((sum, d) => sum + d.downloads, 0);
    return total > 0 ? total : null;
  } catch {
    return null;
  }
}
