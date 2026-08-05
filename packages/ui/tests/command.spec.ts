import { test, expect, type Page } from "@playwright/test";

// The command has no open/close lifecycle; these tests cover its own
// behavior: filtering with group hiding and the empty state, the virtual
// highlight, and running items via Enter or click.

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
  <div class="command">
    <div class="input-group">
      <input class="input" placeholder="Search..." />
    </div>
    <div class="command-list">
      <div class="command-empty">No results found.</div>
      <div class="command-group" id="group-a">
        <div class="command-label">Suggestions</div>
        <button class="command-item" id="calendar">Calendar</button>
        <button class="command-item" id="emoji">Search Emoji</button>
      </div>
      <div class="command-separator" id="separator"></div>
      <div class="command-group" id="group-b">
        <div class="command-label">Settings</div>
        <button class="command-item" id="profile">Profile</button>
        <button class="command-item" id="billing" aria-disabled="true">Billing</button>
      </div>
    </div>
  </div>`;

const input = (page: Page) => page.locator(".command input");

test("wires combobox aria onto the input, list, and items", async ({ page }) => {
  await mount(page, BASIC);
  await expect(input(page)).toHaveAttribute("role", "combobox");
  await expect(input(page)).toHaveAttribute("aria-expanded", "true");
  await expect(input(page)).toHaveAttribute("aria-autocomplete", "list");
  await expect(input(page)).toHaveAttribute("autocomplete", "off");
  const controls = await input(page).getAttribute("aria-controls");
  expect(controls).toBe(await page.locator(".command-list").getAttribute("id"));
  await expect(page.locator(".command-list")).toHaveAttribute("role", "listbox");
  await expect(page.locator(".command-list")).toHaveAttribute("aria-label", "Suggestions");
  await expect(page.locator("#calendar")).toHaveAttribute("role", "option");
  await expect(page.locator("#calendar")).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("#separator")).toHaveAttribute("role", "separator");
  await expect(page.locator("#group-a")).toHaveAttribute("role", "group");
  const labelId = await page.locator("#group-a .command-label").getAttribute("id");
  expect(labelId).toBeTruthy();
  await expect(page.locator("#group-a")).toHaveAttribute("aria-labelledby", labelId!);
});

test("keeps authored aria attributes instead of overwriting them", async ({ page }) => {
  await mount(
    page,
    BASIC.replace('class="command-list"', 'class="command-list" aria-label="Actions"'),
  );
  await expect(page.locator(".command-list")).toHaveAttribute("aria-label", "Actions");
});

test("highlights the first item on init", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#calendar")).toHaveAttribute("data-sp-highlighted", "");
  await expect(page.locator("#calendar")).toHaveAttribute("aria-selected", "true");
  const active = await input(page).getAttribute("aria-activedescendant");
  expect(active).toBe(await page.locator("#calendar").getAttribute("id"));
});

test("an authored data-sp-highlighted item keeps the highlight on init", async ({ page }) => {
  await mount(page, BASIC.replace('id="profile"', 'id="profile" data-sp-highlighted'));
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
  await expect(page.locator("#profile")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#calendar")).not.toHaveAttribute("data-sp-highlighted");
  const active = await input(page).getAttribute("aria-activedescendant");
  expect(active).toBe(await page.locator("#profile").getAttribute("id"));
});

test("typing filters items, hides emptied groups, highlights first match", async ({ page }) => {
  await mount(page, BASIC);
  await input(page).fill("prof");
  await expect(page.locator("#calendar")).toBeHidden();
  await expect(page.locator("#group-a")).toBeHidden();
  await expect(page.locator("#separator")).toHaveAttribute("hidden", "");
  await expect(page.locator("#profile")).toBeVisible();
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
  await input(page).fill("");
  await expect(page.locator("#calendar")).toBeVisible();
  await expect(page.locator("#group-a")).toBeVisible();
  await expect(page.locator("#separator")).not.toHaveAttribute("hidden");
});

test("shows the empty state when nothing matches", async ({ page }) => {
  await mount(page, BASIC);
  await input(page).fill("zzz");
  await expect(page.locator(".command-empty")).toHaveClass(/visible/);
  const active = await input(page).getAttribute("aria-activedescendant");
  expect(active).toBeNull();
  await input(page).fill("cal");
  await expect(page.locator(".command-empty")).not.toHaveClass(/visible/);
});

test("arrows move the highlight from the input and skip disabled items", async ({ page }) => {
  await mount(page, BASIC);
  await input(page).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#emoji")).toHaveAttribute("data-sp-highlighted", "");
  await expect(page.locator("#emoji")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#calendar")).not.toHaveAttribute("aria-selected");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#calendar")).toHaveAttribute("data-sp-highlighted", "");
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
});

test("the highlight follows the pointer and skips disabled items", async ({ page }) => {
  await mount(page, BASIC);
  await page.hover("#profile");
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
  await expect(page.locator("#calendar")).not.toHaveAttribute("data-sp-highlighted");
  await page.hover("#billing", { force: true });
  await expect(page.locator("#billing")).not.toHaveAttribute("data-sp-highlighted");
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
});

test("a scroll-induced pointermove with unchanged coordinates keeps the keyboard highlight", async ({ page }) => {
  await mount(page, BASIC);
  const move = (id: string, x: number, y: number) =>
    page.evaluate(
      ([sel, cx, cy]) => {
        document.querySelector(sel as string)?.dispatchEvent(
          new PointerEvent("pointermove", { bubbles: true, clientX: cx as number, clientY: cy as number }),
        );
      },
      [`#${id}`, x, y],
    );
  await move("profile", 10, 10);
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
  await input(page).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#calendar")).toHaveAttribute("data-sp-highlighted", "");
  await move("profile", 10, 10);
  await expect(page.locator("#calendar")).toHaveAttribute("data-sp-highlighted", "");
  await move("profile", 11, 10);
  await expect(page.locator("#profile")).toHaveAttribute("data-sp-highlighted", "");
});

