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

// The harness has no CSS, so tests reset the native popover centering inline.
const RESET = 'style="inset: auto; margin: 0"';
const MENU = `
  <header class="navbar">
    <nav class="navbar-nav">
      <a id="home" href="#" class="navbar-link active">Home</a>
      <button id="t1" class="navbar-link">Products</button>
      <div id="p1" class="navbar-content" ${RESET} data-sp-toggle="#t1"><a id="l1" href="#" class="navbar-link">One</a></div>
      <button id="t2" class="navbar-link">Company</button>
      <div id="p2" class="navbar-content" ${RESET} data-sp-toggle="#t2"><a href="#" class="navbar-link">Two</a></div>
    </nav>
  </header>
  <p id="outside">outside</p>
  <button id="after">after</button>`;

test("a trigger opens its panel in the top layer and wires aria", async ({ page }) => {
  await mount(page, MENU);
  await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "false");
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await expect(page.locator("#p1")).toHaveAttribute("data-sp-open", "");
  await expect(page.locator("#p1")).toHaveAttribute("popover", "manual");
  expect(await page.evaluate(() => document.getElementById("p1")!.matches(":popover-open"))).toBe(true);
  await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#t1")).toHaveAttribute("aria-controls", "p1");
});

test("the panel is anchored under its trigger", async ({ page }) => {
  await mount(page, MENU);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  const { trigger, panel, side } = await page.evaluate(() => ({
    trigger: document.getElementById("t1")!.getBoundingClientRect(),
    panel: document.getElementById("p1")!.getBoundingClientRect(),
    side: document.getElementById("p1")!.dataset.spSide,
  }));
  expect(side).toBe("bottom");
  expect(panel.top).toBeGreaterThanOrEqual(trigger.bottom);
  expect(Math.abs(panel.left - trigger.left)).toBeLessThan(2);
});

test("opening one panel closes the other", async ({ page }) => {
  await mount(page, MENU);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.click("#t2");
  await expect(page.locator("#p2")).toHaveClass(/shown/);
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  await expect(page.locator("#p1")).not.toHaveAttribute("popover", "manual");
});

test("a press outside closes the panel, a press inside keeps it", async ({ page }) => {
  await mount(page, MENU);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.dispatchEvent("#l1", "pointerdown", { bubbles: true });
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.dispatchEvent("#outside", "pointerdown", { bubbles: true });
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
});

test("focus leaving the panel closes it", async ({ page }) => {
  await mount(page, MENU);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.focus("#after");
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
});

test("Escape closes the panel and returns focus to the trigger", async ({ page }) => {
  await mount(page, MENU);
  await page.click("#t1");
  await page.focus("#l1");
  await page.keyboard.press("Escape");
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  await expect(page.locator("#t1")).toBeFocused();
});

test("an authored shown panel opens without JS help", async ({ page }) => {
  await mount(page, MENU.replace('id="p1" class="navbar-content"', 'id="p1" class="navbar-content shown"'));
  await expect(page.locator("#p1")).toHaveAttribute("data-sp-open", "");
  await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "true");
});

