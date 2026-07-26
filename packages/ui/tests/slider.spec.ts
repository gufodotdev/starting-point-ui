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

const val = (page: Page) =>
  page.evaluate(() =>
    document.querySelector<HTMLElement>(".slider")!.style.getPropertyValue("--val"),
  );

test("computes the initial fill on init", async ({ page }) => {
  await mount(page, `<input type="range" class="slider" min="0" max="100" value="50" />`);
  expect(await val(page)).toBe("50%");
});

test("updates the fill on input", async ({ page }) => {
  await mount(page, `<input type="range" class="slider" min="0" max="100" value="50" />`);
  await page.locator(".slider").fill("75");
  expect(await val(page)).toBe("75%");
});

test("maps custom min/max ranges to percentages", async ({ page }) => {
  await mount(page, `<input type="range" class="slider" min="100" max="200" value="150" />`);
  expect(await val(page)).toBe("50%");
});

test("falls back to the native 0-100 range when min/max are unset", async ({ page }) => {
  await mount(page, `<input type="range" class="slider" value="30" />`);
  expect(await val(page)).toBe("30%");
});

test("mirrors the value into data-sp-slider-value targets", async ({ page }) => {
  await mount(
    page,
    `<input type="range" class="slider" id="vol" min="0" max="100" value="40" />
     <span id="out" data-sp-slider-value="vol"></span>`,
  );
  await expect(page.locator("#out")).toHaveText("40");
  await page.locator(".slider").fill("80");
  await expect(page.locator("#out")).toHaveText("80");
});

test("a form submits the slider value", async ({ page }) => {
  await mount(
    page,
    `<form>
       <input type="range" class="slider" name="volume" min="0" max="100" value="60" />
     </form>`,
  );
  const read = () =>
    page.evaluate(() => new FormData(document.querySelector("form")!).get("volume"));
  expect(await read()).toBe("60");
  await page.locator(".slider").fill("85");
  expect(await read()).toBe("85");
});

test("sp.slider(el).update() refreshes after programmatic changes", async ({ page }) => {
  await mount(
    page,
    `<input type="range" class="slider" id="vol" min="0" max="100" value="40" />
     <span id="out" data-sp-slider-value="vol"></span>`,
  );
  await page.evaluate(() => {
    const el = document.querySelector<HTMLInputElement>(".slider")!;
    el.value = "90";
    (window as any).sp.slider(el).update();
  });
  expect(await val(page)).toBe("90%");
  await expect(page.locator("#out")).toHaveText("90");
});

test.describe("slider range", () => {
  const RANGE = `
    <div id="range" class="slider-range" style="--val-min: 25%; --val-max: 75%">
      <input id="lo" type="range" class="slider" max="100" value="25" />
      <input id="hi" type="range" class="slider" max="100" value="75" />
    </div>`;

  test("paints the shared fill from both values", async ({ page }) => {
    await mount(page, RANGE);
    await page.evaluate(() => {
      const lo = document.querySelector("#lo") as HTMLInputElement;
      lo.value = "40";
      lo.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const vars = await page.evaluate(() => {
      const el = document.querySelector("#range") as HTMLElement;
      return [el.style.getPropertyValue("--val-min"), el.style.getPropertyValue("--val-max")];
    });
    expect(vars).toEqual(["40%", "75%"]);
  });

  test("thumbs may meet but never cross", async ({ page }) => {
    await mount(page, RANGE);
    const value = await page.evaluate(() => {
      const lo = document.querySelector("#lo") as HTMLInputElement;
      lo.value = "90";
      lo.dispatchEvent(new Event("input", { bubbles: true }));
      return lo.value;
    });
    expect(value).toBe("75");
  });
});
