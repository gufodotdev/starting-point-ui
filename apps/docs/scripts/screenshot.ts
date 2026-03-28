import puppeteer from "puppeteer";
import sharp from "sharp";
import { readFile, mkdir } from "fs/promises";
import { join } from "path";

const SOURCE_DIR = join(process.cwd(), ".source");
const OUTPUT_DIR = join(process.cwd(), "public/screenshots");
const OUTPUT_WIDTH = 640;
const BASE_URL = "http://localhost:3000";

const VIEWPORT_WIDTHS: Record<string, number> = {
  components: 1024,
};

type VariantData = { variant: number; html: string; presetClasses: string };
type CategoryData = { category: string; variants: VariantData[] };
type TypeData = { type: string; categories: CategoryData[] };

type Target = {
  type: string;
  category: string;
  variant: number;
};

function resolveTargets(types: TypeData[], filterType?: string, filterCategory?: string, filterVariant?: string): Target[] {
  const targets: Target[] = [];
  for (const t of types) {
    if (t.type === "docs") continue;
    if (filterType && t.type !== filterType) continue;
    for (const c of t.categories) {
      if (filterCategory && c.category !== filterCategory) continue;
      for (const v of c.variants) {
        if (filterVariant && v.variant !== Number(filterVariant)) continue;
        targets.push({ type: t.type, category: c.category, variant: v.variant });
      }
    }
  }
  return targets;
}

async function run() {
  const [filterType, filterCategory, filterVariant] = process.argv.slice(2);

  const { types } = JSON.parse(await readFile(join(SOURCE_DIR, "examples.json"), "utf-8")) as { types: TypeData[] };
  const targets = resolveTargets(types, filterType, filterCategory, filterVariant);

  if (targets.length === 0) {
    console.error("No examples found.");
    process.exit(1);
  }

  console.log(`\nCapturing ${targets.length} example(s)...\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });

  for (const target of targets) {
    const viewportWidth = VIEWPORT_WIDTHS[target.type] ?? 1440;
    const baseKey = `${target.type}-${target.category}-${target.variant}`;

    console.log(`  ${target.type}/${target.category}/${target.variant} (${viewportWidth}px)`);

    const page = await browser.newPage();
    const url = `${BASE_URL}/view/${target.type}/${target.category}/${target.variant}`;

    await page.setViewport({ width: viewportWidth, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2" });

    // Blur any focused element
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur?.());

    for (const theme of ["light", "dark"] as const) {
      await page.evaluate((isDark) => document.documentElement.classList.toggle("dark", isDark), theme === "dark");
      await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));

      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      await page.setViewport({ width: viewportWidth, height: bodyHeight, deviceScaleFactor: 1 });

      const buffer = await page.screenshot({ type: "webp", quality: 90, fullPage: true });
      const outputPath = join(OUTPUT_DIR, `${baseKey}-${theme}.webp`);
      await sharp(buffer).resize({ width: OUTPUT_WIDTH }).webp({ quality: 90 }).toFile(outputPath);
      console.log(`    ✓ ${theme}`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`\n✅ Done.`);
}

run().catch(console.error);
