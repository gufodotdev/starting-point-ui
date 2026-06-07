import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    // The observer initializes the injected element on the next frame.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

// .shown is removed when the exit animation starts; el.close() (and the native
// focus return) only runs after it finishes. Wait for the real close.
async function waitClosed(page: Page) {
  await page.waitForFunction(
    () => !(document.querySelector("dialog.dialog") as HTMLDialogElement).open,
  );
}

const BASIC = `
  <button id="trigger" class="btn">Open</button>
  <dialog class="dialog" data-sp-dialog="toggle: #trigger">
    <h2 class="dialog-title">Title</h2>
    <p class="dialog-description">Description</p>
    <button id="dismiss" data-sp-dismiss>Close</button>
  </dialog>`;

const STATIC = `
  <button id="trigger" class="btn">Open</button>
  <dialog class="dialog" data-sp-dialog="toggle: #trigger; static: true">
    <h2 class="dialog-title">Title</h2>
    <button id="dismiss" data-sp-dismiss>Close</button>
  </dialog>`;

const dialog = (page: Page) => page.locator("dialog.dialog");

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

test("opens from its trigger and settles to .shown", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(dialog(page)).toHaveClass(/shown/);
  expect(await dialog(page).evaluate((el: HTMLDialogElement) => el.open)).toBe(true);
});

test("closes from a dismiss button", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(dialog(page)).toHaveClass(/shown/);
  await page.click("#dismiss");
  await expect(dialog(page)).not.toHaveClass(/shown/);
  expect(await dialog(page).evaluate((el: HTMLDialogElement) => el.open)).toBe(false);
});

test("closes on Escape", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(dialog(page)).toHaveClass(/shown/);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).not.toHaveClass(/shown/);
});

test("closes when the backdrop (the dialog element itself) is clicked", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(dialog(page)).toHaveClass(/shown/);
  // A backdrop click reports the <dialog> element itself as the target.
  await dialog(page).dispatchEvent("click");
  await expect(dialog(page)).not.toHaveClass(/shown/);
});

test("emits the lifecycle events in order", async ({ page }) => {
  await mount(page, BASIC);
  const events = await page.evaluate(async () => {
    const el = document.querySelector("dialog.dialog") as HTMLElement;
    const seen: string[] = [];
    for (const type of ["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]) {
      el.addEventListener(`sp:${type}`, () => seen.push(type));
    }
    (window as any).sp.dialog(el).show();
    await new Promise((r) => setTimeout(r, 400));
    (window as any).sp.dialog(el).hide();
    await new Promise((r) => setTimeout(r, 400));
    return seen;
  });
  expect(events).toEqual(["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]);
});

test("sp:beforeshow is cancelable", async ({ page }) => {
  await mount(page, BASIC);
  await page.evaluate(() => {
    const el = document.querySelector("dialog.dialog") as HTMLElement;
    el.addEventListener("sp:beforeshow", (e) => e.preventDefault());
  });
  await page.click("#trigger");
  await expect(dialog(page)).not.toHaveClass(/shown/);
});

test("sp.dialog(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("dialog.dialog") as HTMLElement;
    const d = (window as any).sp.dialog(el);
    return { show: typeof d.show, hide: typeof d.hide, toggle: typeof d.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
});

test.describe("static", () => {
  test("a backdrop click does not close it and fires sp:hideprevented", async ({ page }) => {
    await mount(page, STATIC);
    await page.click("#trigger");
    await expect(dialog(page)).toHaveClass(/shown/);

    const prevented = await page.evaluate(async () => {
      const el = document.querySelector("dialog.dialog") as HTMLElement;
      let fired = false;
      el.addEventListener("sp:hideprevented", () => (fired = true));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
      return fired;
    });

    expect(prevented).toBe(true);
    await expect(dialog(page)).toHaveClass(/shown/);
  });

  test("Escape still closes it", async ({ page }) => {
    await mount(page, STATIC);
    await page.click("#trigger");
    await expect(dialog(page)).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await expect(dialog(page)).not.toHaveClass(/shown/);
  });
});

// WAI-ARIA Dialog (Modal) pattern:
// https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
test.describe("WAI-ARIA compliance", () => {
  test("exposes role=dialog and aria-modal when open", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    const el = dialog(page);
    expect(await el.evaluate((d) => d.matches(":modal"))).toBe(true);
    expect(await el.evaluate((d) => d.getAttribute("role") ?? "dialog")).toBe("dialog");
  });

  test("wires aria-labelledby and aria-describedby to the title and description", async ({ page }) => {
    await mount(page, BASIC);
    const d = dialog(page);
    const labelledby = await d.getAttribute("aria-labelledby");
    const describedby = await d.getAttribute("aria-describedby");
    expect(labelledby).toBeTruthy();
    expect(describedby).toBeTruthy();
    expect(await d.locator(".dialog-title").getAttribute("id")).toBe(labelledby);
    expect(await d.locator(".dialog-description").getAttribute("id")).toBe(describedby);
  });

  test("toggles aria-expanded on the trigger", async ({ page }) => {
    await mount(page, BASIC);
    const trigger = page.locator("#trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await page.click("#trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.click("#dismiss");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("moves focus into the dialog on open", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    await expect(dialog(page)).toHaveClass(/shown/);
    const inside = await page.evaluate(() => {
      const d = document.querySelector("dialog.dialog")!;
      return d.contains(document.activeElement);
    });
    expect(inside).toBe(true);
  });

  // No Tab-cycle test: the native showModal() trap can't be driven by synthetic
  // Tab. The :modal assertion above is its precondition; cycling is verified by hand.

  test("returns focus to the trigger on close", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    await expect(dialog(page)).toHaveClass(/shown/);
    await page.click("#dismiss");
    await waitClosed(page);
    expect(await activeId(page)).toBe("trigger");
  });

  test("returns focus to the trigger after Escape", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    await expect(dialog(page)).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await waitClosed(page);
    expect(await activeId(page)).toBe("trigger");
  });
});
