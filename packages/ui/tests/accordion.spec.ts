import { test, expect, type Page } from "@playwright/test";

// The accordion is a thin coordinator over plain collapsibles: each panel is a
// Collapsible toggled by its own trigger (lifecycle covered by collapsible.spec).
// These tests verify the accordion's two jobs: single-open coordination and the
// region ARIA wiring it layers on top.

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
  <div id="p1" class="collapsible" data-sp-toggle="#t1"><div class="collapsible-content">First</div></div>
  <h3><button id="t2" class="accordion-trigger">Two</button></h3>
  <div id="p2" class="collapsible" data-sp-toggle="#t2"><div class="collapsible-content">Second</div></div>
  <h3><button id="t3" class="accordion-trigger">Three</button></h3>
  <div id="p3" class="collapsible" data-sp-toggle="#t3"><div class="collapsible-content">Third</div></div>`;

const BASIC = `<div id="acc" class="accordion">${items}</div>`;

const MULTIPLE = `<div id="acc" class="accordion" data-sp-multiple>${items}</div>`;

const PRESHOWN = `
  <div id="acc" class="accordion">
    <h3><button id="t1" class="accordion-trigger">One</button></h3>
    <div id="p1" class="collapsible" data-sp-toggle="#t1"><div class="collapsible-content">First</div></div>
    <h3><button id="t2" class="accordion-trigger" aria-expanded="true">Two</button></h3>
    <div id="p2" class="collapsible shown" data-sp-toggle="#t2"><div class="collapsible-content">Second</div></div>
  </div>`;

const NESTED = `
  <div id="outer" class="accordion">
    <h3><button id="t1" class="accordion-trigger">One</button></h3>
    <div id="p1" class="collapsible" data-sp-toggle="#t1"><div class="collapsible-content">First</div></div>
    <div id="inner" class="accordion">
      <h3><button id="t2" class="accordion-trigger">Two</button></h3>
      <div id="p2" class="collapsible" data-sp-toggle="#t2"><div class="collapsible-content">Second</div></div>
    </div>
  </div>`;

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

test("opening a panel closes an authored .shown sibling", async ({ page }) => {
  await mount(page, PRESHOWN);
  await expect(page.locator("#p2")).toHaveClass(/shown/);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await expect(page.locator("#p2")).not.toHaveClass(/shown/);
});

test("only coordinates panels in its own accordion", async ({ page }) => {
  await mount(page, NESTED);
  await page.click("#t1");
  // #p2 lives in the nested accordion, so opening it must not close #p1.
  await page.click("#t2");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await expect(page.locator("#p2")).toHaveClass(/shown/);
});

// WAI-ARIA Accordion pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
test.describe("WAI-ARIA compliance", () => {
  test("labels each panel as a region named by its trigger", async ({ page }) => {
    await mount(page, BASIC);
    for (const [trigger, panel] of [["t1", "p1"], ["t2", "p2"], ["t3", "p3"]]) {
      await expect(page.locator(`#${panel}`)).toHaveAttribute("role", "region");
      await expect(page.locator(`#${panel}`)).toHaveAttribute("aria-labelledby", trigger);
    }
  });

  test("the collapsible wires aria-expanded and aria-controls on the trigger", async ({ page }) => {
    await mount(page, BASIC);
    await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#t1")).toHaveAttribute("aria-controls", "p1");
    await page.click("#t1");
    await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "true");
  });

  test("Enter and Space on the trigger toggle the panel", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("Enter");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.keyboard.press("Space");
    await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  });
});
