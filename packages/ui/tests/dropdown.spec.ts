import { test, expect, type Page } from "@playwright/test";

// Dropdown shares Popover's mixin set, so open/close/dismiss lifecycles are
// covered by popover.spec. These tests verify the dropdown-specific behavior:
// arrow navigation (Navigable), item clicks closing, and focus return.

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
  <button id="trigger" class="btn">Open</button>
  <div id="menu" class="dropdown" data-sp-toggle="#trigger">
    <button id="i1" class="dropdown-item">One</button>
    <button id="i2" class="dropdown-item">Two</button>
    <div id="sep" class="dropdown-separator"></div>
    <button id="i3" class="dropdown-item">Three</button>
  </div>
  <button id="outside">Outside</button>`;

const DISABLED = `
  <button id="trigger" class="btn">Open</button>
  <div id="menu" class="dropdown" data-sp-toggle="#trigger">
    <button id="i1" class="dropdown-item">One</button>
    <button id="i2" class="dropdown-item" aria-disabled="true">Two</button>
    <button id="i3" class="dropdown-item">Three</button>
  </div>`;

const menu = (page: Page) => page.locator("#menu");

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

async function waitUnmounted(page: Page) {
  await page.waitForFunction(() => !document.querySelector("#menu")!.matches(":popover-open"));
}

test("opens from its trigger and enters the top layer", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  expect(await menu(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
});

test("ArrowDown from the trigger focuses the first item", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
});

test("arrow keys cycle through the items, wrapping at both ends", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);

  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i2");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i3");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");

  await page.keyboard.press("ArrowUp");
  expect(await activeId(page)).toBe("i3");
});

test("Home and End jump to the first and last item", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("End");
  expect(await activeId(page)).toBe("i3");
  await page.keyboard.press("Home");
  expect(await activeId(page)).toBe("i1");
});

test("arrow navigation skips disabled items", async ({ page }) => {
  await mount(page, DISABLED);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i3");
});

test("arrow navigation skips separators", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown"); // i1
  await page.keyboard.press("ArrowDown"); // i2
  await page.keyboard.press("ArrowDown"); // skips #sep, lands on i3
  expect(await activeId(page)).toBe("i3");
});

test("clicking an item closes the menu", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.click("#i2");
  await expect(menu(page)).not.toHaveClass(/shown/);
});

test("Enter and Space activate the focused item", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("Space");
  await expect(menu(page)).not.toHaveClass(/shown/);

  await page.click("#trigger");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(menu(page)).not.toHaveClass(/shown/);
});

test("clicking a disabled item keeps the menu open", async ({ page }) => {
  await mount(page, DISABLED);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  // Playwright refuses to click aria-disabled elements; dispatch directly to
  // exercise the JS guard behind the pointer-events: none CSS.
  await page.evaluate(() =>
    document.querySelector("#i2")!.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await expect(menu(page)).toHaveClass(/shown/);
});

test("Escape closes and returns focus to the trigger", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.keyboard.press("ArrowDown");
  expect(await activeId(page)).toBe("i1");
  await page.keyboard.press("Escape");
  await waitUnmounted(page);
  expect(await activeId(page)).toBe("trigger");
});

test("tabbing past the last item closes the menu", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#trigger");
  await expect(menu(page)).toHaveClass(/shown/);
  await page.focus("#i3");
  await page.keyboard.press("Tab");
  await expect(menu(page)).not.toHaveClass(/shown/);
});

test("emits the lifecycle events in order", async ({ page }) => {
  await mount(page, BASIC);
  const events = await page.evaluate(async () => {
    const el = document.querySelector("#menu") as HTMLElement;
    const seen: string[] = [];
    for (const type of ["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]) {
      el.addEventListener(`sp-${type}`, () => seen.push(type));
    }
    const d = (window as any).sp.dropdown(el);
    d.show();
    await new Promise((r) => setTimeout(r, 300));
    d.hide();
    await new Promise((r) => setTimeout(r, 300));
    return seen;
  });
  expect(events).toEqual(["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]);
});

// WAI-ARIA Menu Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
test.describe("WAI-ARIA compliance", () => {
  test("applies menu semantics automatically", async ({ page }) => {
    await mount(page, BASIC);
    const trigger = page.locator("#trigger");
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute("aria-controls", "menu");
    await expect(menu(page)).toHaveAttribute("role", "menu");
    await expect(menu(page)).toHaveAttribute("aria-labelledby", "trigger");
    await expect(page.locator("#sep")).toHaveAttribute("role", "separator");

    for (const id of ["i1", "i2", "i3"]) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("role", "menuitem");
      // Roving tabindex: items are not Tab stops.
      await expect(page.locator(`#${id}`)).toHaveAttribute("tabindex", "-1");
    }
  });

  test("Enter on the trigger opens the menu and focuses the first item", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("Enter");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("i1");
  });

  test("ArrowDown on the closed trigger opens the menu and focuses the first item", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("ArrowDown");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("i1");
  });

  test("ArrowUp on the closed trigger opens the menu and focuses the last item", async ({ page }) => {
    await mount(page, BASIC);
    await page.focus("#trigger");
    await page.keyboard.press("ArrowUp");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("i3");
  });

  test("a pointer click leaves focus on the trigger", async ({ page }) => {
    await mount(page, BASIC);
    await page.click("#trigger");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("trigger");
  });
});

