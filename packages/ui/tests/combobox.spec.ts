import { test, expect, type Page } from "@playwright/test";

// Combobox shares the popover/dropdown mixin set, so open/close/dismiss
// lifecycles are covered by those specs. These tests verify the combobox-
// specific behavior: filtering, selection, value sync, and visible-item nav.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

// The harness has no CSS, so approximate .sr-only inline; otherwise the inputs
// sit at the items' click point and native toggling doubles up with select().
const HIDE = `style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none"`;

const SINGLE = `
  <button id="trigger" class="combobox-trigger">
    <span class="combobox-value" data-sp-placeholder="Pick one"></span>
  </button>
  <div id="cb" class="combobox" data-sp-combobox="toggle: #trigger">
    <div class="combobox-search">
      <input id="search" class="combobox-input" type="text" />
    </div>
    <div class="combobox-list">
      <div id="i1" class="combobox-item">
        <input type="radio" ${HIDE} tabindex="-1" name="fw" value="next" />
        Next.js
      </div>
      <div id="i2" class="combobox-item">
        <input type="radio" ${HIDE} tabindex="-1" name="fw" value="astro" />
        Astro
      </div>
      <div id="i3" class="combobox-item">
        <input type="radio" ${HIDE} tabindex="-1" name="fw" value="nuxt" />
        Nuxt.js
      </div>
    </div>
    <div id="empty" class="combobox-empty">No results.</div>
  </div>`;

const MULTI = `
  <button id="trigger" class="combobox-trigger">
    <span class="combobox-value" data-sp-placeholder="Pick tools"></span>
  </button>
  <div id="cb" class="combobox" data-sp-combobox="toggle: #trigger">
    <div class="combobox-list">
      <div id="i1" class="combobox-item">
        <input type="checkbox" ${HIDE} tabindex="-1" name="tools" value="eslint" />
        ESLint
      </div>
      <div id="i2" class="combobox-item">
        <input type="checkbox" ${HIDE} tabindex="-1" name="tools" value="vitest" />
        Vitest
      </div>
    </div>
  </div>`;

const SINGLE_FORM = `
  <form id="form">
    <button id="trigger" class="combobox-trigger">
      <span class="combobox-value" data-sp-placeholder="Drink"></span>
    </button>
    <div id="cb" class="combobox" data-sp-combobox="toggle: #trigger">
      <div class="combobox-list">
        <div id="i1" class="combobox-item">
          <input type="radio" ${HIDE} tabindex="-1" name="drink" value="water" />
          Water
        </div>
        <div id="i2" class="combobox-item">
          <input type="radio" ${HIDE} tabindex="-1" name="drink" value="coke" />
          Coke
        </div>
        <div id="i3" class="combobox-item">
          <input type="radio" ${HIDE} tabindex="-1" name="drink" value="pepsi" />
          Pepsi
        </div>
      </div>
    </div>
  </form>`;

const MULTI_FORM = `
  <form id="form">
    <button id="trigger" class="combobox-trigger">
      <span class="combobox-value" data-sp-placeholder="Tools"></span>
    </button>
    <div id="cb" class="combobox" data-sp-combobox="toggle: #trigger">
      <div class="combobox-list">
        <div id="i1" class="combobox-item">
          <input type="checkbox" ${HIDE} tabindex="-1" name="tools" value="eslint" />
          ESLint
        </div>
        <div id="i2" class="combobox-item">
          <input type="checkbox" ${HIDE} tabindex="-1" name="tools" value="vitest" />
          Vitest
        </div>
      </div>
    </div>
  </form>`;

const combobox = (page: Page) => page.locator("#cb");

const formValues = (page: Page, name: string) =>
  page.evaluate((key) => new FormData(document.querySelector("form")!).getAll(key), name);

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

const highlightedId = (page: Page) =>
  page.evaluate(() => document.querySelector("[data-highlighted]")?.id ?? null);

test("opens from its trigger and focuses the search input", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await expect(combobox(page)).toHaveClass(/shown/);
  expect(await combobox(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
  expect(await activeId(page)).toBe("search");
});

test("typing filters the items and shows the empty state", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.keyboard.type("nuxt");
  await expect(page.locator("#i1")).toBeHidden();
  await expect(page.locator("#i2")).toBeHidden();
  await expect(page.locator("#i3")).toBeVisible();

  await page.keyboard.type("zzz");
  await expect(page.locator("#i3")).toBeHidden();
  await expect(page.locator("#empty")).toHaveClass(/visible/);
});

