import { test, expect, type Page } from "@playwright/test";

// Accordion panels are Collapsible instances, so the expand/collapse lifecycle
// is covered by collapsible.spec. These tests verify the accordion-specific
// wiring: index pairing, single-open coordination, and header navigation.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const items = `
  <h3><button id="t1" class="accordion-trigger">One</button></h3>
  <div id="p1" class="accordion-panel"><div class="accordion-content">First</div></div>
  <h3><button id="t2" class="accordion-trigger">Two</button></h3>
  <div id="p2" class="accordion-panel"><div class="accordion-content">Second</div></div>
  <h3><button id="t3" class="accordion-trigger">Three</button></h3>
  <div id="p3" class="accordion-panel"><div class="accordion-content">Third</div></div>`;

const BASIC = `<div id="acc" class="accordion" data-sp-accordion>${items}</div>`;

const MULTIPLE = `<div id="acc" class="accordion" data-sp-accordion="multiple: true">${items}</div>`;

const DISABLED = `
  <div id="acc" class="accordion" data-sp-accordion>
    <h3><button id="t1" class="accordion-trigger">One</button></h3>
    <div id="p1" class="accordion-panel"><div class="accordion-content">First</div></div>
    <h3><button id="t2" class="accordion-trigger" disabled>Two</button></h3>
    <div id="p2" class="accordion-panel"><div class="accordion-content">Second</div></div>
    <h3><button id="t3" class="accordion-trigger">Three</button></h3>
    <div id="p3" class="accordion-panel"><div class="accordion-content">Third</div></div>
  </div>`;

const PRESHOWN = `
  <div id="acc" class="accordion" data-sp-accordion>
    <h3><button id="t1" class="accordion-trigger">One</button></h3>
    <div id="p1" class="accordion-panel"><div class="accordion-content">First</div></div>
    <h3><button id="t2" class="accordion-trigger" aria-expanded="true">Two</button></h3>
    <div id="p2" class="accordion-panel shown"><div class="accordion-content">Second</div></div>
  </div>`;

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

test("opens a panel from its trigger", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
});

test("opening a panel closes the open one", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.click("#t2");
  await expect(page.locator("#p2")).toHaveClass(/shown/);
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "false");
});

test("clicking the open trigger closes its panel", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.click("#t1");
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
});

test("multiple keeps other panels open", async ({ page }) => {
  await mount(page, MULTIPLE);
  await page.click("#t1");
  await page.click("#t2");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await expect(page.locator("#p2")).toHaveClass(/shown/);
});

test("settles an authored .shown panel", async ({ page }) => {
  await mount(page, PRESHOWN);
  await expect(page.locator("#p2")).toHaveClass(/shown/);
  await expect(page.locator("#t2")).toHaveAttribute("aria-expanded", "true");
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await expect(page.locator("#p2")).not.toHaveClass(/shown/);
});

test("panel lifecycle events bubble to the container", async ({ page }) => {
  await mount(page, BASIC);
  const shownTarget = await page.evaluate(() => {
    return new Promise((resolve) => {
      document.querySelector("#acc")!.addEventListener("sp-shown", (e) => {
        resolve((e.target as HTMLElement).id);
      });
      (document.querySelector("#t1") as HTMLElement).click();
    });
  });
  expect(shownTarget).toBe("p1");
});

// WAI-ARIA Accordion pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
test.describe("WAI-ARIA compliance", () => {
  test("wires triggers and panels automatically", async ({ page }) => {
    await mount(page, BASIC);
    for (const [trigger, panel] of [["t1", "p1"], ["t2", "p2"], ["t3", "p3"]]) {
      await expect(page.locator(`#${trigger}`)).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator(`#${trigger}`)).toHaveAttribute("aria-controls", panel);
      await expect(page.locator(`#${panel}`)).toHaveAttribute("role", "region");
      await expect(page.locator(`#${panel}`)).toHaveAttribute("aria-labelledby", trigger);
    }
  });

  test("Enter and Space toggle the focused header's panel", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("Enter");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.keyboard.press("Space");
    await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  });

  test("arrow keys move focus between headers without toggling", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("t2");
    await expect(page.locator("#p2")).not.toHaveClass(/shown/);

    await page.keyboard.press("ArrowUp");
    expect(await activeId(page)).toBe("t1");
    await page.keyboard.press("End");
    expect(await activeId(page)).toBe("t3");
    await page.keyboard.press("Home");
    expect(await activeId(page)).toBe("t1");
  });

  test("arrow navigation skips disabled headers", async ({ page }) => {
    await mount(page, DISABLED);
    await page.focus("#t1");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("t3");
  });
});
