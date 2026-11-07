import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = `<div lang="en-US">${markup}</div>`;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, html);
}

const settle = (page: Page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

const SVG = `class="chart-svg" style="display:block;width:600px;height:300px"`;
const data = (rows: unknown) => `data-sp-value='${JSON.stringify(rows)}'`;

const VISITORS = [
  { date: "2026-10-16", visitors: 180 },
  { date: "2026-10-17", visitors: 234 },
  { date: "2026-10-18", visitors: 267 },
  { date: "2026-10-19", visitors: 199 },
];

const AXES = `
  <g class="chart-axis" data-sp-axis="x" data-sp-field="date"><text class="chart-axis-tick"></text></g>
  <g class="chart-axis" data-sp-axis="y"><line class="chart-axis-grid"></line><text class="chart-axis-tick"></text></g>`;

const LINE = `
  <div id="chart" class="chart" ${data(VISITORS)}>
    <svg ${SVG} aria-label="Visitors per day">
      <path class="chart-line" data-sp-field="visitors" aria-label="Visitors"></path>
      <circle class="chart-point" data-sp-field="visitors"></circle>${AXES}
      <line class="chart-cursor"></line>
    </svg>
    <div class="chart-tooltip">
      <div class="chart-tooltip-heading chart-value" data-sp-field="date"></div>
      <div class="chart-tooltip-item">Visitors <span id="value" class="chart-value" data-sp-field="visitors"></span></div>
    </div>
  </div>`;

const MONTHS = [
  { month: "Jan", a: 10, b: 5 },
  { month: "Feb", a: 20, b: 10 },
  { month: "Mar", a: 30, b: 15 },
];

const ticks = (page: Page, axis: "x" | "y") =>
  page.locator(`.chart-axis[data-sp-axis="${axis}"] g[data-sp-clone] > .chart-axis-tick`).allTextContents();

const boxes = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const b = (el as SVGGraphicsElement).getBBox();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    }),
  );

const hoverAt = async (page: Page, fx: number, fy = 0.5) => {
  const box = (await page.locator(".chart-svg").first().boundingBox())!;
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
};

