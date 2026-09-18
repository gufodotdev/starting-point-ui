import { test, expect, type Page } from "@playwright/test";

// The harness ships no CSS, so each fixture carries the flex layout inline:
// a 400px wide (or tall) group with hairline handles, like the stylesheet gives.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const STYLE = `<style>
  .resizable { display: flex; width: 400px; height: 200px; }
  .resizable-vertical { flex-direction: column; }
  .resizable-panel { min-width: 0; min-height: 0; flex: 1 1 0; overflow: hidden; }
  .resizable-handle { flex-shrink: 0; width: 1px; }
  .resizable-vertical > .resizable-handle { width: auto; height: 1px; }
</style>`;

const group = (panels: string, { cls = "", attrs = "" } = {}) =>
  `${STYLE}<div id="group" class="resizable ${cls}" ${attrs}>${panels}</div>`;
const panel = (id: string, attrs = "") =>
  `<div id="${id}" class="resizable-panel" ${attrs}>${id}</div>`;
const handle = (id = "h1") => `<div id="${id}" class="resizable-handle"></div>`;

const TWO = group(`${panel("a", 'data-sp-size="25"')}${handle()}${panel("b")}`);
const THREE = group(
  `${panel("a")}${handle("h1")}${panel("b")}${handle("h2")}${panel("c")}`,
);

const layout = (page: Page) =>
  page.evaluate(() =>
    window.sp
      .resizable(document.querySelector<HTMLElement>("#group")!)!
      .layout());
const widths = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".resizable-panel")].map((p) =>
      Math.round(p.getBoundingClientRect().width)));

// Synthetic pointer events on the handle: the harness has no hit area to aim at.
async function drag(page: Page, id: string, dx: number, dy = 0) {
  await page.evaluate(
    ([id, dx, dy]) => {
      const handle = document.getElementById(id as string)!;
      const box = handle.getBoundingClientRect();
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      const fire = (type: string, cx: number, cy: number) =>
        handle.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            button: 0,
            pointerId: 1,
            clientX: cx,
            clientY: cy,
          }),
        );
      fire("pointerdown", x, y);
      fire("pointermove", x + (dx as number) / 2, y + (dy as number) / 2);
      fire("pointermove", x + (dx as number), y + (dy as number));
      fire("pointerup", x + (dx as number), y + (dy as number));
    },
    [id, dx, dy],
  );
}

test("authored sizes set the split and unsized panels share the rest", async ({
  page,
}) => {
  await mount(page, TWO);
  expect(await layout(page)).toEqual([25, 75]);
  expect(await widths(page)).toEqual([100, 299]);
  await mount(page, THREE);
  expect(await layout(page)).toEqual([33.33, 33.33, 33.33]);
});

test("dragging a handle moves the split and emits resize then resized", async ({
  page,
}) => {
  await mount(page, TWO);
  await page.evaluate(() => {
    const w = window as unknown as { events: string[] };
    w.events = [];
    for (const type of ["sp-resize", "sp-resized"])
      document
        .getElementById("group")!
        .addEventListener(type, (e) =>
          w.events.push(
            `${type}:${(e as CustomEvent).detail.layout.join(",")}`,
          ));
  });
  await drag(page, "h1", 100);
  expect(await layout(page)).toEqual([50.06, 49.94]);
  const events = await page.evaluate(
    () => (window as unknown as { events: string[] }).events,
  );
  expect(
    events.filter((e) => e.startsWith("sp-resize:")).length,
  ).toBeGreaterThan(0);
  expect(events.at(-1)).toBe("sp-resized:50.06,49.94");
});

test("handles expose separator semantics that track the panel before them", async ({
  page,
}) => {
  await mount(page, TWO);
  const h = page.locator("#h1");
  await expect(h).toHaveAttribute("role", "separator");
  await expect(h).toHaveAttribute("aria-orientation", "vertical");
  await expect(h).toHaveAttribute("aria-controls", "a");
  await expect(h).toHaveAttribute("aria-valuenow", "25");
  await expect(h).toHaveAttribute("tabindex", "0");
  await drag(page, "h1", 100);
  await expect(h).toHaveAttribute("aria-valuenow", "50");
});

test("arrow keys step five percent, Home and End go to the limits", async ({
  page,
}) => {
  await mount(
    page,
    group(
      `${panel("a", 'data-sp-size="50" data-sp-min="20" data-sp-max="80"')}${handle()}${panel("b")}`,
    ),
  );
  await page.locator("#h1").focus();
  await page.keyboard.press("ArrowRight");
  expect(await layout(page)).toEqual([55, 45]);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  expect(await layout(page)).toEqual([45, 55]);
  await page.keyboard.press("ArrowUp");
  expect(await layout(page)).toEqual([45, 55]);
  await page.keyboard.press("End");
  expect(await layout(page)).toEqual([80, 20]);
  await page.keyboard.press("Home");
  expect(await layout(page)).toEqual([20, 80]);
});

test("min and max hold while dragging, in any unit", async ({ page }) => {
  await mount(
    page,
    group(
      `${panel("a", 'data-sp-size="50" data-sp-min="80px" data-sp-max="60%"')}${handle()}${panel("b", 'data-sp-min="10"')}`,
    ),
  );
  await drag(page, "h1", -300);
  expect(await layout(page)).toEqual([20.05, 79.95]);
  await drag(page, "h1", 300);
  expect(await layout(page)).toEqual([60, 40]);
});

test("a collapsible panel snaps shut past half its minimum and Enter toggles it", async ({
  page,
}) => {
  await mount(
    page,
    group(
      `${panel("a", 'data-sp-size="30" data-sp-min="20" data-sp-collapsible')}${handle()}${panel("b")}`,
    ),
  );
  await page.evaluate(() => {
    const w = window as unknown as { events: string[] };
    w.events = [];
    for (const type of ["sp-collapse", "sp-expand"])
      document
        .getElementById("group")!
        .addEventListener(type, (e) =>
          w.events.push(`${type}:${(e as CustomEvent).detail.index}`));
  });
  await drag(page, "h1", -50);
  expect(await layout(page)).toEqual([20, 80]);
  await drag(page, "h1", -60);
  expect(await layout(page)).toEqual([0, 100]);
  await expect(page.locator("#a")).toHaveClass(/collapsed/);
  await page.locator("#h1").focus();
  await page.keyboard.press("Enter");
  expect(await layout(page)).toEqual([20, 80]);
  await page.keyboard.press("Enter");
  expect(await layout(page)).toEqual([0, 100]);
  expect(
    await page.evaluate(
      () => (window as unknown as { events: string[] }).events,
    ),
  ).toEqual(["sp-collapse:0", "sp-expand:0", "sp-collapse:0"]);
});

test("a collapsed size keeps a sliver visible", async ({ page }) => {
  await mount(
    page,
    group(
      `${panel("a", 'data-sp-size="30" data-sp-min="20" data-sp-collapsible data-sp-collapsed-size="5"')}${handle()}${panel("b")}`,
    ),
  );
  await page.evaluate(() =>
    window.sp
      .resizable(document.querySelector<HTMLElement>("#group")!)!
      .collapse(0));
  expect(await layout(page)).toEqual([5, 95]);
  expect(
    await page.evaluate(() =>
      window.sp
        .resizable(document.querySelector<HTMLElement>("#group")!)!
        .isCollapsed(0)),
  ).toBe(true);
  await page.evaluate(() =>
    window.sp
      .resizable(document.querySelector<HTMLElement>("#group")!)!
      .expand(0));
  expect(await layout(page)).toEqual([30, 70]);
});

test("a double click on a handle restores the authored size", async ({
  page,
}) => {
  await mount(page, TWO);
  await drag(page, "h1", 100);
  expect((await layout(page))[0]).toBeGreaterThan(45);
  await page.locator("#h1").dispatchEvent("dblclick");
  expect(await layout(page)).toEqual([25, 75]);
});

test("a disabled panel freezes its handles, and a disabled group freezes all", async ({
  page,
}) => {
  await mount(
    page,
    group(
      `${panel("a", "data-sp-disabled")}${handle("h1")}${panel("b")}${handle("h2")}${panel("c")}`,
    ),
  );
  await expect(page.locator("#h1")).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#h1")).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("#h2")).not.toHaveAttribute("aria-disabled", /.*/);
  await drag(page, "h1", 100);
  expect(await layout(page)).toEqual([33.33, 33.33, 33.33]);
  await drag(page, "h2", 60);
  expect((await layout(page))[1]).toBeGreaterThan(40);
  await mount(
    page,
    group(`${panel("a")}${handle()}${panel("b")}`, {
      attrs: "data-sp-disabled",
    }),
  );
  await expect(page.locator("#h1")).toHaveAttribute("aria-disabled", "true");
  await drag(page, "h1", 100);
  expect(await layout(page)).toEqual([50, 50]);
});

test("F6 cycles focus between the handles", async ({ page }) => {
  await mount(page, THREE);
  await page.locator("#h1").focus();
  await page.keyboard.press("F6");
  await expect(page.locator("#h2")).toBeFocused();
  await page.keyboard.press("F6");
  await expect(page.locator("#h1")).toBeFocused();
  await page.keyboard.press("Shift+F6");
  await expect(page.locator("#h2")).toBeFocused();
});

test("a vertical group resizes along the y axis with the up and down keys", async ({
  page,
}) => {
  await mount(
    page,
    group(`${panel("a", 'data-sp-size="25"')}${handle()}${panel("b")}`, {
      cls: "resizable-vertical",
    }),
  );
  await expect(page.locator("#h1")).toHaveAttribute(
    "aria-orientation",
    "horizontal",
  );
  await drag(page, "h1", 0, 50);
  expect(await layout(page)).toEqual([50.13, 49.87]);
  await page.locator("#h1").focus();
  await page.keyboard.press("ArrowDown");
  expect(await layout(page)).toEqual([55.13, 44.87]);
  await page.keyboard.press("ArrowRight");
  expect(await layout(page)).toEqual([55.13, 44.87]);
});

test("in RTL the drag and the arrow keys follow the reading direction", async ({
  page,
}) => {
  await mount(page, `<div dir="rtl">${TWO}</div>`);
  await drag(page, "h1", -100);
  expect(await layout(page)).toEqual([50.06, 49.94]);
  await page.locator("#h1").focus();
  await page.keyboard.press("ArrowLeft");
  expect(await layout(page)).toEqual([55.06, 44.94]);
});

test("nested groups resize independently", async ({ page }) => {
  await mount(
    page,
    `${STYLE}<div id="group" class="resizable">${panel("a", 'data-sp-size="50"')}${handle("h1")}<div id="b" class="resizable-panel"><div id="inner" class="resizable resizable-vertical" style="width:auto;height:200px">${panel("c", 'data-sp-size="25"')}${handle("h2")}${panel("d")}</div></div></div>`,
  );
  expect(
    await page.evaluate(() =>
      window.sp
        .resizable(document.querySelector<HTMLElement>("#inner")!)!
        .layout()),
  ).toEqual([25, 75]);
  await drag(page, "h2", 0, 50);
  expect(
    await page.evaluate(() =>
      window.sp
        .resizable(document.querySelector<HTMLElement>("#inner")!)!
        .layout()),
  ).toEqual([50.13, 49.87]);
  expect(await layout(page)).toEqual([50, 50]);
});

test("data-sp-persist restores the last layout from localStorage", async ({
  page,
}) => {
  await mount(
    page,
    group(`${panel("a", 'data-sp-size="25"')}${handle()}${panel("b")}`, {
      attrs: 'data-sp-persist="spec"',
    }),
  );
  await drag(page, "h1", 100);
  expect(
    await page.evaluate(() => localStorage.getItem("sp-resizable:spec")),
  ).toBe("[50.06,49.94]");
  await mount(
    page,
    group(`${panel("a", 'data-sp-size="25"')}${handle()}${panel("b")}`, {
      attrs: 'data-sp-persist="spec"',
    }),
  );
  expect(await layout(page)).toEqual([50.06, 49.94]);
  await page.evaluate(() => localStorage.removeItem("sp-resizable:spec"));
});

test("a pixel-preserving panel keeps its width when the group grows", async ({
  page,
}) => {
  await mount(
    page,
    group(
      `${panel("a", 'data-sp-size="25" data-sp-preserve-pixels')}${handle()}${panel("b")}`,
    ),
  );
  expect(await widths(page)).toEqual([100, 299]);
  await page.evaluate(
    () => (document.getElementById("group")!.style.width = "800px"),
  );
  await expect.poll(() => widths(page)).toEqual([100, 699]);
});

test("a group that starts hidden lays out with its pixel sizes once it is shown", async ({
  page,
}) => {
  await mount(
    page,
    `${STYLE}<div id="group" class="resizable" style="display:none">${panel("a", 'data-sp-size="100px"')}${handle()}${panel("b")}</div>`,
  );
  expect(await layout(page)).toEqual([0, 0]);
  await page.evaluate(
    () => (document.getElementById("group")!.style.display = ""),
  );
  await expect.poll(() => layout(page)).toEqual([25.06, 74.94]);
});

test("sp.resizable(el) exposes layout, setLayout, and resize", async ({
  page,
}) => {
  await mount(page, THREE);
  await page.evaluate(() =>
    window.sp
      .resizable(document.querySelector<HTMLElement>("#group")!)!
      .setLayout([20, 30, 50]));
  expect(await layout(page)).toEqual([20, 30, 50]);
  await page.evaluate(() =>
    window.sp
      .resizable(document.querySelector<HTMLElement>("#group")!)!
      .resize(0, "40%"));
  expect(await layout(page)).toEqual([40, 10, 50]);
  await page.evaluate(() =>
    window.sp
      .resizable(document.querySelector<HTMLElement>("#group")!)!
      .resize(document.getElementById("c")!, "119.4px"));
  expect(await layout(page)).toEqual([40, 30, 30]);
});
