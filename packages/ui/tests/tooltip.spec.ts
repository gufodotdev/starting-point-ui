import { test, expect, type Page } from "@playwright/test";

// Tooltip reuses the popover mechanism (Popoverable + Anchorable) and Togglable,
// but opens only on hover/focus (HoverToShow + HoverOutHide, no ClickToShow) and
// describes its trigger via aria-describedby. These tests verify that reuse.

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
  <button id="trigger" class="btn">Hover me</button>
  <div id="tip" class="tooltip" data-sp-toggle="#trigger">Tooltip text</div>
  <button id="other">Other</button>`;

const tooltip = (page: Page) => page.locator("#tip");

test("opens on hover and enters the top layer", async ({ page }) => {
  await mount(page, BASIC);
  await page.hover("#trigger");
  await expect(tooltip(page)).toHaveClass(/shown/);
  expect(await tooltip(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
});

test("closes when the pointer leaves", async ({ page }) => {
  await mount(page, BASIC);
  await page.hover("#trigger");
  await expect(tooltip(page)).toHaveClass(/shown/);
  await page.hover("#other");
  await expect(tooltip(page)).not.toHaveClass(/shown/);
});

test("does NOT open on click (no click trigger)", async ({ page }) => {
  await mount(page, BASIC);
  // Dispatch a click WITHOUT hovering first (page.click would move the pointer
  // there and open it via hover). A bare click must not toggle it open.
  await page.evaluate(() =>
    document.getElementById("trigger")!.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await page.waitForTimeout(120);
  await expect(tooltip(page)).not.toHaveClass(/shown/);
});

test("has role=tooltip and describes its trigger", async ({ page }) => {
  await mount(page, BASIC);
  await expect(tooltip(page)).toHaveAttribute("role", "tooltip");
  await expect(page.locator("#trigger")).toHaveAttribute("aria-describedby", "tip");
});

test("injects an arrow element", async ({ page }) => {
  await mount(page, BASIC);
  await expect(tooltip(page).locator("[data-sp-arrow]")).toHaveCount(1);
});

test("closes on Escape", async ({ page }) => {
  await mount(page, BASIC);
  await page.hover("#trigger");
  await expect(tooltip(page)).toHaveClass(/shown/);
  await page.keyboard.press("Escape");
  await expect(tooltip(page)).not.toHaveClass(/shown/);
});

test("sp.tooltip(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#tip") as HTMLElement;
    const t = (window as any).sp.tooltip(el);
    return { show: typeof t.show, hide: typeof t.hide, toggle: typeof t.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
});

test("removes aria-describedby from the trigger on dispose", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#trigger")).toHaveAttribute("aria-describedby", "tip");
  // Detach the tooltip; the persistent trigger must not keep a dangling ref.
  await page.evaluate(() => document.querySelector("#tip")!.remove());
  await page.waitForTimeout(50);
  await expect(page.locator("#trigger")).not.toHaveAttribute("aria-describedby", /.*/);
});
