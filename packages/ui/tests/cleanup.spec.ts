import { test, expect, type Page } from "@playwright/test";

// Verifies that removing a component from the DOM disposes it and removes every
// listener it attached to document — so a dynamic app (e.g. React navigating
// back and forth) doesn't accumulate dead listeners on detached elements.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

// Count document.addEventListener / removeEventListener calls.
async function instrument(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __adds: number; __removes: number };
    w.__adds = 0;
    w.__removes = 0;
    const add = document.addEventListener.bind(document);
    const rem = document.removeEventListener.bind(document);
    document.addEventListener = ((...a: unknown[]) => {
      w.__adds++;
      return (add as (...x: unknown[]) => void)(...a);
    }) as typeof document.addEventListener;
    document.removeEventListener = ((...a: unknown[]) => {
      w.__removes++;
      return (rem as (...x: unknown[]) => void)(...a);
    }) as typeof document.removeEventListener;
  });
}

function counts(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __adds: number; __removes: number };
    return { adds: w.__adds, removes: w.__removes };
  });
}

async function setBody(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 30));
  }, html);
}

test("popover removes its document listeners when detached", async ({ page }) => {
  await instrument(page);

  await setBody(
    page,
    `<button id="t">x</button><div id="p" class="popover" data-sp-toggle="#t"></div>`,
  );
  const mounted = await counts(page);
  // Escapable (keydown) + ClickOutsideHide (pointerdown) attach to document.
  expect(mounted.adds).toBeGreaterThanOrEqual(2);

  await setBody(page, "");
  const removed = await counts(page);
  // Every added listener is removed on dispose — no net leak.
  expect(removed.removes).toBe(removed.adds);
});

test("repeated mount/unmount does not accumulate listeners", async ({ page }) => {
  await instrument(page);

  for (let i = 0; i < 5; i++) {
    await setBody(
      page,
      `<button id="t">x</button><div id="p" class="popover" data-sp-toggle="#t"></div>`,
    );
    await setBody(page, "");
  }

  const { adds, removes } = await counts(page);
  expect(removes).toBe(adds);
});

test("a detached popover's listeners no longer fire", async ({ page }) => {
  await setBody(
    page,
    `<button id="t">x</button><div id="p" class="popover" data-sp-toggle="#t"></div>`,
  );
  await page.click("#t");
  await expect(page.locator("#p")).toHaveClass(/shown/);

  // Detach and re-add fresh markup; the old instance must not react to Escape.
  await setBody(
    page,
    `<button id="t2">y</button><div id="p2" class="popover" data-sp-toggle="#t2"></div>`,
  );
  // No #p anymore; pressing Escape should not throw or affect anything.
  await page.keyboard.press("Escape");
  await expect(page.locator("#p")).toHaveCount(0);
});
