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

const BASIC = `
  <div id="root" data-sp-tabs>
    <div class="tab-list" aria-label="Example">
      <button id="t1" class="tab">One</button>
      <button id="t2" class="tab">Two</button>
      <button id="t3" class="tab">Three</button>
    </div>
    <div id="p1" class="tab-panel">Panel one</div>
    <div id="p2" class="tab-panel">Panel two</div>
    <div id="p3" class="tab-panel">Panel three</div>
  </div>`;

const PRESELECTED = `
  <div id="root" data-sp-tabs>
    <div class="tab-list" aria-label="Example">
      <button id="t1" class="tab">One</button>
      <button id="t2" class="tab active">Two</button>
    </div>
    <div id="p1" class="tab-panel">Panel one</div>
    <div id="p2" class="tab-panel active">Panel two</div>
  </div>`;

const DISABLED = `
  <div id="root" data-sp-tabs>
    <div class="tab-list" aria-label="Example">
      <button id="t1" class="tab">One</button>
      <button id="t2" class="tab" disabled>Two</button>
      <button id="t3" class="tab">Three</button>
    </div>
    <div id="p1" class="tab-panel">Panel one</div>
    <div id="p2" class="tab-panel">Panel two</div>
    <div id="p3" class="tab-panel">Panel three</div>
  </div>`;

const VERTICAL = `
  <div id="root" data-sp-tabs="orientation: vertical">
    <div class="tab-list" aria-label="Example">
      <button id="t1" class="tab">One</button>
      <button id="t2" class="tab">Two</button>
    </div>
    <div id="p1" class="tab-panel">Panel one</div>
    <div id="p2" class="tab-panel">Panel two</div>
  </div>`;

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

// Authored .active is the contract (correct first paint without JS); selecting
// the first tab is only a fallback so the tablist stays keyboard-reachable.
test("falls back to the first tab when none is authored active", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#t1")).toHaveClass(/active/);
  await expect(page.locator("#p1")).toHaveClass(/active/);
  await expect(page.locator("#t2")).not.toHaveClass(/active/);
  await expect(page.locator("#p2")).not.toHaveClass(/active/);
});

test("respects an authored active tab", async ({ page }) => {
  await mount(page, PRESELECTED);
  await expect(page.locator("#t2")).toHaveClass(/active/);
  await expect(page.locator("#p2")).toHaveClass(/active/);
  await expect(page.locator("#t1")).not.toHaveClass(/active/);
});

test("selects a tab and its panel on click", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#t2");
  await expect(page.locator("#t2")).toHaveClass(/active/);
  await expect(page.locator("#p2")).toHaveClass(/active/);
  await expect(page.locator("#t1")).not.toHaveClass(/active/);
  await expect(page.locator("#p1")).not.toHaveClass(/active/);
});

test("emits sp-beforechange (cancelable) and sp-change with the tab", async ({ page }) => {
  await mount(page, BASIC);
  const changed = await page.evaluate(() => {
    return new Promise((resolve) => {
      const root = document.querySelector("#root")!;
      root.addEventListener("sp-change", (e) => {
        resolve(((e as CustomEvent).detail.tab as HTMLElement).id);
      });
      (document.querySelector("#t2") as HTMLElement).click();
    });
  });
  expect(changed).toBe("t2");

  await page.evaluate(() => {
    document.querySelector("#root")!.addEventListener("sp-beforechange", (e) => e.preventDefault());
  });
  await page.click("#t3");
  await expect(page.locator("#t2")).toHaveClass(/active/);
  await expect(page.locator("#t3")).not.toHaveClass(/active/);
});

test("nested tabs stay independent", async ({ page }) => {
  await mount(page, `
    <div id="outer" data-sp-tabs>
      <div class="tab-list">
        <button id="o1" class="tab active">Outer one</button>
        <button id="o2" class="tab">Outer two</button>
      </div>
      <div id="op1" class="tab-panel active">
        <div id="inner" data-sp-tabs>
          <div class="tab-list">
            <button id="n1" class="tab active">Inner one</button>
            <button id="n2" class="tab">Inner two</button>
          </div>
          <div id="np1" class="tab-panel active">Inner panel one</div>
          <div id="np2" class="tab-panel">Inner panel two</div>
        </div>
      </div>
      <div id="op2" class="tab-panel">Outer panel two</div>
    </div>`);

  await page.click("#n2");
  await expect(page.locator("#n2")).toHaveClass(/active/);
  await expect(page.locator("#np2")).toHaveClass(/active/);
  // The outer instance is untouched by the inner click.
  await expect(page.locator("#o1")).toHaveClass(/active/);
  await expect(page.locator("#op1")).toHaveClass(/active/);

  await page.click("#o2");
  await expect(page.locator("#op2")).toHaveClass(/active/);
  await expect(page.locator("#n2")).toHaveClass(/active/);
});

test("sp.tabs(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#root") as HTMLElement;
    const t = (window as any).sp.tabs(el);
    return { select: typeof t.select };
  });
  expect(api).toEqual({ select: "function" });
});

// WAI-ARIA Tabs pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
test.describe("WAI-ARIA compliance", () => {
  test("applies tabs semantics automatically", async ({ page }) => {
    await mount(page, BASIC);
    await expect(page.locator(".tab-list")).toHaveAttribute("role", "tablist");

    for (const [tab, panel] of [["t1", "p1"], ["t2", "p2"], ["t3", "p3"]]) {
      await expect(page.locator(`#${tab}`)).toHaveAttribute("role", "tab");
      await expect(page.locator(`#${tab}`)).toHaveAttribute("aria-controls", panel);
      await expect(page.locator(`#${panel}`)).toHaveAttribute("role", "tabpanel");
      await expect(page.locator(`#${panel}`)).toHaveAttribute("aria-labelledby", tab);
      await expect(page.locator(`#${panel}`)).toHaveAttribute("tabindex", "0");
    }

    await expect(page.locator("#t1")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#t1")).toHaveAttribute("tabindex", "0");
    await expect(page.locator("#t2")).toHaveAttribute("aria-selected", "false");
    await expect(page.locator("#t2")).toHaveAttribute("tabindex", "-1");
  });

  test("arrow keys move focus and select, wrapping at both ends", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("ArrowRight");
    expect(await activeId(page)).toBe("t2");
    await expect(page.locator("#t2")).toHaveClass(/active/);

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await activeId(page)).toBe("t1");

    await page.keyboard.press("ArrowLeft");
    expect(await activeId(page)).toBe("t3");
    await expect(page.locator("#p3")).toHaveClass(/active/);
  });

  test("Home and End jump to the first and last tab", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("End");
    expect(await activeId(page)).toBe("t3");
    await page.keyboard.press("Home");
    expect(await activeId(page)).toBe("t1");
  });

  test("a horizontal tablist ignores Up and Down", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("t1");
    await expect(page.locator("#t1")).toHaveClass(/active/);
  });

  test("a vertical tablist sets aria-orientation and uses Up/Down", async ({ page }) => {
    await mount(page, VERTICAL);
    await expect(page.locator(".tab-list")).toHaveAttribute("aria-orientation", "vertical");
    await page.focus("#t1");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("t2");
    await expect(page.locator("#t2")).toHaveClass(/active/);
  });

  test("arrow navigation skips disabled tabs", async ({ page }) => {
    await mount(page, DISABLED);
    await page.focus("#t1");
    await page.keyboard.press("ArrowRight");
    expect(await activeId(page)).toBe("t3");
  });

  test("Tab from the active tab moves into its panel", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#t1");
    await page.keyboard.press("Tab");
    expect(await activeId(page)).toBe("p1");
  });
});
