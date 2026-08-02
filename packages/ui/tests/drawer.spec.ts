import { test, expect, type Page } from "@playwright/test";

// Drawer shares Dialog's mixins, so the full modal lifecycle is covered by
// dialog.spec. These tests verify the drawer's own identity plus the drag
// behavior: dismiss past the threshold, spring back under it, snap points,
// and nested stacking.

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
  <dialog class="drawer" data-sp-toggle="#trigger">
    <div class="drawer-panel">
      <h2 class="drawer-title">Title</h2>
      <p class="drawer-description">Description</p>
      <button id="inside" class="btn">Inside</button>
      <button id="dismiss" data-sp-dismiss>Close</button>
    </div>
  </dialog>`;

const SNAPS = `
  <button id="trigger" class="btn">Open</button>
  <dialog class="drawer" data-sp-toggle="#trigger" data-sp-snap-points="0.5,1">
    <div class="drawer-panel">
      <h2 class="drawer-title">Title</h2>
      <p style="height: 200px">Tall content</p>
    </div>
  </dialog>`;

const NESTED = `
  <button id="trigger" class="btn">Open</button>
  <dialog id="parent" class="drawer" data-sp-toggle="#trigger">
    <div class="drawer-panel">
      <h2 class="drawer-title">Parent</h2>
      <button id="nested-trigger" class="btn">More</button>
    </div>
  </dialog>
  <dialog id="child" class="drawer" data-sp-toggle="#nested-trigger">
    <div class="drawer-panel">
      <h2 class="drawer-title">Child</h2>
      <button id="child-dismiss" data-sp-dismiss>Close</button>
    </div>
  </dialog>`;

const drawer = (page: Page) => page.locator("dialog.drawer");

// Synthetic pointer sequence on the panel; clientY values walk the drag.
async function drag(page: Page, steps: number[], selector = ".drawer-panel") {
  await page.evaluate(
    ({ steps, selector }) => {
      const panel = document.querySelector(selector) as HTMLElement;
      const fire = (type: string, clientY: number) =>
        panel.dispatchEvent(
          new PointerEvent(type, { clientY, pointerId: 1, bubbles: true }),
        );
      fire("pointerdown", steps[0]);
      for (const y of steps.slice(1)) fire("pointermove", y);
      fire("pointerup", steps[steps.length - 1]);
    },
    { steps, selector },
  );
}

test("opens from its trigger and settles to .shown", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  expect(await drawer(page).evaluate((el: HTMLDialogElement) => el.open)).toBe(
    true,
  );
});

test("settles an authored .shown drawer into a real modal", async ({
  page,
}) => {
  await mount(page, BASIC.replace('class="drawer"', 'class="drawer shown"'));
  await expect(drawer(page)).toHaveClass(/shown/);
  expect(
    await drawer(page).evaluate(
      (el: HTMLDialogElement) => el.open && el.matches(":modal"),
    ),
  ).toBe(true);
});

test("closes from a dismiss button and on Escape", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await page.click("#dismiss");
  await expect(drawer(page)).not.toHaveClass(/shown/);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await page.keyboard.press("Escape");
  await expect(drawer(page)).not.toHaveClass(/shown/);
});

test("sp.drawer(el) returns the instance with the public API", async ({
  page,
}) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("dialog.drawer") as HTMLElement;
    const d = (window as any).sp.drawer(el);
    return {
      show: typeof d.show,
      hide: typeof d.hide,
      toggle: typeof d.toggle,
    };
  });
  expect(api).toEqual({
    show: "function",
    hide: "function",
    toggle: "function",
  });
});

test("a long downward drag dismisses the drawer", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await drag(page, [100, 200, 300, 400]);
  await expect(drawer(page)).not.toHaveClass(/shown/, { timeout: 3000 });
  expect(await drawer(page).evaluate((el: HTMLDialogElement) => el.open)).toBe(
    false,
  );
});

test("a short drag springs back and stays open", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await drag(page, [100, 102, 103]);
  await page.waitForTimeout(700);
  await expect(drawer(page)).toHaveClass(/shown/);
});

test("a drag starting on an interactive element is ignored", async ({
  page,
}) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await page.evaluate(() => {
    const btn = document.querySelector("#inside") as HTMLElement;
    const fire = (type: string, clientY: number) =>
      btn.dispatchEvent(
        new PointerEvent(type, { clientY, pointerId: 1, bubbles: true }),
      );
    fire("pointerdown", 100);
    fire("pointermove", 300);
    fire("pointerup", 400);
  });
  await page.waitForTimeout(700);
  await expect(drawer(page)).toHaveClass(/shown/);
});

test("a touch drag may start on an interactive element", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await page.evaluate(() => {
    const btn = document.querySelector("#inside") as HTMLElement;
    const fire = (type: string, clientY: number) =>
      btn.dispatchEvent(
        new PointerEvent(type, {
          clientY,
          pointerId: 1,
          pointerType: "touch",
          bubbles: true,
        }),
      );
    fire("pointerdown", 100);
    fire("pointermove", 200);
    fire("pointermove", 300);
    fire("pointerup", 400);
  });
  await expect(drawer(page)).not.toHaveClass(/shown/, { timeout: 3000 });
});

test("a touch tap on an interactive element does not engage the drag", async ({
  page,
}) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await page.evaluate(() => {
    const btn = document.querySelector("#inside") as HTMLElement;
    const fire = (type: string, clientY: number) =>
      btn.dispatchEvent(
        new PointerEvent(type, {
          clientY,
          pointerId: 1,
          pointerType: "touch",
          bubbles: true,
        }),
      );
    fire("pointerdown", 100);
    fire("pointermove", 103);
    fire("pointerup", 103);
  });
  await page.waitForTimeout(300);
  await expect(drawer(page)).toHaveClass(/shown/);
  expect(
    await drawer(page).evaluate((el) => el.classList.contains("dragging")),
  ).toBe(false);
});

test("pointercancel springs back instead of dismissing", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await page.evaluate(() => {
    const panel = document.querySelector(".drawer-panel") as HTMLElement;
    const fire = (type: string, clientY: number) =>
      panel.dispatchEvent(
        new PointerEvent(type, { clientY, pointerId: 1, bubbles: true }),
      );
    fire("pointerdown", 100);
    fire("pointermove", 400);
    fire("pointercancel", 400);
  });
  await page.waitForTimeout(700);
  await expect(drawer(page)).toHaveClass(/shown/);
});

test("snap points: opens translated to the first snap", async ({ page }) => {
  await mount(page, SNAPS);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  const transform = await page.evaluate(
    () =>
      (document.querySelector(".drawer-panel") as HTMLElement).style.transform,
  );
  expect(transform).toContain("translate3d");
});

test("snap points: dragging toward open settles on the full snap", async ({
  page,
}) => {
  await mount(page, SNAPS);
  await page.click("#trigger");
  await expect(drawer(page)).toHaveClass(/shown/);
  await drag(page, [400, 300, 100, 0]);
  await page.waitForTimeout(700);
  const state = await page.evaluate(() => {
    const el = document.querySelector("dialog.drawer") as HTMLElement;
    const d = (window as any).sp.drawer(el);
    return {
      active: d._activeSnap,
      shown: el.classList.contains("shown"),
    };
  });
  expect(state.shown).toBe(true);
  expect(state.active).toBe(1);
});

test("nested: the parent drawer is marked stacked while the child is open", async ({
  page,
}) => {
  await mount(page, NESTED);
  await page.click("#trigger");
  await expect(page.locator("#parent")).toHaveClass(/shown/);
  await page.click("#nested-trigger");
  await expect(page.locator("#child")).toHaveClass(/shown/);
  await expect(page.locator("#parent")).toHaveClass(/drawer-stacked/);
  await page.click("#child-dismiss");
  await expect(page.locator("#child")).not.toHaveClass(/shown/);
  await expect(page.locator("#parent")).not.toHaveClass(/drawer-stacked/);
});
