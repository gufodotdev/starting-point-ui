import { test, expect, type Page } from "@playwright/test";

// Combobox shares the popover/dropdown mixin set, so open/close/dismiss
// lifecycles are covered by those specs. These tests verify the combobox-
// specific behavior in its two anchor modes: input-anchored autocomplete
// and chips multi-select.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

async function trackChanges(page: Page) {
  await page.evaluate(() => {
    (window as any).changes = [];
    document.addEventListener("change", (e) => {
      const input = e.target as HTMLInputElement;
      (window as any).changes.push(`${input.value}:${input.checked}`);
    });
  });
}

const changes = (page: Page) => page.evaluate(() => (window as any).changes);

// The harness has no CSS, so approximate .sr-only inline; otherwise the inputs
// sit at the items' click point and native toggling doubles up with select().
const HIDE = `style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none"`;

const LIST = `
    <div id="empty" class="combobox-empty">No items found.</div>
    <div class="combobox-list">
      <div id="i1" class="combobox-item"><input type="radio" ${HIDE} name="fw" value="next" /> Next.js</div>
      <div id="i2" class="combobox-item"><input type="radio" ${HIDE} name="fw" value="astro" /> Astro</div>
      <div id="i3" class="combobox-item"><input type="radio" ${HIDE} name="fw" value="nuxt" /> Nuxt.js</div>
    </div>`;

const FIELD = `
  <div id="field" class="input-group">
    <input id="fw" class="input" placeholder="Select framework" />
    <span class="input-group-addon input-group-addon-end">
      <button id="clear" class="combobox-clear" type="button">x</button>
    </span>
  </div>`;

const INPUT_ANCHORED = `${FIELD}
  <div id="cb" class="combobox" data-sp-toggle="#field">${LIST}
  </div>
  <button id="outside">Outside</button>`;

const AUTO_HIGHLIGHT = INPUT_ANCHORED.replace(
  'data-sp-toggle="#field"',
  'data-sp-toggle="#field" data-sp-auto-highlight="true"',
);

const PRESELECTED = INPUT_ANCHORED.replace('value="astro" />', 'value="astro" checked />').replace(
  'placeholder="Select framework"',
  'placeholder="Select framework" value="Astro"',
);

const GROUPED = `${FIELD}
  <div id="cb" class="combobox" data-sp-toggle="#field">
    <div id="empty" class="combobox-empty">No items found.</div>
    <div class="combobox-list">
      <div id="g1" class="combobox-group">
        <div class="combobox-label">Frameworks</div>
        <div id="i1" class="combobox-item"><input type="radio" ${HIDE} name="tz" value="next" /> Next.js</div>
        <div class="combobox-separator"></div>
      </div>
      <div id="g2" class="combobox-group">
        <div class="combobox-label">Tools</div>
        <div id="i2" class="combobox-item"><input type="radio" ${HIDE} name="tz" value="vite" /> Vite</div>
      </div>
    </div>
  </div>`;

const CHIPS = `
  <div id="chips" class="combobox-chips">
    <span class="combobox-chip">Next.js <button class="combobox-chip-remove" type="button" aria-label="Remove Next.js"></button></span>
    <input id="chin" placeholder="Add framework" />
  </div>
  <div id="cb" class="combobox" data-sp-toggle="#chips">
    <div class="combobox-list">
      <div id="i1" class="combobox-item"><input type="checkbox" ${HIDE} name="fws" value="next" checked /> Next.js</div>
      <div id="i2" class="combobox-item"><input type="checkbox" ${HIDE} name="fws" value="astro" /> Astro</div>
      <div id="i3" class="combobox-item"><input type="checkbox" ${HIDE} name="fws" value="nuxt" /> Nuxt.js</div>
    </div>
  </div>
  <button id="outside">Outside</button>`;

const panel = (page: Page) => page.locator("#cb");
const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);
const highlighted = (page: Page) =>
  page.evaluate(() => document.querySelector(".combobox-item[data-sp-highlighted]")?.id ?? null);