test("sp.dropdown(el) returns the instance with the public API", async ({ page }) => {
  await mount(page, BASIC);
  const api = await page.evaluate(() => {
    const el = document.querySelector("#menu") as HTMLElement;
    const d = (window as any).sp.dropdown(el);
    return { show: typeof d.show, hide: typeof d.hide, toggle: typeof d.toggle };
  });
  expect(api).toEqual({ show: "function", hide: "function", toggle: "function" });
});

const CHECKABLE = `
  <button id="trigger" class="btn">Open</button>
  <div id="menu" class="dropdown" data-sp-toggle="#trigger">
    <div id="c1" class="dropdown-item dropdown-item-checkbox"><input type="checkbox" name="statusbar" checked /> Status Bar</div>
    <div id="c2" class="dropdown-item dropdown-item-checkbox"><input type="checkbox" name="panel" /> Panel</div>
    <div id="r1" class="dropdown-item dropdown-item-radio"><input type="radio" name="position" value="top" checked /> Top</div>
    <div id="r2" class="dropdown-item dropdown-item-radio"><input type="radio" name="position" value="bottom" /> Bottom</div>
    <div id="r3" class="dropdown-item dropdown-item-radio"><input type="radio" name="position" value="right" /> Right</div>
  </div>`;

test.describe("checkable items", () => {
  test("assigns menu roles and mirrors the inputs onto aria-checked", async ({ page }) => {
    await mount(page, CHECKABLE);
    await expect(page.locator("#c1")).toHaveRole("menuitemcheckbox");
    await expect(page.locator("#c1")).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("#c2")).toHaveAttribute("aria-checked", "false");
    await expect(page.locator("#r1")).toHaveRole("menuitemradio");
    await expect(page.locator("#r2")).toHaveAttribute("aria-checked", "false");
  });

  test("clicking a checkbox item toggles its input, fires change, and keeps the menu open", async ({ page }) => {
    await mount(page, CHECKABLE);
    await page.evaluate(() => {
      (window as any).changes = [];
      document.addEventListener("change", (e) => {
        const input = e.target as HTMLInputElement;
        (window as any).changes.push(`${input.name}:${input.checked}`);
      });
    });
    await page.click("#trigger");
    await expect(menu(page)).toHaveClass(/shown/);
    await page.click("#c2");
    await expect(page.locator("#c2 input")).toBeChecked();
    await expect(page.locator("#c2")).toHaveAttribute("aria-checked", "true");
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await page.evaluate(() => (window as any).changes)).toEqual(["panel:true"]);
    await page.click("#c2");
    await expect(page.locator("#c2 input")).not.toBeChecked();
    await expect(page.locator("#c2")).toHaveAttribute("aria-checked", "false");
    expect(await page.evaluate(() => (window as any).changes)).toEqual(["panel:true", "panel:false"]);
    await expect(menu(page)).toHaveClass(/shown/);
  });

  test("clicking a radio item checks its input and unchecks same-name peers", async ({ page }) => {
    await mount(page, CHECKABLE);
    await page.click("#trigger");
    await page.click("#r2");
    await expect(page.locator("#r1 input")).not.toBeChecked();
    await expect(page.locator("#r2 input")).toBeChecked();
    await expect(page.locator("#r1")).toHaveAttribute("aria-checked", "false");
    await expect(page.locator("#r2")).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("#r3")).toHaveAttribute("aria-checked", "false");
    await expect(page.locator("#c1 input")).toBeChecked();
    expect(
      await page.evaluate(
        () => document.querySelector<HTMLInputElement>("input[name=position]:checked")?.value,
      ),
    ).toBe("bottom");
    await expect(menu(page)).toHaveClass(/shown/);
  });

  test("Space on a focused checkbox item toggles it", async ({ page }) => {
    await mount(page, CHECKABLE);
    await page.click("#trigger");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("c1");
    await page.keyboard.press(" ");
    await expect(page.locator("#c1 input")).not.toBeChecked();
    await expect(page.locator("#c1")).toHaveAttribute("aria-checked", "false");
    await expect(menu(page)).toHaveClass(/shown/);
  });
});