test("resets the filter and search input on close", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.keyboard.type("nuxt");
  await expect(page.locator("#i1")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(combobox(page)).not.toHaveClass(/shown/);

  await page.click("#trigger");
  await expect(page.locator("#i1")).toBeVisible();
  await expect(page.locator("#search")).toHaveValue("");
});

test("single select checks the radio, syncs the value, and closes", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.click("#i2");
  await expect(combobox(page)).not.toHaveClass(/shown/);
  await expect(page.locator("#i2")).toHaveAttribute("aria-selected", "true");
  expect(await page.locator("#i2 input").isChecked()).toBe(true);
  await expect(page.locator(".combobox-value")).toHaveText("Astro");
});

test("re-selecting the selected item clears the selection", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.click("#i2");
  await page.click("#trigger");
  await page.click("#i2");
  await expect(combobox(page)).not.toHaveClass(/shown/);
  await expect(page.locator("#i2")).toHaveAttribute("aria-selected", "false");
  expect(await page.locator("#i2 input").isChecked()).toBe(false);
  expect(await page.locator(".combobox-value > span").count()).toBe(0);
});

test("selecting another item clears the previous single selection", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.click("#i2");
  await page.click("#trigger");
  await page.click("#i1");
  await expect(page.locator("#i2")).toHaveAttribute("aria-selected", "false");
  expect(await page.locator("#i2 input").isChecked()).toBe(false);
  await expect(page.locator(".combobox-value")).toHaveText("Next.js");
});

test("multi select toggles and keeps the menu open", async ({ page }) => {
  await mount(page, MULTI);
  await page.click("#trigger");
  await page.click("#i1");
  await expect(combobox(page)).toHaveClass(/shown/);
  await page.click("#i2");
  expect(await page.locator(".combobox-value > span").count()).toBe(2);

  await page.click("#i1");
  await expect(page.locator("#i1")).toHaveAttribute("aria-selected", "false");
  expect(await page.locator(".combobox-value > span").count()).toBe(1);
});

test("a trigger without a value span keeps its label after selection", async ({ page }) => {
  await mount(page, MULTI.replace('<span class="combobox-value" data-sp-placeholder="Pick tools"></span>', "View"));
  await page.click("#trigger");
  await page.click("#i1");
  expect(await page.locator("#i1 input").isChecked()).toBe(true);
  await expect(page.locator("#trigger")).toHaveText("View");
});

test("the trigger does not submit an enclosing form", async ({ page }) => {
  await mount(page, SINGLE_FORM);
  await page.evaluate(() => {
    document.querySelector("form")!.addEventListener("submit", (e) => {
      e.preventDefault();
      (window as any).__submitted = true;
    });
  });
  await page.click("#trigger");
  await expect(combobox(page)).toHaveClass(/shown/);
  expect(await page.evaluate(() => (window as any).__submitted ?? false)).toBe(false);
});

test("a form submits the selected value", async ({ page }) => {
  await mount(page, SINGLE_FORM);
  expect(await formValues(page, "drink")).toEqual([]);

  await page.click("#trigger");
  await page.click("#i2");
  expect(await formValues(page, "drink")).toEqual(["coke"]);

  await page.click("#trigger");
  await page.click("#i3");
  expect(await formValues(page, "drink")).toEqual(["pepsi"]);

  await page.click("#trigger");
  await page.click("#i3");
  expect(await formValues(page, "drink")).toEqual([]);
});

test("a form submits all selected values for multi select", async ({ page }) => {
  await mount(page, MULTI_FORM);
  await page.click("#trigger");
  await page.click("#i1");
  await page.click("#i2");
  expect(await formValues(page, "tools")).toEqual(["eslint", "vitest"]);

  await page.click("#i1");
  expect(await formValues(page, "tools")).toEqual(["vitest"]);
});

