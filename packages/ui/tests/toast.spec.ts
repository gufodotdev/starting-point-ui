import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

const toasts = (page: Page) => page.locator(".toast");

test("creates a toast in a top-layer live region", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast("Saved", { duration: 0 }));
  await expect(toasts(page)).toHaveCount(1);
  await expect(toasts(page)).toHaveClass(/shown/);
  await expect(toasts(page)).toHaveAttribute("role", "status");

  const container = page.locator("[data-sp-toast-container]");
  await expect(container).toHaveAttribute("aria-live", "polite");
  await expect(container).toHaveClass(/toaster-bottom-right/);
  expect(await container.evaluate((el) => el.matches(":popover-open"))).toBe(true);
});

test("stacks toasts with offsets, newest closest to the edge", async ({ page }) => {
  await page.evaluate(() => {
    (window as any).sp.toast("One", { duration: 0 });
    (window as any).sp.toast("Two", { duration: 0 });
  });
  await expect(toasts(page)).toHaveCount(2);
  const offsets = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".toast")].map((el) => [
      el.textContent?.trim(),
      el.style.getPropertyValue("--offset"),
    ]),
  );
  expect(offsets).toEqual([
    ["One", expect.stringMatching(/^-[1-9]\d*px$/)],
    ["Two", "0px"],
  ]);
});

test("computes the collapsed stack variables", async ({ page }) => {
  await page.evaluate(() => {
    for (const t of ["One", "Two", "Three", "Four"]) {
      (window as any).sp.toast(t, { duration: 0 });
    }
  });
  await expect(toasts(page)).toHaveCount(4);
  const stack = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".toast")].map((el) => ({
      title: el.querySelector(".toast-title")?.textContent,
      index: el.style.getPropertyValue("--index"),
      z: el.style.zIndex,
      stacked: el.hasAttribute("data-sp-stacked"),
      overflow: el.hasAttribute("data-sp-stack-overflow"),
    })),
  );
  // DOM order is oldest-first; the newest toast gets index 0 and the top z.
  expect(stack).toEqual([
    { title: "One", index: "3", z: "1", stacked: true, overflow: true },
    { title: "Two", index: "2", z: "2", stacked: true, overflow: false },
    { title: "Three", index: "1", z: "3", stacked: true, overflow: false },
    { title: "Four", index: "0", z: "4", stacked: false, overflow: false },
  ]);

  const frontHeight = await page.evaluate(() =>
    document
      .querySelector<HTMLElement>("[data-sp-toast-container]")!
      .style.getPropertyValue("--front-toast-height"),
  );
  expect(frontHeight).toMatch(/px$/);
});

test("emits the lifecycle events", async ({ page }) => {
  const events = await page.evaluate(async () => {
    const seen: string[] = [];
    for (const type of ["show", "shown", "hide", "hidden"]) {
      document.addEventListener(`sp-${type}`, () => seen.push(type));
    }
    const t = (window as any).sp.toast("Hello", { duration: 0 });
    await new Promise((r) => setTimeout(r, 200));
    await t.dismiss();
    return seen;
  });
  expect(events).toEqual(["show", "shown", "hide", "hidden"]);
});

test("auto-dismisses after its duration and removes the container", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast("Bye", { duration: 100 }));
  await expect(toasts(page)).toHaveCount(1);
  await expect(toasts(page)).toHaveCount(0);
  await expect(page.locator("[data-sp-toast-container]")).toHaveCount(0);
});

test("duration 0 makes a toast sticky", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast("Sticky", { duration: 0 }));
  await page.waitForTimeout(300);
  await expect(toasts(page)).toHaveCount(1);
});

test("hovering pauses the auto-dismiss timer", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast("Hover me", { duration: 300 }));
  await toasts(page).hover();
  await page.waitForTimeout(600);
  await expect(toasts(page)).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(toasts(page)).toHaveCount(0);
});

test("the close button dismisses", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast("Close me", { duration: 0 }));
  await toasts(page).hover();
  await page.click(".toast-close");
  await expect(toasts(page)).toHaveCount(0);
});

test("the action button runs its callback and dismisses", async ({ page }) => {
  await page.evaluate(() => {
    (window as any).sp.toast("Deleted", {
      duration: 0,
      action: { label: "Undo", onClick: () => ((window as any).__undone = true) },
    });
  });
  await page.click(".toast-action button");
  expect(await page.evaluate(() => (window as any).__undone)).toBe(true);
  await expect(toasts(page)).toHaveCount(0);
});

test("update swaps content and type in place", async ({ page }) => {
  await page.evaluate(() => {
    const t = (window as any).sp.toast.loading("Saving...");
    (window as any).__toast = t;
  });
  await expect(toasts(page)).toHaveClass(/toast-loading/);
  await page.evaluate(() =>
    (window as any).__toast.update({ title: "Saved", type: "success", duration: 0 }),
  );
  await expect(toasts(page)).toHaveClass(/toast-success/);
  await expect(toasts(page)).not.toHaveClass(/toast-loading/);
  await expect(page.locator(".toast-title")).toHaveText("Saved");
});

test("sugar methods set the type", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast.error("Nope", { duration: 0 }));
  await expect(toasts(page)).toHaveClass(/toast-error/);
  expect(await page.locator(".toast-icon").count()).toBe(1);
});

test("loading toasts are sticky and not dismissible", async ({ page }) => {
  await page.evaluate(() => (window as any).sp.toast("Working", { type: "loading" }));
  await page.waitForTimeout(300);
  await expect(toasts(page)).toHaveCount(1);
  expect(await page.locator(".toast-close").count()).toBe(0);
});

test("dismissAll clears every toast", async ({ page }) => {
  await page.evaluate(() => {
    (window as any).sp.toast("One", { duration: 0 });
    (window as any).sp.toast("Two", { duration: 0, position: "top-left" });
  });
  await expect(toasts(page)).toHaveCount(2);
  await page.evaluate(() => (window as any).sp.toast.dismissAll());
  await expect(toasts(page)).toHaveCount(0);
});

test("a [data-sp-toast] element fires as a toast and removes itself", async ({ page }) => {
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.id = "flash";
    el.setAttribute(
      "data-sp-toast",
      JSON.stringify({ title: "Post created", type: "success", duration: 0 }),
    );
    document.body.appendChild(el);
  });
  await expect(toasts(page)).toHaveCount(1);
  await expect(page.locator(".toast-title")).toHaveText("Post created");
  await expect(toasts(page)).toHaveClass(/toast-success/);
  await expect(page.locator("#flash")).toHaveCount(0);
});

test("a plain string [data-sp-toast] works too", async ({ page }) => {
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.setAttribute("data-sp-toast", "Changes saved");
    document.body.appendChild(el);
  });
  await expect(page.locator(".toast-title")).toHaveText("Changes saved");
});