const SUBMENU = `
  <button id="trigger" class="btn">Open</button>
  <div id="menu" class="dropdown" data-sp-toggle="#trigger">
    <button id="i1" class="dropdown-item">Team</button>
    <button id="subtrigger" class="dropdown-item">Invite users</button>
    <button id="i2" class="dropdown-item">New Team</button>
  </div>
  <div id="submenu" class="dropdown dropdown-sub" data-sp-toggle="#subtrigger" data-sp-mode="hover" data-sp-placement="right-start">
    <button id="s1" class="dropdown-item">Email</button>
    <button id="subtrigger2" class="dropdown-item">More options</button>
  </div>
  <div id="submenu2" class="dropdown dropdown-sub" data-sp-toggle="#subtrigger2" data-sp-mode="hover" data-sp-placement="right-start">
    <button id="s2" class="dropdown-item">Slack</button>
  </div>`;

test.describe("submenu composition", () => {
  test("clicking the sub trigger opens the submenu without closing the parent", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await expect(menu(page)).toHaveClass(/shown/);
    await page.click("#subtrigger");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await expect(menu(page)).toHaveClass(/shown/);
  });

  test("choosing a submenu item closes both menus", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.click("#subtrigger");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await page.click("#s1");
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
    await expect(menu(page)).not.toHaveClass(/shown/);
  });
});

test.describe("submenu keyboard navigation", () => {
  test("arrow navigation over the sub trigger does not open the submenu", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await expect(menu(page)).toHaveClass(/shown/);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("subtrigger");
    await page.waitForTimeout(200);
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
  });

  test("arrowing past the sub trigger keeps the menu open", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await expect(menu(page)).toHaveClass(/shown/);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeId(page)).toBe("i2");
    await page.waitForTimeout(200);
    await expect(menu(page)).toHaveClass(/shown/);
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
  });

  test("ArrowRight on the sub trigger opens the submenu and focuses its first item", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("s1");
    // Regression: the focusout hover logic scheduled a hide right after opening.
    await page.waitForTimeout(400);
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
  });

  test("Enter on the sub trigger opens the submenu and focuses its first item", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("s1");
    await page.waitForTimeout(400);
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
  });

  test("ArrowLeft closes the submenu and returns focus to its trigger", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
    await expect(menu(page)).toHaveClass(/shown/);
    expect(await activeId(page)).toBe("subtrigger");
  });

  test("Escape inside the submenu closes only the submenu", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
    await expect(menu(page)).toHaveClass(/shown/);
    await expect
      .poll(async () => activeId(page))
      .toBe("subtrigger");
  });

  test("Escape in the parent closes the whole chain", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.hover("#subtrigger");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await expect(menu(page)).not.toHaveClass(/shown/);
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
  });
});

test.describe("nested submenu hover", () => {
  test("pointer moving through nested submenus keeps the chain open", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.hover("#subtrigger");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await page.hover("#subtrigger2");
    await expect(page.locator("#submenu2")).toHaveClass(/shown/);
    await page.hover("#s2");
    await page.waitForTimeout(400);
    await expect(menu(page)).toHaveClass(/shown/);
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await expect(page.locator("#submenu2")).toHaveClass(/shown/);
  });

  test("choosing an item in the deepest submenu closes the whole chain", async ({ page }) => {
    await mount(page, SUBMENU);
    await page.click("#trigger");
    await page.hover("#subtrigger");
    await expect(page.locator("#submenu")).toHaveClass(/shown/);
    await page.hover("#subtrigger2");
    await expect(page.locator("#submenu2")).toHaveClass(/shown/);
    await page.click("#s2");
    await expect(page.locator("#submenu2")).not.toHaveClass(/shown/);
    await expect(page.locator("#submenu")).not.toHaveClass(/shown/);
    await expect(menu(page)).not.toHaveClass(/shown/);
  });
});