test("touch pointer movement does not move the highlight", async ({ page }) => {
  await mount(page, BASIC);
  await page.evaluate(() => {
    document.querySelector("#profile")?.dispatchEvent(
      new PointerEvent("pointermove", { bubbles: true, clientX: 30, clientY: 30, pointerType: "touch" }),
    );
  });
  await expect(page.locator("#calendar")).toHaveAttribute("data-sp-highlighted", "");
  await expect(page.locator("#profile")).not.toHaveAttribute("data-sp-highlighted");
});

test("enter runs the highlighted item", async ({ page }) => {
  await mount(page, BASIC);
  await page.evaluate(() => {
    (window as never as { _selected: string[] })._selected = [];
    document.querySelector(".command")?.addEventListener("sp-select", (e) => {
      (window as never as { _selected: string[] })._selected.push(
        (e as CustomEvent).detail.value,
      );
    });
  });
  await input(page).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => (window as never as { _selected: string[] })._selected)).toEqual([
    "Search Emoji",
  ]);
});

const UNFILTERED = `
  <div class="command" data-sp-filter="false">
    <div class="input-group">
      <input class="input" placeholder="Search..." />
    </div>
    <div class="command-list">
      <div class="command-empty">No results found.</div>
      <button class="command-item" id="one">Alpha</button>
      <button class="command-item" id="two">Beta</button>
    </div>
  </div>`;

test("data-sp-filter=false leaves items alone while typing", async ({ page }) => {
  await mount(page, UNFILTERED);
  await input(page).fill("zzz");
  await expect(page.locator("#one")).toBeVisible();
  await expect(page.locator("#two")).toBeVisible();
  await expect(page.locator(".command-empty")).not.toHaveClass(/visible/);
});

test("dynamically swapped items get wired, highlighted, and toggle the empty state", async ({ page }) => {
  await mount(page, UNFILTERED);
  await page.evaluate(() => {
    document.querySelectorAll(".command-item").forEach((el) => el.remove());
  });
  await expect(page.locator(".command-empty")).toHaveClass(/visible/);
  await expect(input(page)).not.toHaveAttribute("aria-activedescendant");
  await page.evaluate(() => {
    const item = document.createElement("button");
    item.className = "command-item";
    item.id = "fresh";
    item.textContent = "Fresh";
    document.querySelector(".command-list")?.appendChild(item);
  });
  await expect(page.locator("#fresh")).toHaveAttribute("role", "option");
  await expect(page.locator("#fresh")).toHaveAttribute("data-sp-highlighted", "");
  await expect(page.locator(".command-empty")).not.toHaveClass(/visible/);
});

test("clicking an item keeps focus in the input", async ({ page }) => {
  await mount(page, BASIC);
  await input(page).focus();
  await page.locator("#profile").click();
  expect(
    await page.evaluate(() => document.activeElement?.matches(".command input") ?? false),
  ).toBe(true);
});

test("click runs an item; disabled items do not run", async ({ page }) => {
  await mount(page, BASIC);
  await page.evaluate(() => {
    (window as never as { _selected: string[] })._selected = [];
    document.querySelector(".command")?.addEventListener("sp-select", (e) => {
      (window as never as { _selected: string[] })._selected.push(
        (e as CustomEvent).detail.value,
      );
    });
  });
  await page.locator("#profile").click();
  await page.locator("#billing").click({ force: true });
  expect(await page.evaluate(() => (window as never as { _selected: string[] })._selected)).toEqual([
    "Profile",
  ]);
});
