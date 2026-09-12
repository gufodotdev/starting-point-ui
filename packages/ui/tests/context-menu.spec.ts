import { test, expect, type Page } from "@playwright/test";

// The context menu shares the dropdown's menu behavior (roles, arrow keys,
// checkable items, submenus), covered by dropdown.spec. These tests verify the
// context-specific behavior: opening at the pointer, long press, and dismissal.

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
  <div id="area" class="context-menu-trigger" style="width:320px;height:180px">Right click here</div>
  <div id="menu" class="context-menu" data-sp-toggle="#area" style="margin:0;inset:auto">
    <button id="i1" class="context-menu-item">Back</button>
    <button id="i2" class="context-menu-item" aria-disabled="true">Forward</button>
    <button id="i3" class="context-menu-item">Reload</button>
  </div>
  <button id="outside">Outside</button>`;

const SUB = `
  <div id="area" class="context-menu-trigger" style="width:320px;height:180px">Right click here</div>
  <div id="menu" class="context-menu" data-sp-toggle="#area" style="margin:0;inset:auto">
    <button id="i1" class="context-menu-item">Copy</button>
    <button id="more" class="context-menu-item">More Tools</button>
  </div>
  <div id="sub" class="context-menu context-menu-sub" data-sp-toggle="#more" style="margin:0;inset:auto" data-sp-mode="hover" data-sp-placement="right-start">
    <button id="s1" class="context-menu-item">Save Page...</button>
  </div>`;

const menu = (page: Page) => page.locator("#menu");
const area = (page: Page) => page.locator("#area");

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

async function waitUnmounted(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.querySelector("#menu")!.matches(":popover-open")))
    .toBe(false);
}

async function rightClick(page: Page, x: number, y: number) {
  await area(page).click({ button: "right", position: { x, y } });
  await expect(menu(page)).toHaveClass(/shown/);
}

test("right click opens the menu at the pointer", async ({ page }) => {
  await mount(page, BASIC);
  await expect(menu(page)).toBeHidden();
  await rightClick(page, 100, 60);
  const areaBox = (await area(page).boundingBox())!;
  const menuBox = (await menu(page).boundingBox())!;
  expect(Math.round(menuBox.x)).toBe(Math.round(areaBox.x + 100));
  expect(Math.round(menuBox.y)).toBe(Math.round(areaBox.y + 60 + 4));
});

test("the native context menu is suppressed on the area", async ({ page }) => {
  await mount(page, BASIC);
  const prevented = await page.evaluate(() => {
    const el = document.querySelector("#area")!;
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 50, clientY: 50 });
    return !el.dispatchEvent(event);
  });
  expect(prevented).toBe(true);
});

test("a second right click moves the open menu instead of closing it", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 40, 40);
  const first = (await menu(page).boundingBox())!;
  await area(page).click({ button: "right", position: { x: 200, y: 120 } });
  await expect(menu(page)).toHaveClass(/shown/);
  await expect.poll(async () => (await menu(page).boundingBox())!.x).toBeGreaterThan(first.x + 100);
});

test("a right click while the menu is closing reopens it", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  await page.evaluate(() => window.sp.contextMenu(document.querySelector<HTMLElement>("#menu")!)!.hide());
  await expect(menu(page)).toHaveClass(/hide/);
  await area(page).click({ button: "right", position: { x: 150, y: 90 } });
  await expect(menu(page)).toHaveClass(/shown/);
});

test("a left click on the area does not open the menu, and closes an open one", async ({ page }) => {
  await mount(page, BASIC);
  await area(page).click();
  await expect(menu(page)).toBeHidden();
  await rightClick(page, 100, 60);
  await area(page).click({ position: { x: 20, y: 20 } });
  await waitUnmounted(page);
});

test("a disabled area lets the native menu through", async ({ page }) => {
  await mount(page, BASIC.replace('id="area"', 'id="area" aria-disabled="true"'));
  const prevented = await page.evaluate(() => {
    const el = document.querySelector("#area")!;
    return !el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 50, clientY: 50 }));
  });
  expect(prevented).toBe(false);
  await expect(menu(page)).toBeHidden();
});

test("a long press opens the menu at the touch point", async ({ page }) => {
  await mount(page, BASIC);
  const box = (await area(page).boundingBox())!;
  const x = box.x + 80;
  const y = box.y + 50;
  await page.evaluate(({ x, y }) => {
    const el = document.querySelector("#area")!;
    const touch = new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [touch], targetTouches: [touch], changedTouches: [touch] }));
  }, { x, y });
  await page.waitForTimeout(300);
  await expect(menu(page)).toBeHidden();
  await page.waitForTimeout(400);
  await expect(menu(page)).toHaveClass(/shown/);
});

test("moving the finger cancels the long press", async ({ page }) => {
  await mount(page, BASIC);
  const box = (await area(page).boundingBox())!;
  await page.evaluate(({ x, y }) => {
    const el = document.querySelector("#area")!;
    const start = new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [start], targetTouches: [start], changedTouches: [start] }));
    const moved = new Touch({ identifier: 1, target: el, clientX: x + 30, clientY: y });
    el.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, touches: [moved], targetTouches: [moved], changedTouches: [moved] }));
  }, { x: box.x + 80, y: box.y + 50 });
  await page.waitForTimeout(700);
  await expect(menu(page)).toBeHidden();
});

test("Escape closes the menu", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  await page.keyboard.press("Escape");
  await waitUnmounted(page);
});

test("a click outside closes the menu", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  await page.locator("#outside").click();
  await waitUnmounted(page);
});

test("choosing an item closes the menu, a disabled item keeps it open", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  await page.locator("#i2").click({ force: true });
  await expect(menu(page)).toHaveClass(/shown/);
  await page.locator("#i3").click();
  await waitUnmounted(page);
});

test("arrow keys move through the items after opening", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  await page.locator("#i1").focus();
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i3");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
});

test("arrow keys work straight after a mouse open", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  expect(await activeId(page)).toBe("menu");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("ArrowUp");
  expect(await activeId(page)).toBe("i3");
});

test("a keyboard-invoked contextmenu event opens the menu and focuses the first item", async ({ page }) => {
  await mount(page, BASIC);
  // No pointer press precedes it; the coordinates vary by browser, so use the
  // element's own like Chrome does.
  await page.evaluate(() => {
    const el = document.querySelector("#area")!;
    const r = el.getBoundingClientRect();
    el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: r.left, clientY: r.top }));
  });
  await expect(menu(page)).toHaveClass(/shown/);
  expect(await activeId(page)).toBe("i1");
});

test("right clicking inside the open menu keeps the native menu suppressed", async ({ page }) => {
  await mount(page, BASIC);
  await rightClick(page, 100, 60);
  const prevented = await page.evaluate(() => {
    const el = document.querySelector("#i1")!;
    return !el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  });
  expect(prevented).toBe(true);
  await expect(menu(page)).toHaveClass(/shown/);
});

test("the pointer-less anchor follows the area when the page scrolls", async ({ page }) => {
  await mount(page, `<div style="height:250px"></div>` + BASIC + `<div style="height:1600px"></div>`);
  await page.evaluate(() => window.sp.contextMenu(document.querySelector<HTMLElement>("#menu")!)!.show());
  await expect(menu(page)).toHaveClass(/shown/);
  const before = (await menu(page).boundingBox())!.y;
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect.poll(async () => Math.round((await menu(page).boundingBox())!.y)).toBe(Math.round(before - 200));
});

test("applies menu semantics and the area gets no click toggle wiring", async ({ page }) => {
  await mount(page, BASIC);
  await expect(menu(page)).toHaveAttribute("role", "menu");
  await expect(area(page)).toHaveAttribute("aria-haspopup", "menu");
  await expect(area(page)).toHaveAttribute("aria-controls", "menu");
  await expect(area(page)).not.toHaveAttribute("aria-expanded");
  await expect(page.locator("#i1")).toHaveAttribute("role", "menuitem");
});

test("submenu opens from its item and choosing a sub item closes both", async ({ page }) => {
  await mount(page, SUB);
  await rightClick(page, 100, 60);
  await page.locator("#more").hover();
  await expect(page.locator("#sub")).toHaveClass(/shown/);
  await page.locator("#s1").click();
  await waitUnmounted(page);
  await expect
    .poll(() => page.evaluate(() => document.querySelector("#sub")!.matches(":popover-open")))
    .toBe(false);
});

test("sp.contextMenu(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>("#menu")!;
    const instance = window.sp.contextMenu(el)!;
    return { show: typeof instance.show, hide: typeof instance.hide, toggle: typeof instance.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
  await page.evaluate(() => window.sp.contextMenu(document.querySelector<HTMLElement>("#menu")!)!.show());
  await expect(menu(page)).toHaveClass(/shown/);
});
