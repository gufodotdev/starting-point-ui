import { test, expect, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const BAR = `
  <header class="navbar">
    <a id="brand" href="/" class="brand"><span class="brand-name">Acme Inc.</span></a>
    <button id="toggle" class="navbar-toggle">Menu</button>
    <div id="collapse" class="navbar-collapse" data-sp-toggle="#toggle">
      <nav class="navbar-nav"><a id="home" href="#" class="navbar-link">Home</a></nav>
      <div class="navbar-actions"><a id="login" href="#" class="btn">Log in</a></div>
    </div>
  </header>
  <p id="outside">outside</p>`;

test("the toggle opens the drawer in the top layer and closes it", async ({ page }) => {
  await mount(page, BAR);
  await expect(page.locator("#toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#toggle")).toHaveAttribute("aria-haspopup", "dialog");
  await expect(page.locator("#collapse")).toHaveAttribute("aria-labelledby", "toggle");
  await page.click("#toggle");
  await expect(page.locator("#collapse")).toHaveClass(/shown/);
  await expect(page.locator("#collapse")).toHaveAttribute("data-sp-open", "");
  await expect(page.locator("#collapse")).toHaveAttribute("popover", "manual");
  expect(await page.evaluate(() => document.getElementById("collapse")!.matches(":popover-open"))).toBe(true);
  await expect(page.locator("#toggle")).toHaveAttribute("aria-expanded", "true");
  await page.click("#toggle");
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
  await expect(page.locator("#collapse")).not.toHaveAttribute("popover", "manual");
});

test("repeats the brand and adds a close button at the top", async ({ page }) => {
  await mount(page, BAR);
  const header = page.locator("#collapse > .navbar-collapse-header");
  await expect(header.locator(".brand")).toHaveText("Acme Inc.");
  await expect(page.locator("#brand")).toHaveCount(1);
  await page.click("#toggle");
  await expect(page.locator("#collapse")).toHaveClass(/shown/);
  await header.locator(".navbar-close").click();
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
});

test("the open drawer is a dialog with focus inside, and gives focus back", async ({ page }) => {
  await mount(page, BAR);
  await page.click("#toggle");
  await expect(page.locator("#collapse")).toHaveAttribute("role", "dialog");
  await expect(page.locator("#collapse")).toHaveAttribute("aria-modal", "true");
  await expect.poll(() => page.evaluate(() => document.getElementById("collapse")!.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
  await expect(page.locator("#collapse")).not.toHaveAttribute("role", "dialog");
  await expect(page.locator("#toggle")).toBeFocused();
});

test("a press outside closes the drawer, a press inside keeps it", async ({ page }) => {
  await mount(page, BAR);
  await page.click("#toggle");
  await expect(page.locator("#collapse")).toHaveClass(/shown/);
  await page.dispatchEvent("#home", "pointerdown", { bubbles: true });
  await expect(page.locator("#collapse")).toHaveClass(/shown/);
  await page.dispatchEvent("#outside", "pointerdown", { bubbles: true });
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
});

test("following a link inside the drawer closes it", async ({ page }) => {
  await mount(page, BAR);
  await page.click("#toggle");
  await expect(page.locator("#collapse")).toHaveClass(/shown/);
  await page.click("#login");
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
});

test("growing past the breakpoint closes the drawer", async ({ page }) => {
  await mount(page, BAR);
  await page.click("#toggle");
  await expect(page.locator("#collapse")).toHaveClass(/shown/);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
});

test("above the breakpoint the drawer never opens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await mount(page, BAR);
  await page.click("#toggle");
  await page.waitForTimeout(100);
  await expect(page.locator("#collapse")).not.toHaveClass(/shown/);
});

test.describe("keyboard in the drawer", () => {
  const DRAWER = `
    <header class="navbar">
      <button id="toggle" class="navbar-toggle">Menu</button>
      <div id="collapse" class="navbar-collapse" data-sp-toggle="#toggle">
        <nav class="navbar-nav">
          <a id="home" href="#" class="navbar-link">Home</a>
          <button id="products" class="navbar-link">Products</button>
          <div id="panel" class="navbar-content" data-sp-toggle="#products"><a id="one" href="#" class="navbar-link">One</a><a id="two" href="#" class="navbar-link">Two</a></div>
          <a id="pricing" href="#" class="navbar-link">Pricing</a>
        </nav>
      </div>
    </header>`;
  const focused = (page: Page) => page.evaluate(() => document.activeElement?.id);

  test("Up and Down move through the rows, skipping a closed sub-menu and never opening it", async ({ page }) => {
    await mount(page, DRAWER);
    await page.click("#toggle");
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await page.focus("#home");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("products");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("pricing");
    await expect(page.locator("#panel")).not.toHaveClass(/show/);
    await page.keyboard.press("ArrowUp");
    expect(await focused(page)).toBe("products");
  });

  test("Down moves into an open sub-menu and on to the next row, Home and End jump", async ({ page }) => {
    await mount(page, DRAWER);
    await page.click("#toggle");
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await page.focus("#products");
    await page.keyboard.press("Enter");
    await expect(page.locator("#panel")).toHaveClass(/shown/);
    await expect(page.locator("#products")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("one");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("two");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("pricing");
    await page.keyboard.press("Home");
    expect(await focused(page)).toBe("home");
    await page.keyboard.press("End");
    expect(await focused(page)).toBe("pricing");
  });

  test("Down and Up on the toggle open the drawer on its first and last row", async ({ page }) => {
    await mount(page, DRAWER);
    await page.focus("#toggle");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await expect(page.locator("#home")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#collapse")).not.toHaveAttribute("data-sp-open");
    await expect(page.locator("#toggle")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await expect(page.locator("#pricing")).toBeFocused();
  });

  test("Escape on the row of an open sub-menu closes the sub-menu and keeps the drawer open", async ({ page }) => {
    await mount(page, DRAWER);
    await page.click("#toggle");
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await page.focus("#products");
    await page.keyboard.press("Enter");
    await expect(page.locator("#panel")).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#panel")).not.toHaveAttribute("data-sp-open");
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await expect(page.locator("#products")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#collapse")).not.toHaveAttribute("data-sp-open");
  });
});