test("hovering the trigger opens the panel, and leaving both closes it", async ({ page }) => {
  await mount(page, MENU);
  await page.hover("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.hover("#l1");
  await page.waitForTimeout(150);
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.hover("#outside");
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
});

test("a click on the trigger of a hover-opened panel keeps it open", async ({ page }) => {
  await mount(page, MENU);
  await page.hover("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.click("#t1");
  await page.waitForTimeout(150);
  await expect(page.locator("#p1")).toHaveClass(/shown/);
});

test("a click-mode panel ignores hover", async ({ page }) => {
  await mount(page, MENU.replace('data-sp-toggle="#t1"', 'data-sp-toggle="#t1" data-sp-mode="click"'));
  await page.hover("#t1");
  await page.waitForTimeout(150);
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
});

test("ArrowDown on the trigger opens the panel and focuses its first link", async ({ page }) => {
  await mount(page, MENU);
  await page.focus("#t1");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await expect(page.locator("#l1")).toBeFocused();
});

test("following a link inside the panel closes it", async ({ page }) => {
  await mount(page, MENU);
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.click("#l1");
  await expect(page.locator("#p1")).not.toHaveClass(/shown/);
});

test.describe("folded into the drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const FOLDED = `
    <header class="navbar">
      <button id="toggle" class="navbar-toggle">Menu</button>
      <div id="collapse" class="navbar-collapse" data-sp-toggle="#toggle">
        <nav class="navbar-nav">
          <button id="t1" class="navbar-link">Products</button>
          <div id="p1" class="navbar-content" data-sp-toggle="#t1"><div class="grid"><a id="l1" href="#" class="navbar-link">One</a></div></div>
          <button id="t2" class="navbar-link">Solutions</button>
          <div id="p2" class="navbar-content" data-sp-toggle="#t2"><a href="#" class="navbar-link">Two</a></div>
        </nav>
      </div>
    </header>
    <p id="outside">outside</p>`;

  test("a folded panel unfolds in place, ignores hover and survives a press elsewhere", async ({ page }) => {
    await mount(page, FOLDED);
    await page.click("#toggle");
    await page.hover("#t1");
    await page.waitForTimeout(150);
    await expect(page.locator("#p1")).not.toHaveClass(/shown/);
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await expect(page.locator("#p1")).not.toHaveAttribute("popover", "manual");
    expect(await page.evaluate(() => document.getElementById("p1")!.style.getPropertyValue("--sp-collapse-height"))).toMatch(/px$/);
    await page.dispatchEvent("#outside", "pointerdown", { bubbles: true });
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.click("#t1");
    await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  });

  test("opening a folded panel closes the other one", async ({ page }) => {
    await mount(page, FOLDED);
    await page.click("#toggle");
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.click("#t2");
    await expect(page.locator("#p2")).toHaveClass(/shown/);
    await expect(page.locator("#p1")).not.toHaveClass(/show/);
    await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("a menu without a collapse below the breakpoint", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens its panel in the top layer under the bar and closes it on a press elsewhere", async ({ page }) => {
    await mount(
      page,
      `<header id="bar" class="navbar" style="display: block; height: 48px">
        <nav class="navbar-nav">
          <button id="t1" class="navbar-link">Products</button>
          <div id="p1" class="navbar-content" data-sp-toggle="#t1" style="inset: auto; margin: 0"><a href="#" class="navbar-link">One</a></div>
        </nav>
      </header>
      <p id="outside">outside</p>`,
    );
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    expect(await page.evaluate(() => document.getElementById("p1")!.matches(":popover-open"))).toBe(true);
    const { top, bottom, left } = await page.evaluate(() => ({
      top: document.getElementById("p1")!.style.top,
      left: document.getElementById("p1")!.style.left,
      bottom: document.getElementById("bar")!.getBoundingClientRect().bottom,
    }));
    expect(left).toBe("0px");
    expect(top).toBe(`${bottom}px`);
    await page.dispatchEvent("#outside", "pointerdown", { bubbles: true });
    await expect(page.locator("#p1")).not.toHaveClass(/shown/);
  });
});

test("hovering another trigger closes a panel opened by click", async ({ page }) => {
  await mount(
    page,
    `<nav class="navbar-nav">
      <button id="t1" class="navbar-link">One</button>
      <div id="p1" class="navbar-content" data-sp-toggle="#t1" style="inset: auto; margin: 0"><a href="#" class="navbar-link">A</a></div>
      <button id="t2" class="navbar-link">Two</button>
      <div id="p2" class="navbar-content" data-sp-toggle="#t2" style="inset: auto; margin: 0"><a href="#" class="navbar-link">B</a></div>
    </nav>`,
  );
  await page.click("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.hover("#t2");
  await expect(page.locator("#p2")).toHaveClass(/shown/);
  await expect(page.locator("#p1")).not.toHaveClass(/show/);
});

test("a panel reopened by hover closes on leave even though an earlier click left its trigger focused", async ({ page }) => {
  await mount(
    page,
    `<nav class="navbar-nav">
      <button id="t1" class="navbar-link">One</button>
      <div id="p1" class="navbar-content" data-sp-toggle="#t1" style="inset: auto; margin: 0"><a href="#" class="navbar-link">A</a></div>
      <button id="t2" class="navbar-link">Two</button>
      <div id="p2" class="navbar-content" data-sp-toggle="#t2" style="inset: auto; margin: 0"><a href="#" class="navbar-link">B</a></div>
    </nav>
    <p id="away" style="margin-top: 400px">away</p>`,
  );
  await page.click("#t1");
  await page.hover("#t2");
  await expect(page.locator("#p1")).not.toHaveClass(/show/);
  await page.hover("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.hover("#away");
  await expect(page.locator("#p1")).not.toHaveClass(/show/);
});

test("a click pins a hover-opened panel open after the pointer leaves", async ({ page }) => {
  await mount(
    page,
    `<nav class="navbar-nav">
      <button id="t1" class="navbar-link">One</button>
      <div id="p1" class="navbar-content" data-sp-toggle="#t1" style="inset: auto; margin: 0"><a href="#" class="navbar-link">A</a></div>
    </nav>
    <p id="away" style="margin-top: 400px">away</p>`,
  );
  await page.hover("#t1");
  await expect(page.locator("#p1")).toHaveClass(/shown/);
  await page.click("#t1");
  await page.hover("#away");
  await page.waitForTimeout(150);
  await expect(page.locator("#p1")).toHaveClass(/shown/);
});

test.describe("crossing the breakpoint", () => {
  const MENU_IN_COLLAPSE = `
    <header class="navbar">
      <button id="toggle" class="navbar-toggle">Menu</button>
      <div id="collapse" class="navbar-collapse" data-sp-toggle="#toggle">
        <nav class="navbar-nav">
          <button id="t1" class="navbar-link">Products</button>
          <div id="p1" class="navbar-content" data-sp-toggle="#t1" style="inset: auto; margin: 0"><a href="#" class="navbar-link">One</a></div>
        </nav>
      </div>
    </header>`;

  test("a floating panel closes once the viewport folds it into the drawer", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mount(page, MENU_IN_COLLAPSE);
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(page.locator("#p1")).not.toHaveClass(/show/);
    await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "false");
  });

  test("a folded panel closes once the viewport grows past the breakpoint", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await mount(page, MENU_IN_COLLAPSE);
    await page.click("#toggle");
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator("#p1")).not.toHaveClass(/show/);
    await expect(page.locator("#t1")).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("folded panels and the drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const DRAWER = `
    <header class="navbar">
      <button id="toggle" class="navbar-toggle">Menu</button>
      <div id="collapse" class="navbar-collapse" data-sp-toggle="#toggle">
        <nav class="navbar-nav">
          <button id="t1" class="navbar-link">Products</button>
          <div id="p1" class="navbar-content" data-sp-toggle="#t1"><a id="l1" href="#" class="navbar-link">One</a></div>
          <a id="after" href="#" class="navbar-link">Pricing</a>
        </nav>
      </div>
    </header>`;

  test("focus moving on through the drawer leaves an open sub-menu open", async ({ page }) => {
    await mount(page, DRAWER);
    await page.click("#toggle");
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.focus("#after");
    await page.waitForTimeout(50);
    await expect(page.locator("#p1")).toHaveClass(/shown/);
  });

  test("Escape inside a sub-menu closes it and keeps the drawer open", async ({ page }) => {
    await mount(page, DRAWER);
    await page.click("#toggle");
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.focus("#l1");
    await page.keyboard.press("Escape");
    await expect(page.locator("#p1")).not.toHaveClass(/show/);
    await expect(page.locator("#collapse")).toHaveClass(/shown/);
    await expect(page.locator("#t1")).toBeFocused();
  });
});

test.describe("keyboard", () => {
  const PANEL = `
    <nav class="navbar-nav">
      <button id="t1" class="navbar-link">Products</button>
      <div id="p1" class="navbar-content" data-sp-toggle="#t1" data-sp-mode="click" style="inset: auto; margin: 0">
        <a id="a" href="#" class="navbar-link">A</a>
        <a id="b" href="#" class="navbar-link">B</a>
        <a id="c" href="#" class="navbar-link">C</a>
      </div>
    </nav>`;
  const focused = (page: Page) => page.evaluate(() => document.activeElement?.id);

  test("Enter and Space open the panel and leave focus on the trigger", async ({ page }) => {
    await mount(page, PANEL);
    await page.focus("#t1");
    await page.keyboard.press("Enter");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await expect(page.locator("#t1")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#p1")).not.toHaveClass(/show/);
    await page.keyboard.press(" ");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await expect(page.locator("#t1")).toBeFocused();
  });

  test("all four arrows move through the links and wrap, Home and End jump", async ({ page }) => {
    await mount(page, PANEL);
    await page.focus("#t1");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("a");
    await page.keyboard.press("ArrowRight");
    expect(await focused(page)).toBe("b");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("c");
    await page.keyboard.press("ArrowDown");
    expect(await focused(page)).toBe("a");
    await page.keyboard.press("ArrowLeft");
    expect(await focused(page)).toBe("c");
    await page.keyboard.press("ArrowUp");
    expect(await focused(page)).toBe("b");
    await page.keyboard.press("Home");
    expect(await focused(page)).toBe("a");
    await page.keyboard.press("End");
    expect(await focused(page)).toBe("c");
  });

  test("ArrowUp on a closed trigger opens the panel at its last link", async ({ page }) => {
    await mount(page, PANEL);
    await page.focus("#t1");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    expect(await focused(page)).toBe("c");
  });
});

test.describe("moving across columns", () => {
  const link = (id: string) => `<a id="${id}" href="#" class="navbar-link" style="display: block; height: 30px">${id}</a>`;
  const panel = (content: string) => `
    <nav class="navbar-nav">
      <button id="t1" class="navbar-link">Products</button>
      <div id="p1" class="navbar-content" data-sp-toggle="#t1" data-sp-mode="click" style="inset: auto; margin: 0">${content}</div>
    </nav>`;
  const press = async (page: Page, from: string, key: string) => {
    await page.focus("#" + from);
    await page.keyboard.press(key);
    return page.evaluate(() => document.activeElement?.id);
  };
  const open = async (page: Page, html: string) => {
    await mount(page, panel(html));
    await page.click("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
  };

  test("a grid of columns: Left and Right move across at the same height", async ({ page }) => {
    await open(page, `<div style="display: grid; grid-template-columns: 120px 120px; gap: 8px">
      <div>${link("a")}${link("b")}${link("c")}</div>
      <div>${link("d")}${link("e")}</div>
    </div>`);
    expect(await press(page, "a", "ArrowRight")).toBe("d");
    expect(await press(page, "b", "ArrowRight")).toBe("e");
    expect(await press(page, "c", "ArrowRight")).toBe("e");
    expect(await press(page, "e", "ArrowLeft")).toBe("b");
    expect(await press(page, "d", "ArrowRight")).toBe("a");
    expect(await press(page, "a", "ArrowLeft")).toBe("d");
    expect(await press(page, "a", "ArrowDown")).toBe("b");
  });

  test("flat links wrapped by flexbox move across the same way", async ({ page }) => {
    await open(page, `<div style="display: flex; flex-wrap: wrap; width: 380px; gap: 8px">
      ${["a", "b", "c", "d", "e", "f"].map((id) => `<div style="width: 120px">${link(id)}</div>`).join("")}
    </div>`);
    expect(await press(page, "a", "ArrowRight")).toBe("b");
    expect(await press(page, "c", "ArrowRight")).toBe("a");
    expect(await press(page, "e", "ArrowLeft")).toBe("d");
    expect(await press(page, "d", "ArrowLeft")).toBe("f");
  });

  test("CSS columns work too", async ({ page }) => {
    await open(page, `<div style="columns: 2; column-gap: 8px; width: 260px">${link("a")}${link("b")}${link("c")}${link("d")}</div>`);
    expect(await press(page, "a", "ArrowRight")).toBe("c");
    expect(await press(page, "d", "ArrowLeft")).toBe("b");
  });

  test("in a single column Left and Right keep moving in order", async ({ page }) => {
    await open(page, `${link("a")}${link("b")}${link("c")}`);
    expect(await press(page, "a", "ArrowRight")).toBe("b");
    expect(await press(page, "b", "ArrowLeft")).toBe("a");
  });
});

test.describe("pinning and switching panels", () => {
  // Closed panels take no space, as with the real stylesheet.
  const TWO = `
    <style>.navbar-content:not([popover]) { display: none; }</style>
    <nav class="navbar-nav">
      <button id="t1" class="navbar-link">One</button>
      <div id="p1" class="navbar-content" data-sp-toggle="#t1" style="inset: auto; margin: 0"><a id="a" href="#" class="navbar-link">A</a></div>
      <button id="t2" class="navbar-link">Two</button>
      <div id="p2" class="navbar-content" data-sp-toggle="#t2" style="inset: auto; margin: 0"><a id="b" href="#" class="navbar-link">B</a></div>
    </nav>
    <p id="away" style="margin-top: 400px">away</p>`;

  test("a click pins a hover-opened panel even when the click leaves no focus on the trigger", async ({ page }) => {
    await mount(page, TWO);
    await page.hover("#t1");
    await expect(page.locator("#p1")).toHaveClass(/shown/);
    await page.click("#t1");
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.hover("#away");
    await page.waitForTimeout(150);
    await expect(page.locator("#p1")).toHaveClass(/shown/);
  });

  test("hovering another trigger with focus inside an open panel opens the new panel and keeps it open", async ({ page }) => {
    await mount(page, TWO);
    await page.focus("#t1");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#a")).toBeFocused();
    await page.hover("#t2");
    await expect(page.locator("#p2")).toHaveClass(/shown/);
    await page.waitForTimeout(150);
    await expect(page.locator("#p2")).toHaveClass(/shown/);
    await expect(page.locator("#p1")).not.toHaveAttribute("data-sp-open");
  });
});
