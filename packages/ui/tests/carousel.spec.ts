import { test, expect, type Page } from "@playwright/test";

// The harness has no CSS, so the fixtures carry inline scroll geometry:
// a 200px viewport with three 200px slides.

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
  <div class="carousel" id="c" style="position:relative;width:200px">
    <div class="carousel-content" style="display:flex;overflow-x:auto;width:200px">
      <div class="carousel-item" id="s1" style="flex:0 0 200px;height:40px">1</div>
      <div class="carousel-item" id="s2" style="flex:0 0 200px;height:40px">2</div>
      <div class="carousel-item" id="s3" style="flex:0 0 200px;height:40px">3</div>
    </div>
    <button class="carousel-previous" id="prev">Previous</button>
    <button class="carousel-next" id="next">Next</button>
  </div>`;

const VERTICAL = BASIC.replace('class="carousel"', 'class="carousel carousel-vertical"')
  .replace(
    'style="display:flex;overflow-x:auto;width:200px"',
    'style="display:flex;flex-direction:column;overflow-y:auto;height:100px"',
  )
  .replaceAll("flex:0 0 200px;height:40px", "flex:0 0 100px");

const scrollLeft = (page: Page) =>
  page.evaluate(() => document.querySelector(".carousel-content")!.scrollLeft);

async function trackChanges(page: Page) {
  await page.evaluate(() => {
    (window as never as { _changes: unknown[] })._changes = [];
    document.querySelector("#c")?.addEventListener("sp-change", (e) => {
      (window as never as { _changes: unknown[] })._changes.push((e as CustomEvent).detail);
    });
  });
}

const changes = (page: Page) =>
  page.evaluate(() => (window as never as { _changes: unknown[] })._changes);

test("wires region and slide aria", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#c")).toHaveRole("region");
  await expect(page.locator("#c")).toHaveAttribute("aria-roledescription", "carousel");
  await expect(page.locator("#s1")).toHaveRole("group");
  await expect(page.locator("#s1")).toHaveAttribute("aria-roledescription", "slide");
});

test("previous is disabled at the start and next at the end", async ({ page }) => {
  await mount(page, BASIC);
  await expect(page.locator("#prev")).toBeDisabled();
  await expect(page.locator("#next")).toBeEnabled();
  await page.evaluate(() => window.sp.carousel(document.querySelector("#c")!)?.to(2));
  await expect.poll(() => scrollLeft(page)).toBe(400);
  await expect(page.locator("#next")).toBeDisabled();
  await expect(page.locator("#prev")).toBeEnabled();
});

test("the next button scrolls one slide and fires sp-change", async ({ page }) => {
  await mount(page, BASIC);
  await trackChanges(page);
  await page.click("#next");
  await expect.poll(() => scrollLeft(page)).toBe(200);
  await expect.poll(() => changes(page)).toEqual([{ index: 1, count: 3 }]);
  await page.click("#prev");
  await expect.poll(() => scrollLeft(page)).toBe(0);
  await expect.poll(() => changes(page)).toEqual([
    { index: 1, count: 3 },
    { index: 0, count: 3 },
  ]);
});

test("arrow keys navigate", async ({ page }) => {
  await mount(page, BASIC);
  const press = (key: string) =>
    page.evaluate((k) => {
      document.querySelector("#c")?.dispatchEvent(
        new KeyboardEvent("keydown", { key: k, bubbles: true }),
      );
    }, key);
  await press("ArrowRight");
  await expect.poll(() => scrollLeft(page)).toBe(200);
  await press("ArrowLeft");
  await expect.poll(() => scrollLeft(page)).toBe(0);
});

test("index and count reflect the position", async ({ page }) => {
  await mount(page, BASIC);
  await page.click("#next");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const api = window.sp.carousel(document.querySelector("#c")!);
        return [api?.index(), api?.count()];
      }),
    )
    .toEqual([1, 3]);
});

test("mouse drag moves the track and settles on a slide", async ({ page }) => {
  await mount(page, BASIC);
  const content = page.locator(".carousel-content");
  const box = (await content.boundingBox())!;
  await page.mouse.move(box.x + 150, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + 20, { steps: 8 });
  expect(await scrollLeft(page)).toBeGreaterThan(0);
  await page.mouse.up();
  await expect.poll(() => scrollLeft(page)).toBe(200);
});

test("a click that was a drag does not activate slide content", async ({ page }) => {
  await mount(
    page,
    BASIC.replace(
      '<div class="carousel-item" id="s1" style="flex:0 0 200px;height:40px">1</div>',
      '<div class="carousel-item" id="s1" style="flex:0 0 200px;height:40px"><button id="inner" onclick="window._clicked=((window._clicked||0)+1)" style="width:100%;height:40px">1</button></div>',
    ),
  );
  const content = page.locator(".carousel-content");
  const box = (await content.boundingBox())!;
  await page.mouse.move(box.x + 150, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 20, { steps: 5 });
  await page.mouse.up();
  expect(await page.evaluate(() => (window as never as { _clicked?: number })._clicked)).toBeUndefined();
  await page.evaluate(() => window.sp.carousel(document.querySelector("#c")!)?.to(0));
  await expect.poll(() => scrollLeft(page)).toBe(0);
  await page.click("#inner");
  expect(await page.evaluate(() => (window as never as { _clicked?: number })._clicked)).toBe(1);
});

test("vertical mode scrolls on ArrowDown and ArrowUp", async ({ page }) => {
  await mount(page, VERTICAL);
  const scrollTop = () =>
    page.evaluate(() => document.querySelector(".carousel-content")!.scrollTop);
  const press = (key: string) =>
    page.evaluate((k) => {
      document.querySelector("#c")?.dispatchEvent(
        new KeyboardEvent("keydown", { key: k, bubbles: true }),
      );
    }, key);
  await press("ArrowDown");
  await expect.poll(scrollTop).toBe(100);
  await press("ArrowUp");
  await expect.poll(scrollTop).toBe(0);
  await press("ArrowRight");
  await expect.poll(scrollTop).toBe(0);
});

test("loop clones the edges and wraps with a glide", async ({ page }) => {
  await mount(page, BASIC.replace('class="carousel"', 'class="carousel" data-sp-loop'));
  const clones = await page.evaluate(() => {
    const copies = [...document.querySelectorAll("[data-sp-clone]")];
    return {
      count: copies.length,
      hidden: copies.every((el) => el.getAttribute("aria-hidden") === "true"),
      children: document.querySelector(".carousel-content")!.children.length,
    };
  });
  expect(clones).toEqual({ count: 2, hidden: true, children: 5 });
  expect(await scrollLeft(page)).toBe(200);
  await expect(page.locator("#prev")).toBeEnabled();
  await page.click("#prev");
  await expect.poll(() => scrollLeft(page)).toBe(600);
  await expect(page.locator("#next")).toBeEnabled();
  await page.click("#next");
  await expect.poll(() => scrollLeft(page)).toBe(200);
  await page.click("#next");
  await expect.poll(() => scrollLeft(page)).toBe(400);
});

test("autoplay advances and wraps back to the start", async ({ page }) => {
  await mount(
    page,
    BASIC.replace('class="carousel"', 'class="carousel" data-sp-autoplay="300"'),
  );
  const often = { intervals: [50], timeout: 5000 };
  await expect.poll(() => scrollLeft(page), often).toBe(400);
  await expect.poll(() => scrollLeft(page), often).toBe(0);
});

test("autoplay pauses while hovered", async ({ page }) => {
  await mount(
    page,
    BASIC.replace('class="carousel"', 'class="carousel" data-sp-autoplay="400"'),
  );
  await page.hover("#c");
  await page.waitForTimeout(900);
  expect(await scrollLeft(page)).toBe(0);
});

test("double-click selects slide text", async ({ page }) => {
  await mount(page, BASIC);
  await page.dblclick("#s1", { position: { x: 4, y: 12 } });
  expect(
    await page.evaluate(() => window.getSelection()?.toString().trim()),
  ).toBe("1");
});

test("a drag does not leave text selected", async ({ page }) => {
  await mount(page, BASIC);
  const box = (await page.locator(".carousel-content").boundingBox())!;
  await page.mouse.move(box.x + 150, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + 20, { steps: 8 });
  await page.mouse.up();
  expect(
    await page.evaluate(() => window.getSelection()?.toString() ?? ""),
  ).toBe("");
});

test("a jittered double-click keeps its selection and does not drag", async ({
  page,
}) => {
  await mount(page, BASIC);
  const box = (await page.locator("#s1").boundingBox())!;
  const x = box.x + 4;
  const y = box.y + 12;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.move(x + 8, y);
  await page.mouse.up({ clickCount: 2 });
  expect(
    await page.evaluate(() => window.getSelection()?.toString() ?? ""),
  ).toContain("1");
  expect(await scrollLeft(page)).toBe(0);
});

test("data-sp-no-drag content never starts a drag", async ({ page }) => {
  await mount(
    page,
    BASIC.replace(
      '<div class="carousel-item" id="s1" style="flex:0 0 200px;height:40px">1</div>',
      '<div class="carousel-item" id="s1" style="flex:0 0 200px;height:40px"><div data-sp-no-drag style="height:40px">1</div></div>',
    ),
  );
  const content = page.locator(".carousel-content");
  const box = (await content.boundingBox())!;
  await page.mouse.move(box.x + 150, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + 20, { steps: 8 });
  await page.mouse.up();
  expect(await scrollLeft(page)).toBe(0);
});

test("dragging from text selects it instead of scrolling", async ({ page }) => {
  await mount(page, BASIC);
  const box = (await page.locator("#s1").boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + 12);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 12, { steps: 50 });
  await page.mouse.up();
  expect(
    await page.evaluate(() => window.getSelection()?.toString() ?? ""),
  ).toContain("1");
  expect(await scrollLeft(page)).toBe(0);
});

test("exposes index and count as CSS variables", async ({ page }) => {
  await mount(page, BASIC);
  const vars = () =>
    page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("#c")!;
      return [
        el.style.getPropertyValue("--sp-carousel-index"),
        el.style.getPropertyValue("--sp-carousel-count"),
      ];
    });
  expect(await vars()).toEqual(["0", "3"]);
  await page.click("#next");
  await expect.poll(async () => (await vars())[0]).toBe("1");
});

test("a drag flick past the last slide wraps onto the first", async ({
  page,
}) => {
  await mount(page, BASIC.replace('class="carousel"', 'class="carousel" data-sp-loop'));
  await page.evaluate(() =>
    window.sp.carousel(document.querySelector("#c")!)?.to(2),
  );
  await expect.poll(() => scrollLeft(page)).toBe(600);
  const content = page.locator(".carousel-content");
  const box = (await content.boundingBox())!;
  await page.mouse.move(box.x + 150, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + 20, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => scrollLeft(page), { timeout: 5000 }).toBe(200);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.sp.carousel(document.querySelector("#c")!)?.index(),
      ),
    )
    .toBe(0);
});

const FADE = `
  <div class="carousel carousel-fade" id="c" style="position:relative;width:200px">
    <div class="carousel-content">
      <div class="carousel-item active" id="s1">1</div>
      <div class="carousel-item" id="s2">2</div>
      <div class="carousel-item" id="s3">3</div>
    </div>
    <button class="carousel-previous" id="prev">Previous</button>
    <button class="carousel-next" id="next">Next</button>
  </div>`;

test("fade mode toggles the active class", async ({ page }) => {
  await mount(page, FADE);
  await trackChanges(page);
  await expect(page.locator("#s1")).toHaveClass(/active/);
  await expect(page.locator("#prev")).toBeDisabled();
  await page.click("#next");
  await expect(page.locator("#s2")).toHaveClass(/active/);
  await expect(page.locator("#s1")).not.toHaveClass(/active/);
  expect(
    await page.evaluate(() =>
      document.querySelector("#s1")?.hasAttribute("inert"),
    ),
  ).toBe(true);
  await expect.poll(() => changes(page)).toEqual([{ index: 1, count: 3 }]);
});

test("fade mode loops with modulo and no clones", async ({ page }) => {
  await mount(
    page,
    FADE.replace(
      'class="carousel carousel-fade"',
      'class="carousel carousel-fade" data-sp-loop',
    ),
  );
  expect(
    await page.evaluate(
      () => document.querySelectorAll("[data-sp-clone]").length,
    ),
  ).toBe(0);
  await expect(page.locator("#prev")).toBeEnabled();
  await page.click("#prev");
  await expect(page.locator("#s3")).toHaveClass(/active/);
  await page.click("#next");
  await expect(page.locator("#s1")).toHaveClass(/active/);
});

test("carousel-pagination children page and carry active", async ({ page }) => {
  await mount(
    page,
    BASIC.replace(
      '<button class="carousel-previous" id="prev">',
      '<div class="carousel-pagination" id="dots"><button class="active"></button><button></button><button></button></div><div class="carousel-pagination" id="dots2"><button class="active"></button><button></button><button></button></div><button class="carousel-previous" id="prev">',
    ),
  );
  await expect(page.locator("#dots > *").first()).toHaveClass(/active/);
  await page.click("#next");
  await expect(page.locator("#dots > *").nth(1)).toHaveClass(/active/);
  await expect(page.locator("#dots2 > *").nth(1)).toHaveClass(/active/);
  await page.click("#dots2 > *:nth-child(3)");
  await expect.poll(() => scrollLeft(page)).toBe(400);
  await expect(page.locator("#dots > *").nth(2)).toHaveClass(/active/);
});

test("a hidden carousel keeps its authored state until it can lay out", async ({ page }) => {
  const hidden = `<div id="wrap" style="display:none">${BASIC.replace('id="prev"', 'id="prev" disabled')}</div>`;
  await mount(page, hidden);
  await expect(page.locator("#prev")).toBeDisabled();
  await expect(page.locator("#next")).toBeEnabled();
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("#wrap")!.style.display = "block";
  });
  await page.locator("#next").click();
  await expect.poll(() => scrollLeft(page)).toBe(200);
  await expect(page.locator("#prev")).toBeEnabled();
});

test("a nested carousel keeps its own controls", async ({ page }) => {
  await mount(
    page,
    `<div class="carousel" id="c" style="position:relative;width:200px">
      <div class="carousel-content" style="display:flex;overflow-x:auto;width:200px">
        <div class="carousel-item" style="flex:0 0 200px;height:40px">1</div>
        <div class="carousel-item" style="flex:0 0 200px;height:40px">2</div>
      </div>
      <div class="carousel carousel-fade" id="inner">
        <div class="carousel-content">
          <div class="carousel-item active">a</div>
          <div class="carousel-item">b</div>
        </div>
        <button class="carousel-next" id="inner-next">In</button>
      </div>
      <button class="carousel-next" id="next">Out</button>
    </div>`,
  );
  await page.locator("#inner-next").click();
  await page.waitForTimeout(100);
  await expect(page.locator("#inner .carousel-item.active")).toHaveText("b");
  await expect.poll(() => scrollLeft(page)).toBe(0);
  await page.locator("#next").click();
  await expect.poll(() => scrollLeft(page)).toBe(200);
  await expect(page.locator("#inner-next")).toBeDisabled();
  await expect(page.locator("#next")).toBeDisabled();
});