test.describe("drawing", () => {
  test("a line is one path through every row, with a point per row", async ({ page }) => {
    await mount(page, LINE);
    const d = await page.locator("g[data-sp-clone] > .chart-line").getAttribute("d");
    expect(d).toMatch(/^M/);
    const points = await boxes(page, "g[data-sp-clone] > .chart-point");
    expect(points).toHaveLength(4);
    expect(points.map((p) => p.x)).toEqual([...points.map((p) => p.x)].sort((a, b) => a - b));
  });

  test("a plain array of numbers plots as the value field", async ({ page }) => {
    await mount(page, `<div class="chart" data-sp-value="[1, 3, 2]"><svg ${SVG}><circle class="chart-point"></circle></svg></div>`);
    await expect(page.locator("g[data-sp-clone] > .chart-point")).toHaveCount(3);
  });

  test("the value axis starts at zero and ends on the first tick past the maximum", async ({ page }) => {
    await mount(page, LINE);
    const values = (await ticks(page, "y")).map((l) => Number(l.replace(/,/g, "")));
    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBeGreaterThanOrEqual(267);
    expect(values.at(-2)).toBeLessThan(267);
    await expect(page.locator("g[data-sp-clone] > .chart-axis-grid")).toHaveCount(values.length);
  });

  test("explicit tick values, format, prefix and suffix", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(VISITORS)}>
        <svg ${SVG}>
          <path class="chart-line" data-sp-field="visitors"></path>
          <g class="chart-axis" data-sp-axis="y" data-sp-tick-values="[0, 150, 300]" data-sp-tick-prefix="~" data-sp-tick-suffix=" visits" data-sp-format='{"minimumFractionDigits":1}'>
            <text class="chart-axis-tick"></text>
          </g>
        </svg>
      </div>`);
    expect(await ticks(page, "y")).toEqual(["~0.0 visits", "~150.0 visits", "~300.0 visits"]);
  });

  test("a time axis labels days for daily data", async ({ page }) => {
    await mount(page, LINE);
    const labels = await ticks(page, "x");
    expect(labels[0]).toBe("Oct 16");
    expect(labels.every((l) => /^Oct \d+$/.test(l))).toBe(true);
  });

  test("a time axis counts back from the newest date in even steps", async ({ page }) => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ date: `2024-04-${String(i + 1).padStart(2, "0")}`, v: i }));
    await mount(page, `
      <div class="chart" ${data(rows)}>
        <svg ${SVG}>
          <path class="chart-line" data-sp-field="v"></path>
          <g class="chart-axis" data-sp-axis="x" data-sp-field="date"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    const labels = await ticks(page, "x");
    expect(labels.at(-1)).toBe("Apr 30");
    const days = labels.map((l) => Number(l.replace("Apr ", "")));
    const steps = days.slice(1).map((d, i) => d - days[i]);
    expect(new Set(steps).size).toBe(1);
  });

  test("a year of daily data names years and months, with precise ends", async ({ page }) => {
    const rows = Array.from({ length: 365 }, (_, i) => {
      const d = new Date(2025, 10, 1 + i);
      return { date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, v: i };
    });
    await mount(page, `
      <div class="chart" ${data(rows)}>
        <svg class="chart-svg" style="display:block;width:1000px;height:300px">
          <path class="chart-line" data-sp-field="v"></path>
          <g class="chart-axis" data-sp-axis="x" data-sp-field="date"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    const labels = await ticks(page, "x");
    expect(labels[0]).toBe("Nov 2025");
    expect(labels.at(-1)).toBe("Oct 31, 2026");
    expect(labels).toContain("2026");
    expect(labels).toContain("Feb");
  });

  test("time labels keep a gap and no tick crowds an end", async ({ page }) => {
    const rows = Array.from({ length: 16 }, (_, i) => ({ date: `2026-10-${String(16 + i).padStart(2, "0")}`, v: i }));
    for (const width of [790, 600, 420]) {
      await mount(page, `
        <div class="chart" ${data(rows)}>
          <svg class="chart-svg" style="display:block;width:${width}px;height:240px">
            <path class="chart-line" data-sp-field="v"></path>
            <g class="chart-axis" data-sp-axis="x" data-sp-field="date"><text class="chart-axis-tick"></text></g>
          </svg>
        </div>`);
      const labels = await ticks(page, "x");
      const boxes = await page.locator('.chart-axis[data-sp-axis="x"] g[data-sp-clone] > .chart-axis-tick').evaluateAll((els) => els.map((el) => (el as SVGGraphicsElement).getBBox()).map((b) => [b.x, b.x + b.width]));
      for (let i = 1; i < boxes.length; i++) expect(boxes[i][0] - boxes[i - 1][1]).toBeGreaterThanOrEqual(11.5);
      expect(boxes[0][0]).toBeGreaterThanOrEqual(-0.5);
      expect(boxes.at(-1)![1]).toBeLessThanOrEqual(width + 0.5);
      expect(labels.at(-1)).toBe("Oct 31");
      if (labels.length > 2) expect(labels.at(-2)).not.toBe("Oct 30");
    }
  });

  test.describe("in Stockholm, where clocks go back on October 25, 2026", () => {
    test.use({ timezoneId: "Europe/Stockholm" });
    test("dates sit evenly apart across a daylight saving change", async ({ page }) => {
      const rows = Array.from({ length: 16 }, (_, i) => ({ date: `2026-10-${String(16 + i).padStart(2, "0")}`, v: i }));
      await mount(page, `
        <div class="chart" ${data(rows)}>
          <svg ${SVG}><circle class="chart-point" data-sp-field="v"></circle></svg>
        </div>`);
      const xs = (await boxes(page, "g[data-sp-clone] > .chart-point")).map((b) => b.x);
      const steps = xs.slice(1).map((x, i) => x - xs[i]);
      for (const step of steps) expect(step).toBeCloseTo(steps[0], 1);
    });
  });

  test("monthly data labels the first month when a later month's label is wider", async ({ page }) => {
    const rows = ["01", "02", "03", "04", "05", "06"].map((m, i) => ({ month: `2024-${m}-01`, v: i }));
    await mount(page, `
      <div class="chart" ${data(rows)}>
        <svg ${SVG}>
          <path class="chart-area" data-sp-field="v"></path>
          <g class="chart-axis" data-sp-axis="x" data-sp-field="month" data-sp-format='{"month":"short"}'><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    expect(await ticks(page, "x")).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
  });

  test("a tick count of 2 shows just the first and last label", async ({ page }) => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ date: `2024-04-${String(i + 1).padStart(2, "0")}`, v: i }));
    const axis = (field: string) => `<g class="chart-axis" data-sp-axis="x" data-sp-field="${field}" data-sp-tick-count="2"><text class="chart-axis-tick"></text></g>`;
    await mount(page, `<div class="chart" ${data(rows)}><svg ${SVG}><path class="chart-line" data-sp-field="v"></path>${axis("date")}</svg></div>`);
    expect(await ticks(page, "x")).toEqual(["Apr 1", "Apr 30"]);
    const [line] = await boxes(page, "g[data-sp-clone] > .chart-line");
    expect(line.x).toBeLessThan(0.5);
    expect(line.x + line.width).toBeGreaterThan(599.5);
    const labels = await boxes(page, '.chart-axis[data-sp-axis="x"] g[data-sp-clone] > .chart-axis-tick');
    expect(labels[0].x).toBeCloseTo(0, 0);
    expect(labels[1].x + labels[1].width).toBeCloseTo(600, 0);
    await mount(page, `<div class="chart" ${data(MONTHS)}><svg ${SVG}><path class="chart-bar" data-sp-field="a"></path>${axis("month")}</svg></div>`);
    expect(await ticks(page, "x")).toEqual(["Jan", "Mar"]);
  });

  test("a tick count picks the closest time interval", async ({ page }) => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ date: `2024-04-${String(i + 1).padStart(2, "0")}`, v: i }));
    await mount(page, `
      <div class="chart" ${data(rows)}>
        <svg ${SVG}>
          <path class="chart-line" data-sp-field="v"></path>
          <g class="chart-axis" data-sp-axis="x" data-sp-field="date" data-sp-tick-count="4"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    expect((await ticks(page, "x")).length).toBeGreaterThanOrEqual(4);
  });

  test("bar labels center under their bars, with the plot pulled in for the last one", async ({ page }) => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ date: `2024-06-${String(i + 1).padStart(2, "0")}`, v: i }));
    for (const width of [300, 420, 560, 620]) {
      await mount(page, `
        <div class="chart" ${data(rows)}>
          <svg class="chart-svg" style="display:block;width:${width}px;height:200px">
            <path class="chart-bar" data-sp-field="v"></path>
            <g class="chart-axis" data-sp-axis="x" data-sp-field="date" data-sp-format='{"month":"short","day":"numeric"}'><text class="chart-axis-tick"></text></g>
          </svg>
        </div>`);
      const labels = (await boxes(page, '.chart-axis[data-sp-axis="x"] g[data-sp-clone] > .chart-axis-tick')).sort((a, b) => a.x - b.x);
      expect((await ticks(page, "x")).at(-1)).toBe("Jun 30");
      for (let k = 1; k < labels.length; k++) expect(labels[k].x - (labels[k - 1].x + labels[k - 1].width)).toBeGreaterThanOrEqual(11.5);
      const last = (await boxes(page, "g[data-sp-clone] > .chart-bar")).at(-1)!;
      expect(labels.at(-1)!.x + labels.at(-1)!.width / 2).toBeCloseTo(last.x + last.width / 2, 0);
      expect(labels.at(-1)!.x + labels.at(-1)!.width).toBeLessThanOrEqual(width + 0.5);
    }
  });

  test("category labels thin out to the tick count", async ({ page }) => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ m: `M${i + 1}`, v: i }));
    await mount(page, `
      <div class="chart" ${data(rows)}>
        <svg ${SVG}>
          <path class="chart-bar" data-sp-field="v"></path>
          <g class="chart-axis" data-sp-axis="x" data-sp-field="m" data-sp-tick-count="4"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    expect(await ticks(page, "x")).toEqual(["M3", "M6", "M9", "M12"]);
  });

  test("labels at the ends of the x axis stay inside the chart", async ({ page }) => {
    await mount(page, LINE);
    const labels = await boxes(page, '.chart-axis[data-sp-axis="x"] g[data-sp-clone] > .chart-axis-tick');
    expect(labels[0].x).toBeGreaterThanOrEqual(0);
    expect(labels.at(-1)!.x + labels.at(-1)!.width).toBeLessThanOrEqual(600.5);
  });

  test("the grid ends where a line pulled in for its end labels ends", async ({ page }) => {
    await mount(page, LINE);
    const [line] = await boxes(page, "g[data-sp-clone] > .chart-line");
    const grid = await boxes(page, '.chart-axis[data-sp-axis="y"] g[data-sp-clone] > .chart-axis-grid');
    expect(line.x + line.width).toBeLessThan(599);
    for (const g of grid) expect(g.x + g.width).toBeCloseTo(line.x + line.width, 0);
  });

  test("with no gutter the widest value label starts at the chart's edge", async ({ page }) => {
    await mount(page, LINE);
    const labels = await boxes(page, '.chart-axis[data-sp-axis="y"] g[data-sp-clone] > .chart-axis-tick');
    expect(Math.min(...labels.map((l) => l.x))).toBeLessThan(1);
  });

  test("without a value axis a line spans its own range, while bars keep zero", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-value="[100, 120, 110]"><svg ${SVG}><circle class="chart-point"></circle></svg></div>
      <div class="chart" data-sp-value="[100, 120, 110]"><svg ${SVG}><path class="chart-bar bar"></path></svg></div>`);
    const points = await boxes(page, "g[data-sp-clone] > .chart-point");
    const ys = points.map((p) => p.y + p.height / 2);
    expect(Math.max(...ys)).toBeCloseTo(300, 0);
    expect(Math.min(...ys)).toBeCloseTo(0, 0);
    const bars = await boxes(page, "g[data-sp-clone] > .chart-bar");
    for (const bar of bars) expect(bar.height).toBeGreaterThan(200);
  });

  test("the gutter takes one to four values like CSS padding", async ({ page }) => {
    await mount(page, `<div class="chart" data-sp-value="[1, 3, 2]"><svg class="chart-svg" style="display:block;width:600px;height:300px" data-sp-gutter="10 0 0"><path class="chart-area"></path></svg></div>`);
    const [area] = await boxes(page, "g[data-sp-clone] > .chart-area");
    expect(area.y).toBeCloseTo(10, 0);
    expect(area.y + area.height).toBeCloseTo(300, 0);
    expect(area.x).toBeCloseTo(0, 0);
    expect(area.x + area.width).toBeCloseTo(600, 0);
  });

  test("a y axis at the end sits on the right", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <path class="chart-bar" data-sp-field="a"></path>
          <g class="chart-axis" data-sp-axis="y" data-sp-position="end"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    const labels = await boxes(page, '.chart-axis[data-sp-axis="y"] g[data-sp-clone] > .chart-axis-tick');
    const bars = await boxes(page, "g[data-sp-clone] > .chart-bar");
    const barsEnd = Math.max(...bars.map((b) => b.x + b.width));
    for (const label of labels) expect(label.x).toBeGreaterThan(barsEnd);
    expect(Math.max(...labels.map((l) => l.x + l.width))).toBeCloseTo(600, 0);
  });

  test("grid lines on the x axis run down from each label, and the axis line and marks follow the edge", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <path class="chart-bar" data-sp-field="a"></path>
          <g class="chart-axis" data-sp-axis="x" data-sp-field="month">
            <line class="chart-axis-grid"></line><line class="chart-axis-line"></line><line class="chart-axis-mark"></line><text class="chart-axis-tick"></text>
          </g>
        </svg>
      </div>`);
    const grid = page.locator("g[data-sp-clone] > .chart-axis-grid");
    await expect(grid).toHaveCount(3);
    const lines = await grid.evaluateAll((els) => els.map((el) => ["x1", "x2", "y1", "y2"].map((a) => Number(el.getAttribute(a)))));
    for (const [x1, x2, y1, y2] of lines) {
      expect(x1).toBe(x2);
      expect(y1).toBe(0);
      expect(y2).toBeGreaterThan(y1);
    }
    await expect(page.locator("g[data-sp-clone] > .chart-axis-mark")).toHaveCount(3);
    const [axis] = await page.locator("g[data-sp-clone] > .chart-axis-line").evaluateAll((els) => els.map((el) => [el.getAttribute("x1"), el.getAttribute("x2")]));
    expect(axis).toEqual(["0", "600"]);
  });

  test("a bar takes its width in pixels and its radius from data attributes", async ({ page }) => {
    await mount(page, `<div class="chart" data-sp-value="[1, 2]"><svg ${SVG}><path class="chart-bar" data-sp-width="10" data-sp-radius="0"></path></svg></div>`);
    const bars = await boxes(page, "g[data-sp-clone] > .chart-bar");
    for (const bar of bars) expect(bar.width).toBeCloseTo(10, 1);
    const d = await page.locator("g[data-sp-clone] > .chart-bar").first().getAttribute("d");
    expect(d).not.toContain("A");
  });

  test("a fixed tick end sets the top of the value axis", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-value="[10, 20]">
        <svg ${SVG}>
          <path class="chart-bar"></path>
          <g class="chart-axis" data-sp-axis="y" data-sp-tick-end="50"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    expect((await ticks(page, "y")).at(-1)).toBe("50");
    const bars = await boxes(page, "g[data-sp-clone] > .chart-bar");
    expect(bars[1].height / bars[0].height).toBeCloseTo(2, 1);
    expect(bars[1].height).toBeLessThan(300 * 0.45);
  });

  test("the locale formats labels and values", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-locale="de-DE" data-sp-value="[1234.5, 2000]">
        <svg ${SVG}><path class="chart-line"></path><g class="chart-axis" data-sp-axis="y" data-sp-tick-values="[1500]"><text class="chart-axis-tick"></text></g></svg>
        <span id="locale-value" class="chart-value"></span>
      </div>`);
    expect(await ticks(page, "y")).toEqual(["1.500"]);
    await expect(page.locator("#locale-value")).toHaveText("2.000");
  });

  test("a gap in the data breaks the line", async ({ page }) => {
    await mount(page, `<div class="chart" data-sp-value="[1, 2, null, 3, 4]"><svg ${SVG}><path class="chart-line"></path></svg></div>`);
    const d = await page.locator("g[data-sp-clone] > .chart-line").getAttribute("d");
    expect(d!.match(/M/g)).toHaveLength(2);
  });

  test("stacked bars sit on top of each other", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <g class="chart-stack">
            <path class="chart-bar first" data-sp-field="a"></path>
            <path class="chart-bar second" data-sp-field="b"></path>
          </g>
        </svg>
      </div>`);
    const [first, second] = [await boxes(page, "g[data-sp-clone] > .chart-bar.first"), await boxes(page, "g[data-sp-clone] > .chart-bar.second")];
    for (let i = 0; i < 3; i++) {
      expect(second[i].x).toBeCloseTo(first[i].x, 1);
      expect(second[i].y + second[i].height).toBeCloseTo(first[i].y, 1);
    }
  });

  test("stacked areas close along the top of the area below", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <g class="chart-stack">
            <path class="chart-area first" data-sp-field="a" data-sp-curve="none"></path>
            <path class="chart-area second" data-sp-field="b" data-sp-curve="none"></path>
          </g>
          <circle class="chart-point" data-sp-field="a"></circle>
        </svg>
      </div>`);
    const [first, second] = [await boxes(page, "g[data-sp-clone] > .chart-area.first"), await boxes(page, "g[data-sp-clone] > .chart-area.second")];
    expect(second[0].y + second[0].height).toBeGreaterThan(first[0].y);
    const top = await page.locator("g[data-sp-clone] > .chart-area.first").getAttribute("d");
    const join = await page.locator("g[data-sp-clone] > .chart-area.second").getAttribute("d");
    const firstTop = top!.split("L").slice(0, 3).map((p) => p.replace(/[MZ]/g, "").trim());
    for (const point of firstTop) expect(join).toContain(point);
  });

  test("an area and its line in a stack share one layer", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <g class="chart-stack">
            <path class="chart-area" data-sp-field="a"></path>
            <path class="chart-line" data-sp-field="a"></path>
            <path class="chart-area" data-sp-field="b"></path>
          </g>
          <g class="chart-axis" data-sp-axis="y"><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    expect((await ticks(page, "y")).at(-1)).toBe("50");
  });

  test("an expanded stack fills every row from 0 to 1", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <g class="chart-stack" data-sp-offset="expand">
            <path class="chart-area" data-sp-field="a"></path>
            <path class="chart-area" data-sp-field="b"></path>
          </g>
          <g class="chart-axis" data-sp-axis="y" data-sp-format='{"style":"percent"}'><text class="chart-axis-tick"></text></g>
        </svg>
      </div>`);
    expect((await ticks(page, "y")).at(-1)).toBe("100%");
  });

  test("grouped bars sit side by side", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <g class="chart-group">
            <path class="chart-bar first" data-sp-field="a"></path>
            <path class="chart-bar second" data-sp-field="b"></path>
          </g>
        </svg>
      </div>`);
    const [first, second] = [await boxes(page, "g[data-sp-clone] > .chart-bar.first"), await boxes(page, "g[data-sp-clone] > .chart-bar.second")];
    for (let i = 0; i < 3; i++) expect(second[i].x).toBeGreaterThan(first[i].x + first[i].width - 0.5);
  });

  test("horizontal bars run along x, one row below the other", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-horizontal ${data(MONTHS)}>
        <svg ${SVG}><path class="chart-bar" data-sp-field="a"></path></svg>
      </div>`);
    const bars = await boxes(page, "g[data-sp-clone] > .chart-bar");
    expect(bars[1].width).toBeCloseTo(bars[0].width * 2, 0);
    expect(bars[1].y).toBeGreaterThan(bars[0].y);
  });

  test("the zero line shows only when values go below zero", async ({ page }) => {
    const chart = (values: number[]) => `
      <div class="chart" data-sp-value="${JSON.stringify(values)}">
        <svg ${SVG}><path class="chart-bar"></path><line class="chart-zero-line"></line></svg>
      </div>`;
    await mount(page, chart([1, 2, 3]));
    await expect(page.locator("g[data-sp-clone] > .chart-zero-line")).toHaveCount(0);
    await mount(page, chart([1, -2, 3]));
    await expect(page.locator("g[data-sp-clone] > .chart-zero-line")).toHaveCount(1);
  });

  test("a pie draws a slice per positive row, colored from the chart tokens or the row", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data([
        { label: "A", value: 50 },
        { label: "B", value: 0 },
        { label: "C", value: 30, color: "red" },
        { label: "D", value: 20 },
      ])}>
        <svg ${SVG}><path class="chart-pie" data-sp-label-field="label" data-sp-inner-radius="60%"></path></svg>
      </div>`);
    const colors = await page.locator("g[data-sp-clone] > .chart-pie").evaluateAll((els) => els.map((el) => (el as SVGElement).style.getPropertyValue("--sp-chart-color")));
    expect(colors).toEqual(["var(--chart-1)", "red", "var(--chart-4)"]);
  });

  test("a pie with axes warns and draws nothing", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (m) => m.type() === "warning" && warnings.push(m.text()));
    await mount(page, `
      <div class="chart" data-sp-value="[1, 2]">
        <svg ${SVG}><path class="chart-pie"></path><g class="chart-axis" data-sp-axis="y"><text class="chart-axis-tick"></text></g></svg>
      </div>`);
    await expect(page.locator("g[data-sp-clone] > .chart-pie")).toHaveCount(0);
    expect(warnings.some((w) => w.includes("pie"))).toBe(true);
  });
});

test.describe("hover", () => {
  test("the pointer moves the cursor, fills the values and shows the tooltip", async ({ page }) => {
    await mount(page, LINE);
    await hoverAt(page, 0.99);
    await expect(page.locator(".chart-tooltip")).toHaveClass(/shown/);
    await expect(page.locator("#value")).toHaveText("199");
    await expect(page.locator(".chart-tooltip-heading")).toHaveText("2026-10-19");
    await expect(page.locator("g[data-sp-clone] > .chart-cursor")).toHaveCount(1);
    await expect(page.locator("g[data-sp-clone] > .chart-point").nth(3)).toHaveAttribute("data-active", "");
    await expect(page.locator("g[data-sp-clone] > .chart-point").nth(0)).toHaveAttribute("data-inactive", "");
  });

  test("an area cursor covers the hovered row's band", async ({ page }) => {
    await mount(page, `<div class="chart" ${data(MONTHS)}><svg ${SVG}><path class="chart-bar" data-sp-field="a"></path><rect class="chart-cursor" data-sp-type="area"></rect></svg></div>`);
    await hoverAt(page, 0.5);
    const [cursor] = await boxes(page, "g[data-sp-clone] > .chart-cursor");
    expect(cursor.x).toBeCloseTo(200, 0);
    expect(cursor.width).toBeCloseTo(200, 0);
    expect(cursor.height).toBeCloseTo(300, 0);
  });

  test("leaving hides the tooltip, and values fall back to the last row", async ({ page }) => {
    await mount(page, LINE);
    await hoverAt(page, 0.02);
    await expect(page.locator("#value")).toHaveText("180");
    await page.mouse.move(0, 400);
    await expect(page.locator(".chart-tooltip")).not.toHaveClass(/shown/);
    await expect(page.locator("g[data-sp-clone] > .chart-cursor")).toHaveCount(0);
    await expect(page.locator("#value")).toHaveText("199");
  });

  test("a fallback replaces the value while nothing is hovered", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-value="[1, 2]">
        <svg ${SVG}><path class="chart-line"></path></svg>
        <span id="value" class="chart-value" data-sp-fallback="n/a"></span>
      </div>`);
    await expect(page.locator("#value")).toHaveText("n/a");
  });

  test("hovering a slice marks it active and hands its color to the chart", async ({ page }) => {
    await mount(page, `
      <div id="chart" class="chart" data-sp-value="[1, 1]">
        <svg ${SVG}><path class="chart-pie"></path></svg>
      </div>`);
    await hoverAt(page, 0.6, 0.5);
    await expect(page.locator("g[data-sp-clone] > .chart-pie").nth(0)).toHaveAttribute("data-active", "");
    await expect(page.locator("g[data-sp-clone] > .chart-pie").nth(1)).toHaveAttribute("data-inactive", "");
    const color = await page.locator("#chart").evaluate((el) => el.style.getPropertyValue("--sp-chart-color"));
    expect(color).toBe("var(--chart-1)");
  });
});

