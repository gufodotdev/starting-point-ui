import { test, expect, type Page } from "@playwright/test";

// The navbar menu is presentational except that the authored .active item is
// announced as the current page via aria-current.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const NAVBAR = `
  <nav class="navbar-menu">
    <a id="home" href="#" class="navbar-menu-item active">Home</a>
    <a id="inbox" href="#" class="navbar-menu-item">Inbox</a>
  </nav>`;

test("the active item is announced as the current page", async ({ page }) => {
  await mount(page, NAVBAR);
  await expect(page.locator("#home")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#inbox")).not.toHaveAttribute("aria-current", "page");
});

test("aria-current follows the active class", async ({ page }) => {
  await mount(page, NAVBAR);
  await page.evaluate(() => {
    document.querySelector("#home")!.classList.remove("active");
    document.querySelector("#inbox")!.classList.add("active");
  });
  await expect(page.locator("#inbox")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#home")).not.toHaveAttribute("aria-current", "page");
});
