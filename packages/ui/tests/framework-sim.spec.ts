import { test, expect, type Page } from "@playwright/test";

// Simulates how frameworks (React keyed reorder / portals, conditional render,
// StrictMode double-mount) manipulate the DOM, and verifies the observer model
// holds up: same-node moves keep the instance, remounts rebuild cleanly, and
// unmounts dispose + reset ARIA on the persistent trigger with no leaks.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

// A persistent trigger plus a "region" the framework swaps the panel inside.
const SCENE = `
  <button id="trigger" class="btn">Open</button>
  <div id="region">
    <div id="pop" class="popover" data-sp-popover="toggle: #trigger"><p>Body</p></div>
  </div>
  <div id="slot"></div>`;

const POP_HTML = `<div id="pop" class="popover" data-sp-popover="toggle: #trigger"><p>Body</p></div>`;

async function scene(page: Page) {
  await page.evaluate(async (html) => {
    document.body.innerHTML = html;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, SCENE);
}

// Wait for the observer to have an instance for #pop.
async function hasInstance(page: Page) {
  return page.evaluate(() => {
    const el = document.getElementById("pop");
    return el ? !!(window as any).sp.popover(el) : false;
  });
}

test.describe("node move (portal / keyed reorder)", () => {
  test("a moved node keeps the SAME instance (not rebuilt)", async ({ page }) => {
    await scene(page);
    // Stamp the current instance.
    const before = await page.evaluate(() => {
      const inst = (window as any).sp.popover(document.getElementById("pop"));
      inst.__stamp = "abc123";
      return inst.__stamp;
    });
    expect(before).toBe("abc123");

    // Move the same node to another parent (appendChild moves, doesn't clone).
    await page.evaluate(() => {
      document.getElementById("slot")!.appendChild(document.getElementById("pop")!);
    });
    await page.waitForTimeout(50); // let the observer process the mutation

    const after = await page.evaluate(() => {
      const inst = (window as any).sp.popover(document.getElementById("pop"));
      return inst?.__stamp ?? null;
    });
    // Same instance survived the move -> stamp intact. Rebuilt -> null.
    expect(after).toBe("abc123");
  });

  test("a moved popover is still functional", async ({ page }) => {
    await scene(page);
    await page.evaluate(() => {
      document.getElementById("slot")!.appendChild(document.getElementById("pop")!);
    });
    await page.waitForTimeout(50);

    await page.click("#trigger");
    await expect(page.locator("#pop")).toHaveClass(/shown/);
  });
});

test.describe("keyed remount (node replaced)", () => {
  test("replacing the node gives a fresh, working instance", async ({ page }) => {
    await scene(page);
    await page.click("#trigger");
    await expect(page.locator("#pop")).toHaveClass(/shown/);

    // Framework swaps the region's contents (new node, same id).
    await page.evaluate((html) => {
      document.getElementById("region")!.innerHTML = html;
    }, POP_HTML);
    await page.waitForFunction(() => {
      const el = document.getElementById("pop");
      return el ? !!(window as any).sp.popover(el) : false;
    });

    // The trigger still opens the new node.
    await page.click("#trigger");
    await expect(page.locator("#pop")).toHaveClass(/shown/);
  });
});

test.describe("unmount", () => {
  test("removing the node disposes it and resets the trigger's ARIA", async ({ page }) => {
    await scene(page);
    await page.click("#trigger");
    await expect(page.locator("#trigger")).toHaveAttribute("aria-expanded", "true");

    await page.evaluate(() => {
      document.getElementById("region")!.innerHTML = "";
    });
    await page.waitForTimeout(50);

    expect(await hasInstance(page)).toBe(false);
    // The persistent trigger must not be left pointing at a gone node.
    await expect(page.locator("#trigger")).not.toHaveAttribute("aria-expanded", /.*/);
    await expect(page.locator("#trigger")).not.toHaveAttribute("aria-controls", /.*/);
  });

  test("unmounting WHILE OPEN stops autoUpdate (no anchor leak)", async ({ page }) => {
    await scene(page);
    await page.click("#trigger");
    await expect(page.locator("#pop")).toHaveClass(/shown/);
    // autoUpdate is running while open.
    expect(
      await page.evaluate(() => {
        const inst = (window as any).sp.popover(document.getElementById("pop"));
        return !!inst._stopAnchorFn;
      }),
    ).toBe(true);

    await page.evaluate(() => {
      document.getElementById("region")!.innerHTML = "";
    });
    await page.waitForTimeout(50);

    expect(await page.evaluate(() => !!document.getElementById("pop"))).toBe(false);
    await expect(page.locator("#trigger")).not.toHaveAttribute("aria-expanded", /.*/);
  });
});

test("remount cycle x3: exactly one working instance, no doubled listeners", async ({ page }) => {
  await scene(page);
  for (let i = 0; i < 3; i++) {
    await page.evaluate((html) => {
      document.getElementById("region")!.innerHTML = html;
    }, POP_HTML);
    await page.waitForFunction(() => {
      const el = document.getElementById("pop");
      return el ? !!(window as any).sp.popover(el) : false;
    });
  }
  // One click -> opens once (no stacked instances re-toggling it shut).
  await page.click("#trigger");
  await expect(page.locator("#pop")).toHaveClass(/shown/);
});
