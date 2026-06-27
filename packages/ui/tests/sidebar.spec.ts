import { test, expect, type Page } from "@playwright/test";

// The sidebar switches behavior at --breakpoint-sidebar (default 1024px):
// an off-canvas drawer below it, a collapsible in-flow column above it.

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
  <div class="sidebar">
    <div id="backdrop" class="sidebar-backdrop"></div>
    <aside id="panel" class="sidebar-panel" data-sp-toggle="#trigger">
      <div class="sidebar-content">
        <div class="sidebar-menu">
          <div class="sidebar-menu-item">
            <a id="first-item" href="#" class="sidebar-menu-button">
              <svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/></svg>
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
    <main class="sidebar-page">
      <button id="trigger" class="btn">Toggle</button>
    </main>
  </div>`;

// Icon-collapse fixture, authored collapsed for first-paint checks.
const ICON = `
  <div class="sidebar">
    <div id="backdrop" class="sidebar-backdrop"></div>
    <aside id="panel" class="sidebar-panel collapsed" data-collapse="icon" data-sp-toggle="#trigger">
      <div class="sidebar-content">
        <div class="sidebar-menu">
          <div class="sidebar-menu-item">
            <a id="first-item" href="#" class="sidebar-menu-button">
              <svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/></svg>
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
    <main class="sidebar-page">
      <button id="trigger" class="btn" aria-expanded="false">Toggle</button>
    </main>
  </div>`;

const panel = (page: Page) => page.locator("#panel");
const trigger = (page: Page) => page.locator("#trigger");
const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? null);

test.describe("mobile drawer", () => {
  test.use({ viewport: { width: 500, height: 800 } });

  test("opens and closes from the trigger with the backdrop in sync", async ({ page }) => {
    await mount(page, BASIC);
    await trigger(page).click();
    await expect(panel(page)).toHaveClass(/shown/);
    await expect(page.locator("#backdrop")).toHaveClass(/shown/);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");

    await trigger(page).click();
    await expect(panel(page)).not.toHaveClass(/shown/);
    await expect(page.locator("#backdrop")).not.toHaveClass(/shown|show|hide/);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("the backdrop click closes the drawer", async ({ page }) => {
    await mount(page, BASIC);
    await trigger(page).click();
    await expect(panel(page)).toHaveClass(/shown/);
    // The backdrop is sized by CSS the harness doesn't load; dispatch directly.
    await page.locator("#backdrop").dispatchEvent("click");
    await expect(panel(page)).not.toHaveClass(/shown/);
  });

  test("Escape closes the drawer", async ({ page }) => {
    await mount(page, BASIC);
    await trigger(page).click();
    await expect(panel(page)).toHaveClass(/shown/);
    await page.keyboard.press("Escape");
    await expect(panel(page)).not.toHaveClass(/shown/);
  });

  test("emits the lifecycle events in order", async ({ page }) => {
    await mount(page, BASIC);
    const events = await page.evaluate(async () => {
      const el = document.querySelector("#panel") as HTMLElement;
      const seen: string[] = [];
      for (const type of ["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]) {
        el.addEventListener(`sp-${type}`, () => seen.push(type));
      }
      const s = (window as any).sp.sidebar(el);
      s.toggle();
      await new Promise((r) => setTimeout(r, 300));
      s.toggle();
      await new Promise((r) => setTimeout(r, 300));
      return seen;
    });
    expect(events).toEqual(["beforeshow", "show", "shown", "beforehide", "hide", "hidden"]);
  });

  test("resizing up to desktop discards the open drawer", async ({ page }) => {
    await mount(page, BASIC);
    await trigger(page).click();
    await expect(panel(page)).toHaveClass(/shown/);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(panel(page)).not.toHaveClass(/shown/);
    await expect(panel(page)).not.toHaveClass(/collapsed/);
  });

  // WAI-ARIA: the open drawer is a modal dialog.
  // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
  test.describe("WAI-ARIA compliance", () => {
    test("wires aria-expanded and aria-controls on the trigger", async ({ page }) => {
      await mount(page, BASIC);
      await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
      await expect(trigger(page)).toHaveAttribute("aria-controls", "panel");
    });

    test("the open drawer announces itself as a modal dialog", async ({ page }) => {
      await mount(page, BASIC);
      await expect(panel(page)).not.toHaveAttribute("role", "dialog");
      await trigger(page).click();
      await expect(panel(page)).toHaveAttribute("role", "dialog");
      await expect(panel(page)).toHaveAttribute("aria-modal", "true");
    });

    test("moves focus into the drawer on open", async ({ page }) => {
      await mount(page, BASIC);
      await trigger(page).click();
      await expect(panel(page)).toHaveClass(/shown/);
      expect(await activeId(page)).toBe("first-item");
    });

    test("clears the dialog role and returns focus to the trigger on close", async ({ page }) => {
      await mount(page, BASIC);
      await trigger(page).click();
      await expect(panel(page)).toHaveClass(/shown/);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("#panel")!.hasAttribute("data-open"));
      await expect(panel(page)).not.toHaveAttribute("role", "dialog");
      await expect(panel(page)).not.toHaveAttribute("aria-modal", "true");
      expect(await activeId(page)).toBe("trigger");
    });
  });
});

test.describe("desktop column", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the trigger toggles collapsed and syncs aria-expanded", async ({ page }) => {
    await mount(page, BASIC);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");

    await trigger(page).click();
    await expect(panel(page)).toHaveClass(/collapsed/);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");

    await trigger(page).click();
    await expect(panel(page)).not.toHaveClass(/collapsed/);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("emits cancelable sp-collapse and sp-expand", async ({ page }) => {
    await mount(page, BASIC);
    const collapsed = await page.evaluate(() => {
      return new Promise((resolve) => {
        const el = document.querySelector("#panel")!;
        el.addEventListener("sp-collapse", () => resolve(true));
        (document.querySelector("#trigger") as HTMLElement).click();
      });
    });
    expect(collapsed).toBe(true);

    await page.evaluate(() => {
      document.querySelector("#panel")!.addEventListener("sp-expand", (e) => e.preventDefault());
    });
    await trigger(page).click();
    await expect(panel(page)).toHaveClass(/collapsed/);
  });

  test("an authored collapsed panel renders collapsed and syncs the trigger", async ({ page }) => {
    await mount(page, BASIC.replace('class="sidebar-panel"', 'class="sidebar-panel collapsed"'));
    await expect(panel(page)).toHaveClass(/collapsed/);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape does nothing on desktop", async ({ page }) => {
    await mount(page, BASIC);
    await page.keyboard.press("Escape");
    await expect(panel(page)).not.toHaveClass(/collapsed/);
  });

  test.describe("icon mode", () => {
    test("an authored collapsed icon panel renders at the rail with no transition", async ({ page }) => {
      await mount(page, ICON);
      // The transition is armed only on the transient classes, so an authored
      // .collapsed never carries .collapsing/.expanding.
      await expect(panel(page)).toHaveClass(/collapsed/);
      await expect(panel(page)).not.toHaveClass(/collapsing|expanding/);
      await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
    });

    test("toggling drives the transient class then settles", async ({ page }) => {
      await mount(page, ICON);
      await trigger(page).click();
      await expect(panel(page)).toHaveClass(/expanding/);
      await expect(panel(page)).not.toHaveClass(/collapsed/);
      await expect(panel(page)).not.toHaveClass(/expanding/);
    });

    test("builds a decorative tooltip per nav button", async ({ page }) => {
      await mount(page, ICON);
      const tip = page.locator(".sidebar-panel > .tooltip");
      await expect(tip).toHaveCount(1);
      await expect(tip).toHaveText("Dashboard");
      await expect(tip).toHaveAttribute("aria-hidden", "true");
      await expect(tip).toHaveAttribute("data-sp-toggle", "#first-item");
      await expect(tip).toHaveAttribute("data-sp-placement", "right");
    });

    test("the tooltip shows only while collapsed", async ({ page }) => {
      await mount(page, ICON);
      const vetoed = (collapsed: boolean) =>
        page.evaluate((isCollapsed) => {
          const p = document.querySelector("#panel")!;
          p.classList.toggle("collapsed", isCollapsed);
          const tip = document.querySelector(".sidebar-panel > .tooltip")!;
          // sp-beforeshow returns false (vetoed) when not collapsed.
          return !tip.dispatchEvent(new CustomEvent("sp-beforeshow", { cancelable: true }));
        }, collapsed);
      expect(await vetoed(false)).toBe(true);
      expect(await vetoed(true)).toBe(false);
    });
  });
});
