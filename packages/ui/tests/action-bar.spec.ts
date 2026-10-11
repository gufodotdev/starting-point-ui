import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const BASIC = `
  <button id="trigger" class="btn">Toggle</button>
  <div id="bar" class="action-bar" data-sp-toggle="#trigger" aria-label="Selection actions">
    <button id="dismiss" class="btn" data-sp-dismiss>3 selected</button>
    <button id="export" class="btn">Export</button>
    <button id="delete" class="btn">Delete</button>
  </div>`;

const bar = (page: Page) => page.locator("#bar");
const isOpen = (page: Page) =>
  bar(page).evaluate((el) => el.matches(":popover-open"));

test("shows from its trigger in the top layer and toggles back", async ({
  page,
}) => {
  await mount(page, BASIC);
  expect(await isOpen(page)).toBe(false);
  await page.click("#trigger");
  await expect(bar(page)).toHaveClass(/shown/);
  expect(await isOpen(page)).toBe(true);
  await expect(page.locator("#trigger")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.click("#trigger");
  await expect(bar(page)).not.toHaveClass(/shown/);
  await expect.poll(() => isOpen(page)).toBe(false);
});

test("a dismiss button inside hides it", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(bar(page)).toHaveClass(/shown/);
  await page.click("#dismiss");
  await expect(bar(page)).not.toHaveClass(/shown/);
  await expect.poll(() => isOpen(page)).toBe(false);
});

test("closes on Escape", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(bar(page)).toHaveClass(/shown/);
  await page.keyboard.press("Escape");
  await expect(bar(page)).not.toHaveClass(/shown/);
});

test("is a toolbar whose arrow keys move between the actions", async ({
  page,
}) => {
  await mount(page, BASIC);
  await expect(bar(page)).toHaveAttribute("role", "toolbar");
  await page.click("#trigger");
  await page.focus("#dismiss");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#export")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#delete")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#dismiss")).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.locator("#delete")).toBeFocused();
});

test("works without a trigger through the api", async ({ page }) => {
  await mount(
    page,
    `
    <div id="bar" class="action-bar">
      <button class="btn">Export</button>
    </div>`,
  );
  await page.evaluate(() => {
    (window as any).sp.actionBar(document.getElementById("bar")).show();
  });
  await expect(bar(page)).toHaveClass(/shown/);
  expect(await isOpen(page)).toBe(true);
  await page.evaluate(() => {
    (window as any).sp.actionBar(document.getElementById("bar")).hide();
  });
  await expect(bar(page)).not.toHaveClass(/shown/);
  await expect.poll(() => isOpen(page)).toBe(false);
});

test("authored .shown is open on load without an enter animation", async ({
  page,
}) => {
  await mount(
    page,
    `
    <div id="bar" class="action-bar shown">
      <button class="btn">Export</button>
    </div>`,
  );
  await expect(bar(page)).toHaveClass(/shown/);
  expect(await isOpen(page)).toBe(true);
  await expect(bar(page)).not.toHaveClass(/\bshow\b/);
});

test("emits the lifecycle events in order", async ({ page }) => {
  await mount(page, BASIC);
  const seen = await page.evaluate(async () => {
    const el = document.getElementById("bar") as HTMLElement;
    const seen: string[] = [];
    for (const type of [
      "beforeshow",
      "show",
      "shown",
      "beforehide",
      "hide",
      "hidden",
    ]) {
      el.addEventListener(`sp-${type}`, () => seen.push(type));
    }
    const instance = (window as any).sp.actionBar(el);
    instance.show();
    await new Promise((r) => setTimeout(r, 50));
    instance.hide();
    await new Promise((r) => setTimeout(r, 50));
    return seen;
  });
  expect(seen).toEqual([
    "beforeshow",
    "show",
    "shown",
    "beforehide",
    "hide",
    "hidden",
  ]);
});

test("a cancelled beforeshow keeps it closed", async ({ page }) => {
  await mount(page, BASIC);
  await page.evaluate(() => {
    document
      .getElementById("bar")!
      .addEventListener("sp-beforeshow", (e) => e.preventDefault());
  });
  await page.click("#trigger");
  await expect(bar(page)).not.toHaveClass(/shown/);
  await expect.poll(() => isOpen(page)).toBe(false);
});
