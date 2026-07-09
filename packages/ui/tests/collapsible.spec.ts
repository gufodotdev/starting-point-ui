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
  <div id="panel" class="collapsible" data-sp-toggle="#trigger">
    <div class="collapsible-content">Hidden content</div>
  </div>`;

const PREEXPANDED = `
  <button id="trigger" class="btn">Toggle</button>
  <div id="panel" class="collapsible expanded" data-sp-toggle="#trigger">
    <div class="collapsible-content">Visible content</div>
  </div>`;

// Same as PREEXPANDED but the author also set aria-expanded on the trigger for a
// correct first paint; init must respect it, not overwrite it.
const PREEXPANDED_ARIA = `
  <button id="trigger" class="btn" aria-expanded="true">Toggle</button>
  <div id="panel" class="collapsible expanded" data-sp-toggle="#trigger">
    <div class="collapsible-content">Visible content</div>
  </div>`;

// Inner collapsible nested inside the outer panel; the outer starts open.
const NESTED = `
  <button id="outer-trigger" class="btn">Outer</button>
  <div id="outer" class="collapsible expanded" data-sp-toggle="#outer-trigger">
    <div class="collapsible-content">
      <button id="inner-trigger" class="btn">Inner</button>
      <div id="inner" class="collapsible" data-sp-toggle="#inner-trigger">
        <div class="collapsible-content">Nested content</div>
      </div>
    </div>
  </div>`;

const panel = (page: Page) => page.locator("#panel");

test("opens from its trigger and settles to .expanded", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(panel(page)).toHaveClass(/expanded/);
  await expect(panel(page)).toHaveAttribute("data-sp-open", "");
});

test("toggles closed when the trigger is clicked again", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(panel(page)).toHaveClass(/expanded/);
  await page.click("#trigger");
  await expect(panel(page)).not.toHaveClass(/expanded/);
  await expect(panel(page)).not.toHaveAttribute("data-sp-open");
});

test("settles an authored .expanded panel and syncs the trigger", async ({ page }) => {
  await mount(page, PREEXPANDED);
  await expect(panel(page)).toHaveClass(/expanded/);
  await expect(panel(page)).toHaveAttribute("data-sp-open", "");
  await expect(page.locator("#trigger")).toHaveAttribute("aria-expanded", "true");
  await page.click("#trigger");
  await expect(panel(page)).not.toHaveClass(/expanded/);
});

test("respects an authored aria-expanded on a .expanded panel and stays togglable", async ({ page }) => {
  await mount(page, PREEXPANDED_ARIA);
  // Authoring aria-expanded for first paint must not break the settle.
  await expect(panel(page)).toHaveClass(/expanded/);
  await expect(page.locator("#trigger")).toHaveAttribute("aria-expanded", "true");
  await page.click("#trigger");
  await expect(panel(page)).not.toHaveClass(/expanded/);
  await expect(page.locator("#trigger")).toHaveAttribute("aria-expanded", "false");
  await page.click("#trigger");
  await expect(panel(page)).toHaveClass(/expanded/);
  await expect(page.locator("#trigger")).toHaveAttribute("aria-expanded", "true");
});

test("measures the content height for the animation keyframes", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  const height = await panel(page).evaluate((el) =>
    el.style.getPropertyValue("--sp-collapse-height"),
  );
  expect(height).toMatch(/^\d+px$/);
});

test("emits the lifecycle events in order", async ({ page }) => {
  await mount(page, BASIC);
  const events = await page.evaluate(async () => {
    const el = document.querySelector("#panel") as HTMLElement;
    const seen: string[] = [];
    for (const type of ["beforeexpand", "expand", "expanded", "beforecollapse", "collapse", "collapsed"]) {
      el.addEventListener(`sp-${type}`, () => seen.push(type));
    }
    const c = (window as any).sp.collapsible(el);
    c.expand();
    await new Promise((r) => setTimeout(r, 300));
    c.collapse();
    await new Promise((r) => setTimeout(r, 300));
    return seen;
  });
  expect(events).toEqual(["beforeexpand", "expand", "expanded", "beforecollapse", "collapse", "collapsed"]);
});

test("sp.collapsible(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#panel") as HTMLElement;
    const c = (window as any).sp.collapsible(el);
    return { expand: typeof c.expand, collapse: typeof c.collapse, toggle: typeof c.toggle };
  });
  expect(api).toEqual({ expand: "function", collapse: "function", toggle: "function" });
});

test("a nested collapsible's lifecycle does not toggle the outer one", async ({ page }) => {
  await mount(page, NESTED);
  const outer = page.locator("#outer");
  const outerTrigger = page.locator("#outer-trigger");
  await expect(outer).toHaveClass(/expanded/);
  await expect(outerTrigger).toHaveAttribute("aria-expanded", "true");

  // Open then close the inner panel; its bubbling sp-before* events must not
  // flip the outer trigger or collapse the outer panel.
  await page.click("#inner-trigger");
  await expect(page.locator("#inner")).toHaveClass(/expanded/);
  await expect(outer).toHaveClass(/expanded/);
  await expect(outerTrigger).toHaveAttribute("aria-expanded", "true");

  await page.click("#inner-trigger");
  await expect(page.locator("#inner")).not.toHaveClass(/expanded/);
  await expect(outer).toHaveClass(/expanded/);
  await expect(outerTrigger).toHaveAttribute("aria-expanded", "true");
});

// WAI-ARIA Disclosure pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
test.describe("WAI-ARIA compliance", () => {
  test("wires aria-expanded and aria-controls on the trigger", async ({ page }) => {
    await mount(page, BASIC);
    const trigger = page.locator("#trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-controls", "panel");
    await page.click("#trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.click("#trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("Enter and Space on the trigger toggle the panel", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("Enter");
    await expect(panel(page)).toHaveClass(/expanded/);
    await page.keyboard.press("Space");
    await expect(panel(page)).not.toHaveClass(/expanded/);
  });
});