test.describe("data", () => {
  test("changing data-sp-value draws the new data", async ({ page }) => {
    await mount(page, LINE);
    await page.locator("#chart").evaluate((el) => el.setAttribute("data-sp-value", JSON.stringify([{ date: "2026-10-16", visitors: 1200 }, { date: "2026-10-17", visitors: 1300 }])));
    await settle(page);
    await expect(page.locator("g[data-sp-clone] > .chart-point")).toHaveCount(2);
    const values = (await ticks(page, "y")).map((l) => Number(l.replace(/,/g, "")));
    expect(values.at(-1)).toBeGreaterThanOrEqual(1300);
    expect(values.at(-2)).toBeLessThan(1300);
  });

  test("setValue replaces the data from JavaScript", async ({ page }) => {
    await mount(page, LINE);
    await page.evaluate(() => window.sp.chart(document.getElementById("chart")!)!.setValue([{ date: "2026-10-16", visitors: 5 }]));
    await expect(page.locator("g[data-sp-clone] > .chart-point")).toHaveCount(1);
  });
});

test.describe("right to left", () => {
  test("a vertical chart starts on the right with its value axis on the right", async ({ page }) => {
    await mount(page, `<div dir="rtl">${LINE}</div>`);
    const points = await boxes(page, "g[data-sp-clone] > .chart-point");
    expect(points[0].x).toBeGreaterThan(points[3].x);
    const label = (await boxes(page, '.chart-axis[data-sp-axis="y"] g[data-sp-clone] > .chart-axis-tick'))[0];
    expect(label.x).toBeGreaterThan(points[0].x);
  });

  test("horizontal bars grow to the left", async ({ page }) => {
    await mount(page, `
      <div dir="rtl">
        <div class="chart" data-sp-horizontal ${data(MONTHS)}>
          <svg ${SVG}><path class="chart-bar" data-sp-field="a"></path></svg>
        </div>
      </div>`);
    const bars = await boxes(page, "g[data-sp-clone] > .chart-bar");
    expect(bars[0].x + bars[0].width).toBeCloseTo(bars[2].x + bars[2].width, 0);
    expect(bars[2].x).toBeLessThan(bars[0].x);
  });

  test("switching direction on an ancestor redraws the chart", async ({ page }) => {
    await mount(page, `<div id="wrap">${LINE}</div>`);
    const before = (await boxes(page, "g[data-sp-clone] > .chart-point"))[0].x;
    await page.locator("#wrap").evaluate((el) => el.setAttribute("dir", "rtl"));
    await settle(page);
    expect((await boxes(page, "g[data-sp-clone] > .chart-point"))[0].x).toBeGreaterThan(before);
  });

  test("the arrow keys follow the reading direction", async ({ page }) => {
    await mount(page, `<div dir="rtl">${LINE}</div>`);
    await page.locator(".chart-svg").focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#value")).toHaveText("234");
  });
});

