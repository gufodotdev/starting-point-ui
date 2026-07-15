import { test, expect, type Page } from "@playwright/test";

// Pagination is an accessibility-only enhancement: it labels the nav, mirrors
// the authored .active class onto aria-current="page", and hides ellipses
// from assistive technology.

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
  <nav id="nav" class="pagination">
    <a id="prev" href="#" class="pagination-item pagination-previous">Previous</a>
    <a id="p1" href="#" class="pagination-item">1</a>
    <a id="p2" href="#" class="pagination-item active">2</a>
    <a id="p3" href="#" class="pagination-item">3</a>
    <span id="el" class="pagination-ellipsis">...</span>
    <a id="next" href="#" class="pagination-item pagination-next">Next</a>
  </nav>`;

const AUTHORED = `
  <nav id="nav" class="pagination" aria-label="search results pages">
    <a id="prev" href="#" class="pagination-item pagination-previous" aria-label="Back">Previous</a>
    <a id="p1" href="#" class="pagination-item active">1</a>
  </nav>`;

test("derives the pagination ARIA from the classes", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#nav")).toHaveAttribute("aria-label", "pagination");
  await expect(page.locator("#p2")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#p1")).not.toHaveAttribute("aria-current", "page");
  await expect(page.locator("#prev")).toHaveAttribute("aria-label", "Go to previous page");
  await expect(page.locator("#next")).toHaveAttribute("aria-label", "Go to next page");
  await expect(page.locator("#el")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#el")).toHaveAttribute("role", "presentation");
});

test("keeps aria-current in sync as .active moves between items", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#p2")).toHaveAttribute("aria-current", "page");

  await page.evaluate(() => {
    document.getElementById("p2")?.classList.remove("active");
    document.getElementById("p3")?.classList.add("active");
  });

  await expect(page.locator("#p3")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#p2")).not.toHaveAttribute("aria-current", "page");
});

test("authored attributes win over the derived ones", async ({ page }) => {
  await mount(page, AUTHORED);
  await expect(page.locator("#nav")).toHaveAttribute("aria-label", "search results pages");
  await expect(page.locator("#prev")).toHaveAttribute("aria-label", "Back");
});
