import { test, expect, type Page } from "@playwright/test";

// Dropdown shares Popover's mixin set, so open/close/dismiss lifecycles are
// covered by popover.spec. These tests verify the dropdown-specific behavior:
// arrow navigation (Navigable), item clicks closing, and focus return.

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
  <div id="menu" class="dropdown" data-sp-toggle="#trigger">
    <button id="i1" class="dropdown-item">One</button>
    <button id="i2" class="dropdown-item">Two</button>
    <div id="sep" class="dropdown-separator"></div>
    <button id="i3" class="dropdown-item">Three</button>
  </div>
  <button id="outside">Outside</button>`;

const DISABLED = `
  <button id="trigger" class="btn">Open</button>
  <div id="menu" class="dropdown" data-sp-toggle="#trigger">
    <button id="i1" class="dropdown-item">One</button>
    <button id="i2" class="dropdown-item" aria-disabled="true" tabindex="-1">Two</button>
    <button id="i3" class="dropdown-item">Three</button>
  </div>`;

const menu = (page: Page) => page.locator("#menu");

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

async function waitUnmounted(page: Page) {
  await page.waitForFunction(() => !document.querySelector("#menu")!.matches(":popover-open"));
}

test("opens from its trigger and enters the top layer", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  expect(await menu(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
});

test("ArrowDown from the trigger focuses the first item", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
});

test("arrow keys cycle through the items, wrapping at both ends", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);

  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i2");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i3");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");

  await page.keyboard.press("ArrowUp");
  expect(await activeId(page)).toBe("i3");
});

test("Home and End jump to the first and last item", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("End");
  expect(await activeId(page)).toBe("i3");
  await page.keyboard.press("Home");
  expect(await activeId(page)).toBe("i1");
});

test("arrow navigation skips disabled items", async ({ page }) => {
  await mount(page, DISABLED);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i3");
});

test("clicking an item closes the menu", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.click("#i2");
  await expect(menu(page)).not.toHaveClass(/shown/);
});

test("Enter and Space activate the focused item", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("Space");
  await expect(menu(page)).not.toHaveClass(/shown/);

  await page.click("#trigger");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(menu(page)).not.toHaveClass(/shown/);
});

test("clicking a disabled item keeps the menu open", async ({ page }) => {
  await mount(page, DISABLED);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  // Playwright refuses to click aria-disabled elements; dispatch directly to
  // exercise the JS guard behind the pointer-events: none CSS.
  await page.evaluate(() =>
    document.querySelector("#i2")!.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await expect(menu(page)).toHaveClass(/shown/);
});

test("Escape closes and returns focus to the trigger", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("Escape");
  await waitUnmounted(page);
  expect(await activeId(page)).toBe("trigger");
});

test("tabbing past the last item closes the menu", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.focus("#i3");
  await page.keyboard.press("Tab");
  await expect(menu(page)).not.toHaveClass(/shown/);
});

test("emits the lifecycle events in order", async ({ page }) => {
  await mount(page, BASIC);
  const events = await page.evaluate(async () => {
    const el = document.querySelector("#menu") as HTMLElement;
    const seen: string[] = [];
    for (const type of ["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]) {
      el.addEventListener(`sp-${type}`, () => seen.push(type));
    }
    const d = (window as any).sp.dropdown(el);
    d.show();
    await new Promise((r) => setTimeout(r, 300));
    d.hide();
    await new Promise((r) => setTimeout(r, 300));
    return seen;
  });
  expect(events).toEqual(["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]);
});

// WAI-ARIA Menu Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
test.describe("WAI-ARIA compliance", () => {
  test("applies menu semantics automatically", async ({ page }) => {
    await mount(page, BASIC);
    const trigger = page.locator("#trigger");
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute("aria-controls", "menu");
    await expect(menu(page)).toHaveAttribute("role", "menu");
    await expect(menu(page)).toHaveAttribute("aria-labelledby", "trigger");
    await expect(page.locator("#sep")).toHaveAttribute("role", "separator");

    for (const id of ["i1", "i2", "i3"]) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("role", "menuitem");
      // Roving tabindex: items are not Tab stops.
      await expect(page.locator(`#${id}`)).toHaveAttribute("tabindex", "-1");
    }
  });

  test("Enter on the trigger opens the menu and focuses the first item", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("Enter");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("i1");
  });

  test("ArrowDown on the closed trigger opens the menu and focuses the first item", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("ArrowDown");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("i1");
  });

  test("ArrowUp on the closed trigger opens the menu and focuses the last item", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("ArrowUp");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("i3");
  });

  test("a pointer click leaves focus on the trigger", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("trigger");
  });
});

test("sp.dropdown(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#menu") as HTMLElement;
    const d = (window as any).sp.dropdown(el);
    return { show: typeof d.show, hide: typeof d.hide, toggle: typeof d.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
});