test.describe("accessibility", () => {
  test("the chart is a labelled image followed by a table of its data", async ({ page }) => {
    await mount(page, LINE);
    await expect(page.locator(".chart-svg")).toHaveAttribute("role", "img");
    const table = page.locator("table");
    await expect(table).toHaveAttribute("aria-label", "Visitors per day");
    expect(await table.locator("th").allTextContents()).toEqual(["date", "Visitors"]);
    expect(await table.locator("tbody tr").first().locator("td").allTextContents()).toEqual(["Oct 16, 2026", "180"]);
  });

  test("an interactive chart takes focus and a static one does not", async ({ page }) => {
    await mount(page, `${LINE}<div class="chart" data-sp-value="[1, 2]"><svg id="static" ${SVG}><path class="chart-line"></path></svg></div>`);
    await expect(page.locator("#chart .chart-svg")).toHaveAttribute("tabindex", "0");
    expect(await page.locator("#static").getAttribute("tabindex")).toBe(null);
  });

  test("the arrow keys, Home and End walk the rows and Escape lets go", async ({ page }) => {
    await mount(page, LINE);
    await page.locator(".chart-svg").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#value")).toHaveText("180");
    await expect(page.locator(".chart-tooltip")).toHaveClass(/shown/);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#value")).toHaveText("234");
    await page.keyboard.press("End");
    await expect(page.locator("#value")).toHaveText("199");
    await page.keyboard.press("Home");
    await expect(page.locator("#value")).toHaveText("180");
    await page.keyboard.press("Escape");
    await expect(page.locator(".chart-tooltip")).not.toHaveClass(/shown/);
  });

  test("moving with the keyboard announces the row", async ({ page }) => {
    await mount(page, LINE);
    await page.locator(".chart-svg").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[aria-live]")).toHaveText("2026-10-16 Visitors 180");
  });

  test("blurring the chart lets go of the row", async ({ page }) => {
    await mount(page, `${LINE}<button id="after">After</button>`);
    await page.locator(".chart-svg").focus();
    await page.keyboard.press("ArrowRight");
    await page.locator("#after").focus();
    await expect(page.locator(".chart-tooltip")).not.toHaveClass(/shown/);
  });
});

