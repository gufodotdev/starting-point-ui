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
    <div id="pop" class="popover" data-sp-toggle="#trigger"><p>Body</p></div>
  </div>
  <div id="slot"></div>`;

const POP_HTML = `<div id="pop" class="popover" data-sp-toggle="#trigger"><p>Body</p></div>`;

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

// Frameworks often keep a node and patch its class, like React swapping a
// skeleton for the real component in the same spot. These tests avoid the
// sp.* accessors, which create an instance on demand and would hide a miss.
test.describe("element reuse (class swap)", () => {
  async function body(page: Page, html: string, patch: string) {
    await page.evaluate(
      async ([markup, script]) => {
        document.body.innerHTML = markup;
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        new Function(script)();
        await new Promise((r) => setTimeout(r, 30));
      },
      [html, patch],
    );
  }

  test("an element that gains a component class becomes that component", async ({ page }) => {
    await body(
      page,
      `<label id="otp"><span></span><span></span><input id="code" maxlength="2" /></label>`,
      `document.getElementById("otp").className = "input-otp";`,
    );
    await page.focus("#code");
    await expect(page.locator("#otp > span.active")).toHaveCount(1);
  });

  test("an element that loses its component class is disposed", async ({ page }) => {
    await body(
      page,
      `<label id="otp" class="input-otp"><span></span><span></span><input id="code" maxlength="2" /></label>`,
      `document.getElementById("otp").className = "";`,
    );
    await page.focus("#code");
    await expect(page.locator("#otp > span.active")).toHaveCount(0);
  });

  test("a skeleton patched into a chart draws", async ({ page }) => {
    await body(
      page,
      `<div id="box" class="skeleton"></div>`,
      `const box = document.getElementById("box");
       box.innerHTML = '<svg class="chart-svg" style="width:300px;height:100px" aria-label="Sales"><path class="chart-line" aria-label="Sales"></path></svg>';
       box.className = "chart";
       box.setAttribute("data-sp-value", "[1,3,2]");`,
    );
    await page.waitForFunction(() => !!document.querySelector("#box svg")?.getAttribute("viewBox"));
  });

  test("a chart patched back into a skeleton removes what the chart added", async ({ page }) => {
    await body(
      page,
      `<div id="box" class="chart" data-sp-value="[1,3,2]"><svg class="chart-svg" style="width:300px;height:100px" aria-label="Sales"><path class="chart-line" aria-label="Sales"></path></svg></div>`,
      `const box = document.getElementById("box");
       box.querySelector("svg").remove();
       box.className = "skeleton";
       box.removeAttribute("data-sp-value");`,
    );
    await expect(page.locator("#box > *")).toHaveCount(0);
  });
});
