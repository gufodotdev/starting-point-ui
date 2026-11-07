import { test, expect, type Page } from "@playwright/test";

// Input OTP marks the selected boxes active, selects a typed character under
// the caret, and filters typing through a pattern.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const otp = (value = "", attrs = "") => `
  <label id="otp" class="input-otp">
    <span></span><span></span><span></span><span></span>
    <input id="code" maxlength="4" value="${value}" aria-label="Code" ${attrs} />
  </label>`;

const boxes = (page: Page, state: "active" | "caret") =>
  page.locator("#otp > span").evaluateAll(
    (spans, cls) => spans.flatMap((span, i) => (span.classList.contains(cls) ? [i] : [])),
    state,
  );

const settle = (page: Page) => page.evaluate(() => new Promise((r) => setTimeout(r, 30)));

test("activates the first box with a caret on focus", async ({ page }) => {
  await mount(page, otp());
  await page.focus("#code");
  expect(await boxes(page, "active")).toEqual([0]);
  expect(await boxes(page, "caret")).toEqual([0]);
});

test("moves the active box as the code is typed", async ({ page }) => {
  await mount(page, otp());
  await page.focus("#code");
  await page.keyboard.type("12");
  await settle(page);
  expect(await boxes(page, "active")).toEqual([2]);
});

test("selects the last character of a full code, so typing replaces it", async ({ page }) => {
  await mount(page, otp("1234"));
  await page.focus("#code");
  expect(await boxes(page, "active")).toEqual([3]);
  expect(await boxes(page, "caret")).toEqual([]);
  await page.keyboard.type("9");
  expect(await page.inputValue("#code")).toBe("1239");
});

test("activates every box of a select all, and backspace clears the code", async ({ page }) => {
  await mount(page, otp("1234"));
  await page.focus("#code");
  await page.keyboard.press("ControlOrMeta+a");
  await settle(page);
  expect(await boxes(page, "active")).toEqual([0, 1, 2, 3]);
  await page.keyboard.press("Backspace");
  await settle(page);
  expect(await page.inputValue("#code")).toBe("");
  expect(await boxes(page, "active")).toEqual([0]);
});

test("steps back through the code with the arrow keys", async ({ page }) => {
  await mount(page, otp("123"));
  await page.focus("#code");
  await page.keyboard.press("ArrowLeft");
  await settle(page);
  expect(await boxes(page, "active")).toEqual([2]);
  await page.keyboard.press("ArrowLeft");
  await settle(page);
  expect(await boxes(page, "active")).toEqual([1]);
  await page.keyboard.type("9");
  expect(await page.inputValue("#code")).toBe("193");
});

test("selects the character of a clicked box", async ({ page }) => {
  await mount(page, otp("1234"));
  await page.locator("#otp > span").nth(1).dispatchEvent("click");
  await settle(page);
  expect(await boxes(page, "active")).toEqual([1]);
  await page.keyboard.type("7");
  expect(await page.inputValue("#code")).toBe("1734");
});

test("moves the caret back to the end when an empty box is clicked", async ({ page }) => {
  await mount(page, otp("12"));
  await page.locator("#otp > span").nth(0).dispatchEvent("click");
  await page.locator("#otp > span").nth(3).dispatchEvent("click");
  await settle(page);
  expect(await boxes(page, "active")).toEqual([2]);
  await page.keyboard.type("3");
  expect(await page.inputValue("#code")).toBe("123");
});

test("filters typed characters through a pattern", async ({ page }) => {
  await mount(page, otp("", 'pattern="[0-9]{4}"'));
  await page.focus("#code");
  await page.keyboard.type("1a2");
  expect(await page.inputValue("#code")).toBe("12");
});

test("emits sp-complete once the last box is filled", async ({ page }) => {
  await mount(page, otp());
  await page.evaluate(() => {
    const w = window as unknown as { completed: string[] };
    w.completed = [];
    document.getElementById("otp")!.addEventListener("sp-complete", (e) => w.completed.push((e as CustomEvent).detail.value));
  });
  await page.focus("#code");
  await page.keyboard.type("1234");
  expect(await page.evaluate(() => (window as unknown as { completed: string[] }).completed)).toEqual(["1234"]);
});

test("follows a value set from script", async ({ page }) => {
  await mount(page, otp("1234"));
  await page.focus("#code");
  await page.evaluate(() => {
    (document.getElementById("code") as HTMLInputElement).value = "";
  });
  await settle(page);
  expect(await boxes(page, "active")).toEqual([0]);
});

test("clears the active box on blur", async ({ page }) => {
  await mount(page, otp());
  await page.focus("#code");
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  expect(await boxes(page, "active")).toEqual([]);
});

test("removes its classes when disposed", async ({ page }) => {
  await mount(page, otp());
  await page.focus("#code");
  await page.evaluate(() => window.sp.inputOtp(document.getElementById("otp")!)?.dispose());
  expect(await boxes(page, "active")).toEqual([]);
});
