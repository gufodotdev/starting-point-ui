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
  <button id="trigger" class="btn">Open</button>
  <div id="pop" class="popover" data-sp-toggle="#trigger">
    <p>Popover content</p>
    <button id="inside">Inside</button>
  </div>
  <button id="outside">Outside</button>`;

const HOVER = `
  <button id="trigger" class="btn">Hover</button>
  <div id="pop" class="popover" data-sp-toggle="#trigger" data-sp-mode="hover">
    <p>Hover content</p>
  </div>`;

const popover = (page: Page) => page.locator("#pop");

test("opens from its trigger and enters the top layer", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  expect(await popover(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
});

test("toggles closed when the trigger is clicked again", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  await page.click("#trigger");
  await expect(popover(page)).not.toHaveClass(/shown/);
});

test("closes on Escape", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  await page.keyboard.press("Escape");
  await expect(popover(page)).not.toHaveClass(/shown/);
});

test("closes on an outside click", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  await page.click("#outside");
  await expect(popover(page)).not.toHaveClass(/shown/);
});

test("stays open when clicking inside the panel", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  await page.click("#inside");
  await expect(popover(page)).toHaveClass(/shown/);
});

test("closes when focus moves outside", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  await page.focus("#inside");
  await page.keyboard.press("Tab");
  await expect(popover(page)).not.toHaveClass(/shown/);
});

test("stays open when focus moves back to the trigger", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(popover(page)).toHaveClass(/shown/);
  await page.focus("#inside");
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("trigger");
  await expect(popover(page)).toHaveClass(/shown/);
});

test("emits the lifecycle events in order", async ({ page }) => {
  await mount(page, BASIC);
  const events = await page.evaluate(async () => {
    const el = document.querySelector("#pop") as HTMLElement;
    const seen: string[] = [];
    for (const type of ["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]) {
      el.addEventListener(`sp-${type}`, () => seen.push(type));
    }
    const p = (window as any).sp.popover(el);
    p.show();
    await new Promise((r) => setTimeout(r, 300));
    p.hide();
    await new Promise((r) => setTimeout(r, 300));
    return seen;
  });
  expect(events).toEqual(["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]);
});

test("syncs aria-expanded on the trigger", async ({ page }) => {
  await mount(page, BASIC);
  const trigger = page.locator("#trigger");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.click("#trigger");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

// WAI-ARIA non-modal dialog semantics (Radix-style popover):
// https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
test.describe("WAI-ARIA compliance", () => {
  test("applies dialog semantics automatically", async ({ page }) => {
    await mount(page, BASIC);
    const trigger = page.locator("#trigger");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-controls", "pop");
    await expect(popover(page)).toHaveAttribute("role", "dialog");
    await expect(popover(page)).toHaveAttribute("aria-labelledby", "trigger");
  });

  test("returns focus to the trigger when closed from inside", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    await expect(popover(page)).toHaveClass(/shown/);
    await page.focus("#inside");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#pop")!.matches(":popover-open"));
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("trigger");
  });
});

test("sp.popover(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#pop") as HTMLElement;
    const p = (window as any).sp.popover(el);
    return { show: typeof p.show, hide: typeof p.hide, toggle: typeof p.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
});

test.describe("hover mode", () => {
  test("opens on pointer enter and closes on leave", async ({ page }) => {
    await mount(page, HOVER);
    await page.hover("#trigger");
    await expect(popover(page)).toHaveClass(/shown/);
    // move the pointer well away from trigger and panel
    await page.mouse.move(0, 0);
    await expect(popover(page)).not.toHaveClass(/shown/);
  });
});