test.describe("input-anchored", () => {
  test("clicking the field opens the list, focuses the input, and never toggle-closes", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await page.click("#field");
    await expect(panel(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("fw");
    await page.click("#fw");
    await page.waitForTimeout(200);
    await expect(panel(page)).toHaveClass(/shown/);
  });

  test("a disabled field does not open on click", async ({ page }) => {
    await mount(page, INPUT_ANCHORED.replace('class="input" placeholder', 'class="input" disabled placeholder'));
    await page.click("#field");
    await page.waitForTimeout(200);
    await expect(panel(page)).not.toHaveClass(/shown/);
  });

  test("wires combobox ARIA onto the field input and syncs aria-expanded", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await expect(page.locator("#fw")).toHaveRole("combobox");
    await expect(page.locator("#fw")).toHaveAttribute("aria-expanded", "false");
    await page.click("#field");
    await expect(page.locator("#fw")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("#fw")).toHaveAttribute("aria-expanded", "false");
  });

  test("typing opens and filters; no matches shows the empty state", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await page.fill("#fw", "nu");
    await expect(panel(page)).toHaveClass(/shown/);
    await expect(page.locator("#i3")).toBeVisible();
    await expect(page.locator("#i1")).toBeHidden();
    await expect(page.locator("#i2")).toBeHidden();
    await page.fill("#fw", "zzz");
    await expect(page.locator("#empty")).toHaveClass(/visible/);
  });

  test("ArrowDown opens and highlights; Enter selects, fills the field, and closes", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await trackChanges(page);
    await page.focus("#fw");
    await page.keyboard.press("ArrowDown");
    await expect(panel(page)).toHaveClass(/shown/);
    expect(await highlighted(page)).toBe("i1");
    await page.keyboard.press("ArrowDown");
    expect(await highlighted(page)).toBe("i2");
    await page.keyboard.press("Enter");
    await expect(panel(page)).not.toHaveClass(/shown/);
    await expect(page.locator("#fw")).toHaveValue("Astro");
    await expect(page.locator("#i2 input")).toBeChecked();
    expect(await changes(page)).toEqual(["astro:true"]);
    expect(
      await page.evaluate(
        () => document.querySelector<HTMLInputElement>("input[name=fw]:checked")?.value,
      ),
    ).toBe("astro");
  });

  test("dismissing reverts the field text to the selection", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await page.click("#field");
    await page.click("#i2");
    await expect(page.locator("#fw")).toHaveValue("Astro");
    await page.fill("#fw", "Nu");
    await expect(panel(page)).toHaveClass(/shown/);
    await page.click("#outside");
    await expect(panel(page)).not.toHaveClass(/shown/);
    await expect(page.locator("#fw")).toHaveValue("Astro");
  });

  test("reopening resets the filter to the full list", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await page.fill("#fw", "nu");
    await expect(page.locator("#i1")).toBeHidden();
    await page.click("#outside");
    await expect(panel(page)).not.toHaveClass(/shown/);
    await page.click("#field");
    await expect(panel(page)).toHaveClass(/shown/);
    await expect(page.locator("#i1")).toBeVisible();
    await expect(page.locator("#i2")).toBeVisible();
  });

  test("the clear button tracks the selection and clears it", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await expect(page.locator("#clear")).toBeHidden();
    await page.click("#field");
    await page.click("#i1");
    await expect(page.locator("#clear")).toBeVisible();
    await trackChanges(page);
    await page.click("#clear");
    await expect(page.locator("#clear")).toBeHidden();
    await expect(page.locator("#fw")).toHaveValue("");
    expect(await changes(page)).toEqual(["next:false"]);
    expect(await page.evaluate(() => document.querySelectorAll("input[name=fw]:checked").length)).toBe(0);
  });

  test("a preselected option fills the field on init", async ({ page }) => {
    await mount(page, PRESELECTED);
    await expect(page.locator("#fw")).toHaveValue("Astro");
    await expect(page.locator("#clear")).toBeVisible();
  });

  test("typing highlights nothing unless auto highlight is on", async ({ page }) => {
    await mount(page, INPUT_ANCHORED);
    await page.fill("#fw", "as");
    await expect(panel(page)).toHaveClass(/shown/);
    expect(await highlighted(page)).toBe(null);
    await mount(page, AUTO_HIGHLIGHT);
    await page.fill("#fw", "as");
    await expect(panel(page)).toHaveClass(/shown/);
    expect(await highlighted(page)).toBe("i2");
    await page.keyboard.press("Enter");
    await expect(page.locator("#fw")).toHaveValue("Astro");
  });

  test("filtering hides a group once all its items are gone", async ({ page }) => {
    await mount(page, GROUPED);
    await page.fill("#fw", "vite");
    await expect(page.locator("#g1")).toBeHidden();
    await expect(page.locator("#g2")).toBeVisible();
    await page.fill("#fw", "");
    await expect(page.locator("#g1")).toBeVisible();
  });
});

test.describe("chips multi-select", () => {
  test("adopts an authored chip on init without duplicating it", async ({ page }) => {
    await mount(page, CHIPS);
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(1);
    await expect(page.locator("#chips .combobox-chip")).toContainText("Next.js");
    await page.click("#chips .combobox-chip-remove");
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(0);
    await expect(page.locator("#i1 input")).not.toBeChecked();
  });

  test("selecting adds a chip, keeps the panel open, and clears the query", async ({ page }) => {
    await mount(page, CHIPS);
    await page.click("#chips");
    await expect(panel(page)).toHaveClass(/shown/);
    await page.fill("#chin", "as");
    await expect(page.locator("#i2")).toBeVisible();
    await page.click("#i2");
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(2);
    await expect(panel(page)).toHaveClass(/shown/);
    await expect(page.locator("#chin")).toHaveValue("");
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll<HTMLInputElement>("input[name=fws]:checked")].map((i) => i.value),
      ),
    ).toEqual(["next", "astro"]);
  });

  test("a chip's remove button unchecks its option and fires change", async ({ page }) => {
    await mount(page, CHIPS);
    await trackChanges(page);
    await page.click("#chips .combobox-chip-remove");
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(0);
    await expect(page.locator("#i1 input")).not.toBeChecked();
    expect(await changes(page)).toEqual(["next:false"]);
  });

  test("Backspace in the empty chips input removes the newest chip", async ({ page }) => {
    await mount(page, CHIPS);
    await page.click("#chips");
    await page.click("#i2");
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(2);
    await page.focus("#chin");
    await page.keyboard.press("Backspace");
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(1);
    await expect(page.locator("#i2 input")).not.toBeChecked();
  });

  test("deselecting a checked option from the list removes its chip", async ({ page }) => {
    await mount(page, CHIPS);
    await page.click("#chips");
    await page.click("#i1");
    await expect(page.locator("#chips .combobox-chip")).toHaveCount(0);
    await expect(panel(page)).toHaveClass(/shown/);
  });
});
