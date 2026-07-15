import { test, expect, type Page } from "@playwright/test";

// Breadcrumb is an accessibility-only enhancement: it derives ARIA from the
// classes so authors don't repeat boilerplate.

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
  <nav id="nav" class="breadcrumb">
    <a id="home" href="#" class="breadcrumb-item">Home</a>
    <span id="sep" class="breadcrumb-separator">/</span>
    <span id="el" class="breadcrumb-ellipsis">...</span>
    <span class="breadcrumb-separator">/</span>
    <a id="page" href="#" class="breadcrumb-item active">Current</a>
  </nav>`;

const AUTHORED = `
  <nav id="nav" class="breadcrumb" aria-label="You are here">
    <a id="page" href="#" class="breadcrumb-item active" aria-current="location">Current</a>
  </nav>`;

test("derives the breadcrumb ARIA from the classes", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#nav")).toHaveAttribute("aria-label", "breadcrumb");
  await expect(page.locator("#page")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#home")).not.toHaveAttribute("aria-current", "page");
  await expect(page.locator("#sep")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#sep")).toHaveAttribute("role", "presentation");
  await expect(page.locator("#el")).toHaveAttribute("aria-hidden", "true");
});

test("keeps aria-current in sync as .active moves between items", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#page")).toHaveAttribute("aria-current", "page");

  await page.evaluate(() => {
    document.getElementById("page")?.classList.remove("active");
    document.getElementById("home")?.classList.add("active");
  });

  await expect(page.locator("#home")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#page")).not.toHaveAttribute("aria-current", "page");
});

test("authored attributes win over the derived ones", async ({ page }) => {
  await mount(page, AUTHORED);
  await expect(page.locator("#nav")).toHaveAttribute("aria-label", "You are here");
});
