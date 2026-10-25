import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const TALL = `<div style="height: 3000px"></div>`;

test("a static bar never gets the scrolled state", async ({ page }) => {
  await mount(page, `<header id="bar" class="navbar"></header>` + TALL);
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(100);
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);
  expect(await page.evaluate(() => document.getElementById("bar")?.previousElementSibling)).toBeNull();
});

test("a sticky bar is marked scrolled once content scrolls under it", async ({ page }) => {
  await mount(page, `<header id="bar" class="navbar" style="position: sticky; top: 0"></header>` + TALL);
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);

  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator("#bar")).toHaveClass(/scrolled/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);
});

test("a fixed bar inside a section is marked scrolled too", async ({ page }) => {
  await mount(
    page,
    `<section><header id="bar" class="navbar" style="position: fixed; top: 0"></header>${TALL}</section>`,
  );
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);

  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator("#bar")).toHaveClass(/scrolled/);
});

test("a bar further down the page is marked scrolled only past its own place", async ({ page }) => {
  await mount(
    page,
    `<div style="height: 400px"></div><header id="bar" class="navbar" style="position: sticky; top: 0"></header>` + TALL,
  );
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(100);
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);

  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator("#bar")).toHaveClass(/scrolled/);
});

test("works inside a positioned scrolling container", async ({ page }) => {
  await mount(
    page,
    `<div id="scroller" style="position: relative; height: 300px; overflow: auto">
       <header id="bar" class="navbar" style="position: sticky; top: 0"></header>${TALL}
     </div>`,
  );
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);

  await page.evaluate(() => document.getElementById("scroller")!.scrollTo(0, 500));
  await expect(page.locator("#bar")).toHaveClass(/scrolled/);
});

test("removes its sentinel when the bar is removed", async ({ page }) => {
  await mount(page, `<header id="bar" class="navbar" style="position: sticky; top: 0"></header>` + TALL);
  const gone = await page.evaluate(async () => {
    const bar = document.getElementById("bar")!;
    const sentinel = bar.previousElementSibling!;
    bar.remove();
    await new Promise((r) => setTimeout(r, 50));
    return !sentinel.isConnected;
  });
  expect(gone).toBe(true);
});

const MENU = `
  <header class="navbar">
    <nav class="navbar-nav">
      <a id="home" href="#" class="navbar-link active">Home</a>
      <a id="inbox" href="#" class="navbar-link">Inbox</a>
    </nav>
  </header>`;

test("announces the active link as the current page and follows the class", async ({ page }) => {
  await mount(page, MENU);
  await expect(page.locator("#home")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#inbox")).not.toHaveAttribute("aria-current", "page");

  await page.evaluate(() => {
    document.getElementById("home")?.classList.remove("active");
    document.getElementById("inbox")?.classList.add("active");
  });

  await expect(page.locator("#inbox")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#home")).not.toHaveAttribute("aria-current", "page");
});

test("an overlay authored dark hands the theme to its pieces until content scrolls under it", async ({ page }) => {
  await mount(
    page,
    `<header id="bar" class="navbar navbar-overlay dark" style="position: fixed; top: 0">
      <a id="brand" href="#" class="brand">Acme</a>
      <div class="navbar-collapse">
        <nav class="navbar-nav">
          <button id="t1" class="navbar-link">Products</button>
          <div id="p1" class="navbar-content" data-sp-toggle="#t1"><a href="#" class="navbar-link">One</a></div>
        </nav>
        <div id="actions" class="navbar-actions"><a href="#" class="btn">Log in</a></div>
      </div>
    </header>` + TALL,
  );
  await expect(page.locator("#bar")).not.toHaveClass(/\bdark\b/);
  for (const id of ["#brand", "#t1", "#actions"]) await expect(page.locator(id)).toHaveClass(/\bdark\b/);
  await expect(page.locator("#p1")).not.toHaveClass(/\bdark\b/);

  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator("#bar")).toHaveClass(/scrolled/);
  for (const id of ["#brand", "#t1", "#actions"]) await expect(page.locator(id)).not.toHaveClass(/\bdark\b/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator("#brand")).toHaveClass(/\bdark\b/);
});

test("a bar authored dark without the overlay stays dark", async ({ page }) => {
  await mount(page, `<header id="bar" class="navbar dark" style="position: sticky; top: 0"><a id="brand" href="#">Acme</a></header>` + TALL);
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(page.locator("#bar")).toHaveClass(/scrolled/);
  await expect(page.locator("#bar")).toHaveClass(/\bdark\b/);
  await expect(page.locator("#brand")).not.toHaveClass(/\bdark\b/);
});

test("an overlay that is not sticky keeps its pieces dark as it scrolls away", async ({ page }) => {
  await mount(
    page,
    `<header id="bar" class="navbar navbar-overlay dark" style="position: absolute; top: 0">
      <a id="brand" href="#" class="brand">Acme</a>
      <nav class="navbar-nav">
        <button id="t1" class="navbar-link">Products</button>
        <div id="p1" class="navbar-content" data-sp-toggle="#t1"><a href="#" class="navbar-link">One</a></div>
      </nav>
    </header>` + TALL,
  );
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(100);
  await expect(page.locator("#bar")).not.toHaveClass(/scrolled/);
  await expect(page.locator("#brand")).toHaveClass(/\bdark\b/);
  await expect(page.locator("#t1")).toHaveClass(/\bdark\b/);
  await expect(page.locator("#p1")).not.toHaveClass(/\bdark\b/);
});

test.describe("keyboard in the bar", () => {
  const BAR = (dir = "ltr") => `
    <header class="navbar" dir="${dir}">
      <nav class="navbar-nav">
        <a id="home" href="#" class="navbar-link">Home</a>
        <button id="products" class="navbar-link">Products</button>
        <div id="panel" class="navbar-content" data-sp-toggle="#products"><a id="inner" href="#" class="navbar-link">One</a></div>
        <a id="pricing" href="#" class="navbar-link">Pricing</a>
      </nav>
    </header>`;
  const focused = (page: Page) => page.evaluate(() => document.activeElement?.id);

  test("Left and Right move between the top-level items and stop at the ends", async ({ page }) => {
    await mount(page, BAR());
    await page.focus("#home");
    await page.keyboard.press("ArrowRight");
    expect(await focused(page)).toBe("products");
    await page.keyboard.press("ArrowRight");
    expect(await focused(page)).toBe("pricing");
    await page.keyboard.press("ArrowRight");
    expect(await focused(page)).toBe("pricing");
    await page.keyboard.press("ArrowLeft");
    expect(await focused(page)).toBe("products");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    expect(await focused(page)).toBe("home");
  });

  test("the arrows follow the reading direction in right-to-left", async ({ page }) => {
    await mount(page, BAR("rtl"));
    await page.focus("#home");
    await page.keyboard.press("ArrowLeft");
    expect(await focused(page)).toBe("products");
    await page.keyboard.press("ArrowRight");
    expect(await focused(page)).toBe("home");
  });
});