test.describe("edge cases", () => {
  const D = "g[data-sp-clone] > ";

  test("removing and re-adding a chart draws it once", async ({ page }) => {
    await mount(page, `<div id="wrap">${LINE}</div>`);
    await page.evaluate(async () => {
      const chart = document.getElementById("chart")!;
      chart.remove();
      await new Promise((r) => setTimeout(r, 0));
      document.getElementById("wrap")!.append(chart);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    await expect(page.locator(D + ".chart-point")).toHaveCount(4);
    await expect(page.locator("table")).toHaveCount(1);
  });

  test("a copy of a drawn chart sets itself up from its markup", async ({ page }) => {
    await mount(page, `<div id="wrap">${LINE}</div>`);
    await page.evaluate(async () => {
      const copy = document.getElementById("chart")!.cloneNode(true) as HTMLElement;
      copy.id = "copy";
      document.getElementById("wrap")!.replaceChildren(copy);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    await expect(page.locator(`#copy ${D}.chart-point`)).toHaveCount(4);
    await expect(page.locator("#copy table")).toHaveCount(1);
  });

  test("shrinking the data lets go of a row that no longer exists", async ({ page }) => {
    await mount(page, LINE);
    await hoverAt(page, 0.99);
    await expect(page.locator("#value")).toHaveText("199");
    await page.evaluate(() => window.sp.chart(document.getElementById("chart")!)!.setValue([{ date: "2026-10-16", visitors: 7 }, { date: "2026-10-17", visitors: 8 }]));
    await expect(page.locator("#value")).toHaveText("8");
    expect(await page.locator(D + ".chart-cursor").count()).toBe(0);
  });

  test("a chart without an svg still fills its values", async ({ page }) => {
    await mount(page, `<div id="chart" class="chart" data-sp-value="[1, 2]"><span id="value" class="chart-value"></span></div>`);
    await expect(page.locator("#value")).toHaveText("2");
    await page.locator("#chart").evaluate((el) => el.setAttribute("data-sp-value", "[1, 2, 3]"));
    await expect(page.locator("#value")).toHaveText("3");
    await page.evaluate(() => window.sp.chart(document.getElementById("chart")!)!.setValue([4]));
    await expect(page.locator("#value")).toHaveText("4");
  });

  test("setValue survives a change of orientation", async ({ page }) => {
    await mount(page, LINE);
    await page.evaluate(() => window.sp.chart(document.getElementById("chart")!)!.setValue([{ date: "2026-10-16", visitors: 5 }, { date: "2026-10-17", visitors: 6 }]));
    await page.locator("#chart").evaluate((el) => el.setAttribute("data-sp-horizontal", ""));
    await settle(page);
    await expect(page.locator(D + ".chart-point")).toHaveCount(2);
  });

  test("bars stay inside the plot when the domain leaves out zero", async ({ page }) => {
    const chart = (values: number[], start = "") => `
      <div class="chart" data-sp-value="${JSON.stringify(values)}">
        <svg ${SVG}><path class="chart-bar"></path><g class="chart-axis" data-sp-axis="y"${start}></g></svg>
      </div>`;
    await mount(page, chart([90, 95, 100], ` data-sp-tick-start="min"`));
    for (const bar of await boxes(page, D + ".chart-bar")) expect(bar.y + bar.height).toBeLessThanOrEqual(300);
    await mount(page, chart([-20, -15, -18]));
    for (const bar of await boxes(page, D + ".chart-bar")) expect(bar.y).toBeGreaterThanOrEqual(0);
  });

  test("the value axis ends on a tick at both sides", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-value="[-0.45, 56.5]">
        <svg ${SVG}><path class="chart-line"></path><g class="chart-axis" data-sp-axis="y" data-sp-tick-count="2"><text class="chart-axis-tick"></text></g></svg>
      </div>`);
    expect(await ticks(page, "y")).toEqual(["-100", "0", "100"]);
  });

  test("numeric categories read as written", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data([{ year: 2021, v: 1 }, { year: 2022, v: 2 }])}>
        <svg ${SVG}><path class="chart-bar" data-sp-field="v"></path><g class="chart-axis" data-sp-axis="x" data-sp-field="year"><text class="chart-axis-tick"></text></g></svg>
      </div>`);
    expect(await ticks(page, "x")).toEqual(["2021", "2022"]);
  });

  test("a time scale over timestamps draws a line", async ({ page }) => {
    const start = new Date(2026, 9, 1).getTime();
    await mount(page, `
      <div class="chart" ${data([0, 1, 2].map((i) => ({ t: start + i * 864e5, v: i + 1 })))}>
        <svg ${SVG}><path class="chart-line" data-sp-field="v"></path><g class="chart-axis" data-sp-axis="x" data-sp-field="t" data-sp-scale="time"></g></svg>
      </div>`);
    expect(await page.locator(D + ".chart-line").getAttribute("d")).not.toContain("NaN");
  });

  test("the tooltip sits next to the pointer inside a viewport below other content", async ({ page }) => {
    await mount(page, `
      <div class="chart" style="position:relative" ${data(VISITORS)}>
        <div style="height:120px">Summary</div>
        <div class="chart-viewport" style="position:relative">
          <svg ${SVG}><path class="chart-line" data-sp-field="visitors"></path></svg>
          <div class="chart-tooltip" style="position:absolute">Tip</div>
        </div>
      </div>`);
    await hoverAt(page, 0.5, 0.2);
    const [svg, tip] = [await page.locator(".chart-svg").boundingBox(), await page.locator(".chart-tooltip").boundingBox()];
    expect(Math.abs(tip!.y - (svg!.y + svg!.height * 0.2 + 16))).toBeLessThan(2);
  });

  test("a tap keeps its row until a tap elsewhere", async ({ page }) => {
    await mount(page, `${LINE}<button id="after">After</button>`);
    const box = (await page.locator(".chart-svg").boundingBox())!;
    const at = { clientX: box.x + box.width * 0.99, clientY: box.y + 100, pointerType: "touch", bubbles: true };
    await page.locator(".chart-svg").evaluate((svg, init) => {
      for (const type of ["pointerdown", "pointerup", "pointerleave"]) svg.dispatchEvent(new PointerEvent(type, init));
    }, at);
    await expect(page.locator(".chart-tooltip")).toHaveClass(/shown/);
    await page.locator("#after").dispatchEvent("pointerdown");
    await expect(page.locator(".chart-tooltip")).not.toHaveClass(/shown/);
  });

  test("Escape stays inside the chart", async ({ page }) => {
    await mount(page, LINE);
    await page.evaluate(() => document.addEventListener("keydown", (e) => e.key === "Escape" && document.body.setAttribute("data-escaped", "")));
    await page.locator(".chart-svg").focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    expect(await page.locator("body").getAttribute("data-escaped")).toBe(null);
  });

  test("a chart without a name is decoration", async ({ page }) => {
    await mount(page, `<div class="chart" data-sp-value="[1, 2]"><svg ${SVG}><path class="chart-line"></path><line class="chart-cursor"></line></svg></div>`);
    await expect(page.locator(".chart-svg")).toHaveAttribute("aria-hidden", "true");
    expect(await page.locator(".chart-svg").getAttribute("role")).toBe(null);
    expect(await page.locator(".chart-svg").getAttribute("tabindex")).toBe(null);
    await expect(page.locator("table")).toHaveCount(0);
  });

  test("ArrowDown walks a horizontal chart and a pie, announcing rows without a tooltip", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-horizontal ${data(MONTHS)}>
        <svg id="bars" ${SVG} aria-label="Bars"><path class="chart-bar" data-sp-field="a" aria-label="A"></path><line class="chart-cursor"></line></svg>
      </div>
      <div class="chart" data-sp-value="[3, 1]">
        <svg id="pie" ${SVG} aria-label="Pie"><path class="chart-pie"></path></svg>
        <span id="slice" class="chart-value"></span>
      </div>`);
    await page.locator("#bars").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".chart").first().locator("[aria-live]")).toHaveText("2 20");
    await page.locator("#pie").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#slice")).toHaveText("1");
  });
});

test.describe("labels", () => {
  const D = "g[data-sp-clone] > ";
  const REASONS = [
    { reason: "Too expensive", customers: 14 },
    { reason: "Missing a feature", customers: 11 },
    { reason: "Other", customers: 3 },
  ];

  test("a label sits on top of each vertical bar", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <path class="chart-bar" data-sp-field="a"></path>
          <text class="chart-label" data-sp-field="a" data-sp-suffix=" visits"></text>
        </svg>
      </div>`);
    expect(await page.locator(D + ".chart-label").allTextContents()).toEqual(["10 visits", "20 visits", "30 visits"]);
    const [bars, labels] = [await boxes(page, D + ".chart-bar"), await boxes(page, D + ".chart-label")];
    for (let i = 0; i < 3; i++) {
      expect(labels[i].y + labels[i].height).toBeLessThanOrEqual(bars[i].y);
      expect(Math.abs(labels[i].x + labels[i].width / 2 - (bars[i].x + bars[i].width / 2))).toBeLessThan(1);
    }
  });

  test("a horizontal bar takes its name inside and its count past the end", async ({ page }) => {
    await mount(page, `
      <div class="chart" data-sp-horizontal ${data(REASONS)}>
        <svg ${SVG}>
          <path class="chart-bar" data-sp-field="customers"></path>
          <text class="chart-label name" data-sp-field="customers" data-sp-label-field="reason" data-sp-position="inside-start"></text>
          <text class="chart-label count" data-sp-field="customers"></text>
        </svg>
      </div>`);
    expect(await page.locator(D + ".chart-label.name").allTextContents()).toEqual(["Too expensive", "Missing a feature", "Other"]);
    const [bars, names, counts] = [await boxes(page, D + ".chart-bar"), await boxes(page, D + ".chart-label.name"), await boxes(page, D + ".chart-label.count")];
    for (let i = 0; i < 3; i++) {
      expect(names[i].x).toBeGreaterThan(bars[i].x);
      expect(counts[i].x).toBeGreaterThan(bars[i].x + bars[i].width);
      expect(counts[i].x + counts[i].width).toBeLessThanOrEqual(600);
    }
  });

  test("a label in a stack sits at the end of its layer", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}>
          <g class="chart-stack">
            <path class="chart-bar first" data-sp-field="a"></path>
            <path class="chart-bar second" data-sp-field="b"></path>
            <text class="chart-label" data-sp-field="b" data-sp-position="inside-end"></text>
          </g>
        </svg>
      </div>`);
    const [second, labels] = [await boxes(page, D + ".chart-bar.second"), await boxes(page, D + ".chart-label")];
    for (let i = 0; i < 3; i++) {
      expect(labels[i].y).toBeGreaterThanOrEqual(second[i].y);
      expect(labels[i].y + labels[i].height).toBeLessThanOrEqual(second[i].y + second[i].height + 1);
    }
  });

  test("labels follow the hovered row", async ({ page }) => {
    await mount(page, `
      <div class="chart" ${data(MONTHS)}>
        <svg ${SVG}><path class="chart-bar" data-sp-field="a"></path><text class="chart-label" data-sp-field="a"></text></svg>
      </div>`);
    await hoverAt(page, 0.15);
    await expect(page.locator(D + ".chart-label").nth(0)).toHaveAttribute("data-active", "");
    await expect(page.locator(D + ".chart-label").nth(2)).toHaveAttribute("data-inactive", "");
  });

  test("end labels on horizontal bars sit to the left in right to left", async ({ page }) => {
    await mount(page, `
      <div dir="rtl">
        <div class="chart" data-sp-horizontal ${data(REASONS)}>
          <svg ${SVG}><path class="chart-bar" data-sp-field="customers"></path><text class="chart-label" data-sp-field="customers"></text></svg>
        </div>
      </div>`);
    const [bars, labels] = [await boxes(page, D + ".chart-bar"), await boxes(page, D + ".chart-label")];
    for (let i = 0; i < 3; i++) {
      expect(labels[i].x + labels[i].width).toBeLessThan(bars[i].x);
      expect(labels[i].x).toBeGreaterThanOrEqual(0);
    }
  });
});

// Frameworks own the declared markup: React removes a series it stops rendering
// with removeChild on the element's original parent, and adds it back with
// insertBefore. The chart must leave declared elements where they were authored.
test.describe("framework rendering", () => {
  const TWO = `
    <div id="chart" class="chart" ${data([{ m: "Jan", a: 1, b: 4 }, { m: "Feb", a: 3, b: 2 }, { m: "Mar", a: 2, b: 5 }])}>
      <svg id="svg" ${SVG} aria-label="Sales">
        <path id="a" class="chart-line" data-sp-field="a" aria-label="A"></path>
        <path id="b" class="chart-line" data-sp-field="b" aria-label="B"></path>
        <g id="x" class="chart-axis" data-sp-axis="x" data-sp-field="m"><text class="chart-axis-tick"></text></g>
      </svg>
    </div>`;
  const drawn = (page: Page, field: string) => page.locator(`g[data-sp-clone] > .chart-line[data-sp-field="${field}"]`).count();

  test("an unrelated element rendered inside a chart card leaves the chart drawn", async ({ page }) => {
    await mount(page, TWO);
    const same = await page.evaluate(async () => {
      const host = document.querySelector("g[data-sp-clone] > .chart-line")!.parentElement;
      document.getElementById("chart")!.insertAdjacentHTML("afterbegin", '<span class="badge">Live</span>');
      await new Promise((r) => setTimeout(r, 50));
      return host!.isConnected;
    });
    expect(same).toBe(true);
  });

  test("legend rows a framework renders again leave the chart drawn", async ({ page }) => {
    await mount(page, TWO.replace("</svg>", '</svg><div id="legend" class="chart-legend"></div>'));
    const same = await page.evaluate(async () => {
      const host = document.querySelector("g[data-sp-clone] > .chart-line")!.parentElement;
      document.getElementById("legend")!.innerHTML = '<span class="chart-legend-indicator"></span> A';
      await new Promise((r) => setTimeout(r, 50));
      return host!.isConnected;
    });
    expect(same).toBe(true);
  });

  test("declared marks and axes stay in the parent they were authored in", async ({ page }) => {
    await mount(page, TWO);
    const parents = await page.evaluate(() => ["a", "b", "x"].map((id) => document.getElementById(id)!.parentElement!.id));
    expect(parents).toEqual(["svg", "svg", "svg"]);
  });

  test("axes still draw under the marks", async ({ page }) => {
    await mount(page, TWO);
    const first = await page.evaluate(() => document.getElementById("svg")!.firstElementChild!.matches(".chart-axis[data-sp-clone]"));
    expect(first).toBe(true);
  });

  test("a series removed with removeChild redraws without it", async ({ page }) => {
    await mount(page, TWO);
    await page.evaluate(() => document.getElementById("svg")!.removeChild(document.getElementById("b")!));
    await settle(page);
    expect(await drawn(page, "a")).toBe(1);
    expect(await drawn(page, "b")).toBe(0);
  });

  test("a series added back with insertBefore is drawn", async ({ page }) => {
    await mount(page, TWO);
    await page.evaluate(() => {
      const svg = document.getElementById("svg")!;
      const b = document.getElementById("b")!;
      svg.removeChild(b);
      svg.insertBefore(b, document.getElementById("x"));
    });
    await settle(page);
    expect(await drawn(page, "b")).toBe(1);
  });

  test("an axis removed with removeChild redraws without it", async ({ page }) => {
    await mount(page, TWO);
    await page.evaluate(() => document.getElementById("svg")!.removeChild(document.getElementById("x")!));
    await settle(page);
    await expect(page.locator(".chart-axis-tick:not([data-sp-template])")).toHaveCount(0);
    expect(await drawn(page, "a")).toBe(1);
  });
});
