import { test, expect, type Page } from "@playwright/test";

// Avatar swaps to its fallback when the image fails to load.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const OK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8'/%3E%3C/svg%3E";

test("a failing image hides itself so the fallback can show", async ({ page }) => {
  await mount(page, `
    <span class="avatar">
      <img id="img" class="avatar-image" src="/definitely-broken.webp" alt="Sarah Johnson" />
      <span id="fb" class="avatar-fallback">SJ</span>
    </span>`);
  await expect(page.locator("#img")).toHaveAttribute("hidden", "");
});

test("a working image stays visible", async ({ page }) => {
  await mount(page, `
    <span class="avatar">
      <img id="img" class="avatar-image" src="${OK_SRC}" alt="Sarah Johnson" />
      <span id="fb" class="avatar-fallback">SJ</span>
    </span>`);
  await page.waitForTimeout(200);
  expect(await page.locator("#img").getAttribute("hidden")).toBe(null);
});