test("selection dispatches a bubbling change event from the input", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  const detail = await page.evaluate(() => {
    return new Promise((resolve) => {
      document.querySelector("#cb")!.addEventListener("change", (e) => {
        const input = e.target as HTMLInputElement;
        resolve({ name: input.name, value: input.value, checked: input.checked });
      });
      (document.querySelector("#i2") as HTMLElement).click();
    });
  });
  expect(detail).toEqual({ name: "fw", value: "astro", checked: true });
});

test("nothing is highlighted until navigating or typing", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await expect(combobox(page)).toHaveClass(/shown/);
  expect(await highlightedId(page)).toBe(null);
  await page.keyboard.press("ArrowDown");
  expect(await highlightedId(page)).toBe("i1");
});

test("arrow navigation moves the highlight over visible items only", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.keyboard.type("n");
  await expect(page.locator("#i2")).toBeHidden();

  expect(await highlightedId(page)).toBe("i1");
  await page.keyboard.press("ArrowDown");
  expect(await highlightedId(page)).toBe("i3");
  await page.keyboard.press("ArrowDown");
  expect(await highlightedId(page)).toBe("i1");
  expect(await activeId(page)).toBe("search");
});

test("Enter selects the highlighted item", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  expect(await highlightedId(page)).toBe("i2");
  await page.keyboard.press("Enter");
  await expect(page.locator("#i2")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".combobox-value")).toHaveText("Astro");
});

test("Escape closes and returns focus to the trigger", async ({ page }) => {
  await mount(page, SINGLE);
  await page.click("#trigger");
  expect(await activeId(page)).toBe("search");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("#cb")!.matches(":popover-open"));
  expect(await activeId(page)).toBe("trigger");
});

// WAI-ARIA Combobox pattern (dialog popup, list autocomplete):
// https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
test.describe("WAI-ARIA compliance", () => {
  test("applies combobox semantics automatically", async ({ page }) => {
    await mount(page, SINGLE);
    const trigger = page.locator("#trigger");
    await expect(trigger).toHaveAttribute("role", "combobox");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-controls", "cb");
    await expect(combobox(page)).toHaveAttribute("role", "dialog");
    await expect(combobox(page)).toHaveAttribute("aria-labelledby", "trigger");

    const input = page.locator("#search");
    await expect(input).toHaveAttribute("role", "combobox");
    await expect(input).toHaveAttribute("aria-autocomplete", "list");
    const listId = await page.locator(".combobox-list").getAttribute("id");
    expect(listId).toBeTruthy();
    await expect(input).toHaveAttribute("aria-controls", listId!);
    await expect(page.locator(".combobox-list")).toHaveAttribute("role", "listbox");

    for (const id of ["i1", "i2", "i3"]) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("role", "option");
      await expect(page.locator(`#${id}`)).toHaveAttribute("tabindex", "-1");
    }
  });

  test("tracks the highlight in aria-activedescendant while focus stays in the input", async ({ page }) => {
    await mount(page, SINGLE);
    await page.click("#trigger");
    const input = page.locator("#search");
    await expect(input).not.toHaveAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", "i1");
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", "i2");
    expect(await activeId(page)).toBe("search");
  });

  test("typing keeps filtering while navigating", async ({ page }) => {
    await mount(page, SINGLE);
    await page.click("#trigger");
    await page.keyboard.press("ArrowDown");
    expect(await highlightedId(page)).toBe("i1");
    await page.keyboard.type("nuxt");
    await expect(page.locator("#i1")).toBeHidden();
    await expect(page.locator("#i2")).toBeHidden();
    expect(await highlightedId(page)).toBe("i3");
  });

  test("ArrowDown on the closed trigger opens the combobox", async ({ page }) => {
    await mount(page, SINGLE);
    await page.focus("#trigger");
    await page.keyboard.press("ArrowDown");
    await expect(combobox(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("search");
    expect(await highlightedId(page)).toBe("i1");
  });
});

test("sp.combobox(el) exposes the public API including select and filter", async ({ page }) => {
  await mount(page, SINGLE);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#cb") as HTMLElement;
    const c = (window as any).sp.combobox(el);
    return {
      show: typeof c.show,
      hide: typeof c.hide,
      toggle: typeof c.toggle,
      select: typeof c.select,
      filter: typeof c.filter,
    };
  });
  expect(api).toEqual({
    show: "function",
    hide: "function",
    toggle: "function",
    select: "function",
    filter: "function",
  });
});
