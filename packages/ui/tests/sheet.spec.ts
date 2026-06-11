import { test, expect, type Page } from "@playwright/test";

// Sheet shares Dialog's mixins, so the full lifecycle (events, focus, cancel) is
// covered by dialog.spec. These tests verify Sheet's own identity, accessor, and
// that the shared Dismissable mixin works under [data-sp-sheet].

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
  <dialog class="sheet" data-sp-sheet="toggle: #trigger">
    <h2 class="sheet-title">Title</h2>
    <p class="sheet-description">Description</p>
    <button id="dismiss" data-sp-dismiss>Close</button>
  </dialog>`;

const STATIC = `
  <button id="trigger" class="btn">Open</button>
  <dialog class="sheet" data-sp-sheet="toggle: #trigger; static: true">
    <h2 class="sheet-title">Title</h2>
    <button id="dismiss" data-sp-dismiss>Close</button>
  </dialog>`;

const sheet = (page: Page) => page.locator("dialog.sheet");

test("opens from its trigger and settles to .shown", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(sheet(page)).toHaveClass(/shown/);
  expect(await sheet(page).evaluate((el: HTMLDialogElement) => el.open)).toBe(true);
});

test("closes from a dismiss button", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(sheet(page)).toHaveClass(/shown/);
  await page.click("#dismiss");
  await expect(sheet(page)).not.toHaveClass(/shown/);
});

test("closes on Escape", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(sheet(page)).toHaveClass(/shown/);
  await page.keyboard.press("Escape");
  await expect(sheet(page)).not.toHaveClass(/shown/);
});

test("sp.sheet(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("dialog.sheet") as HTMLElement;
    const s = (window as any).sp.sheet(el);
    return { show: typeof s.show, hide: typeof s.hide, toggle: typeof s.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
});

test("wires aria-labelledby and aria-describedby to the title and description", async ({ page }) => {
  await mount(page, BASIC);
  const s = sheet(page);
  const labelledby = await s.getAttribute("aria-labelledby");
  const describedby = await s.getAttribute("aria-describedby");
  expect(labelledby).toBeTruthy();
  expect(describedby).toBeTruthy();
  expect(await s.locator(".sheet-title").getAttribute("id")).toBe(labelledby);
  expect(await s.locator(".sheet-description").getAttribute("id")).toBe(describedby);
});

test.describe("static", () => {
  test("a backdrop click does not close it and fires sp-hideprevented", async ({ page }) => {
    await mount(page, STATIC);
    await page.click("#trigger");
    await expect(sheet(page)).toHaveClass(/shown/);

    const prevented = await page.evaluate(async () => {
      const el = document.querySelector("dialog.sheet") as HTMLElement;
      let fired = false;
      el.addEventListener("sp-hideprevented", () => (fired = true));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
      return fired;
    });

    expect(prevented).toBe(true);
    await expect(sheet(page)).toHaveClass(/shown/);
  });

  test("Escape still closes it", async ({ page }) => {
    await mount(page, STATIC);
    await page.click("#trigger");
    await expect(sheet(page)).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await expect(sheet(page)).not.toHaveClass(/shown/);
  });
});
