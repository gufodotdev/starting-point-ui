import { test, expect, type Page } from "@playwright/test";

// The harness has no CSS, so the fixtures carry inline scroll geometry:
// a 200px viewport over 80px items, gap 0.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

function fixture({
  attrs = "",
  items = 5,
  anchors = [] as number[],
} = {}): string {
  const rows = Array.from({ length: items }, (_, i) => {
    const anchor = anchors.includes(i) ? " data-sp-anchor" : "";
    return `<div class="message-scroller-item" id="m${i + 1}"${anchor} style="height:80px">${i + 1}</div>`;
  }).join("");
  return `
  <div class="message-scroller" id="c" ${attrs} style="position:relative;height:200px">
    <div class="message-scroller-viewport" style="height:200px;overflow-y:auto;overflow-anchor:none">
      <div class="message-scroller-content" style="display:flex;flex-direction:column;gap:0px">${rows}</div>
    </div>
    <button class="message-scroller-button" id="end-button">Down</button>
    <button class="message-scroller-button message-scroller-button-start" id="start-button">Up</button>
  </div>`;
}

const scrollTop = (page: Page) =>
  page.evaluate(
    () => document.querySelector(".message-scroller-viewport")!.scrollTop,
  );

const append = (page: Page, id: string, anchor = false) =>
  page.evaluate(
    ([itemId, isAnchor]) => {
      const item = document.createElement("div");
      item.className = "message-scroller-item";
      item.id = itemId as string;
      item.style.height = "80px";
      if (isAnchor) item.setAttribute("data-sp-anchor", "");
      document
        .querySelector(".message-scroller-content")!
        .insertBefore(
          item,
          document.querySelector(".message-scroller-content [aria-hidden]"),
        );
    },
    [id, anchor] as const,
  );

test("wires viewport and content and creates the spacer", async ({ page }) => {
  await mount(page, fixture());
  const viewport = page.locator(".message-scroller-viewport");
  await expect(viewport).toHaveRole("region");
  await expect(viewport).toHaveAttribute("aria-label", "Messages");
  await expect(viewport).toHaveAttribute("tabindex", "0");
  await expect(page.locator(".message-scroller-content")).toHaveRole("log");
  await expect(
    page.locator(".message-scroller-content [aria-hidden]"),
  ).toHaveCount(1);
});

test("opens at the end by default", async ({ page }) => {
  await mount(page, fixture());
  await expect.poll(() => scrollTop(page)).toBe(200);
});

test("data-sp-position start opens at the top", async ({ page }) => {
  await mount(page, fixture({ attrs: 'data-sp-position="start"' }));
  await expect.poll(() => scrollTop(page)).toBe(0);
});

test("data-sp-scrollable reflects the reachable edges", async ({ page }) => {
  await mount(page, fixture());
  await expect(page.locator("#c")).toHaveAttribute("data-sp-scrollable", "start");
  await page.evaluate(() => {
    document.querySelector(".message-scroller-viewport")!.scrollTop = 100;
  });
  await expect(page.locator("#c")).toHaveAttribute(
    "data-sp-scrollable",
    "start end",
  );
  await mount(page, fixture({ items: 2 }));
  await expect(page.locator("#c")).not.toHaveAttribute(
    "data-sp-scrollable",
    /./,
  );
});

test("follows appended messages with data-sp-auto-scroll", async ({ page }) => {
  await mount(page, fixture({ attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await append(page, "m6");
  await expect.poll(() => scrollTop(page)).toBe(280);
});

test("a wheel up releases following and the bottom edge resumes it", async ({
  page,
}) => {
  await mount(page, fixture({ attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await page.evaluate(() => {
    const viewport = document.querySelector(".message-scroller-viewport")!;
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: -100 }));
    viewport.scrollTop = 40;
  });
  await append(page, "m6");
  await page.waitForTimeout(100);
  expect(await scrollTop(page)).toBe(40);
  await page.evaluate(() => {
    const viewport = document.querySelector(".message-scroller-viewport")!;
    viewport.scrollTop = viewport.scrollHeight;
  });
  await page.waitForTimeout(100);
  await append(page, "m7");
  await expect.poll(() => scrollTop(page)).toBe(360);
});

test("the end button activates away from the end and scrolls back", async ({
  page,
}) => {
  await mount(page, fixture());
  const button = page.locator("#end-button");
  await expect(button).not.toHaveClass(/active/);
  await page.evaluate(() => {
    document.querySelector(".message-scroller-viewport")!.scrollTop = 0;
  });
  await expect(button).toHaveClass(/active/);
  await button.click();
  await expect.poll(() => scrollTop(page)).toBe(200);
  await expect(button).not.toHaveClass(/active/);
});

test("prepending keeps the reader's position", async ({ page }) => {
  await mount(page, fixture());
  await page.evaluate(() => {
    document.querySelector(".message-scroller-viewport")!.scrollTop = 80;
  });
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const item = document.createElement("div");
    item.className = "message-scroller-item";
    item.id = "m0";
    item.style.height = "80px";
    const content = document.querySelector(".message-scroller-content")!;
    content.insertBefore(item, content.firstChild);
  });
  await expect.poll(() => scrollTop(page)).toBe(160);
});

test("an appended anchor pins to the top with the previous item peeking", async ({
  page,
}) => {
  await mount(page, fixture({ attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await append(page, "turn", true);
  await expect.poll(() => scrollTop(page)).toBe(336);
  const spacer = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>(
      ".message-scroller-content [aria-hidden]",
    )!;
    return { hidden: el.hidden, height: el.style.height };
  });
  expect(spacer).toEqual({ hidden: false, height: "56px" });
});

test("scrollToMessage jumps to the item", async ({ page }) => {
  await mount(page, fixture());
  await page.evaluate(() =>
    window.sp.messageScroller(document.querySelector("#c")!)?.scrollToMessage("m3"),
  );
  await expect.poll(() => scrollTop(page)).toBe(160);
});

test("a navigation key releases following", async ({ page }) => {
  await mount(page, fixture({ attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>(
      ".message-scroller-viewport",
    )!;
    viewport.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    viewport.scrollTop = 40;
  });
  await append(page, "m6");
  await page.waitForTimeout(100);
  expect(await scrollTop(page)).toBe(40);
});

test("data-sp-preserve-prepend=false leaves prepends uncompensated", async ({
  page,
}) => {
  await mount(page, fixture({ attrs: 'data-sp-preserve-prepend="false"' }));
  await page.evaluate(() => {
    document.querySelector(".message-scroller-viewport")!.scrollTop = 80;
  });
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const item = document.createElement("div");
    item.className = "message-scroller-item";
    item.id = "m0";
    item.style.height = "80px";
    const content = document.querySelector(".message-scroller-content")!;
    content.insertBefore(item, content.firstChild);
  });
  await page.waitForTimeout(100);
  expect(await scrollTop(page)).toBe(80);
});

test("the start button activates away from the top and scrolls back", async ({
  page,
}) => {
  await mount(page, fixture());
  const button = page.locator("#start-button");
  await expect.poll(() => scrollTop(page)).toBe(200);
  await expect(button).toHaveClass(/active/);
  await button.click();
  await expect.poll(() => scrollTop(page)).toBe(0);
  await expect(button).not.toHaveClass(/active/);
});

test("data-sp-position last-anchor opens pinned at the last anchor", async ({
  page,
}) => {
  await mount(
    page,
    fixture({ items: 10, anchors: [5], attrs: 'data-sp-position="last-anchor"' }),
  );
  await expect.poll(() => scrollTop(page)).toBe(336);
});

test("last-anchor falls back to the end when the tail fits", async ({
  page,
}) => {
  await mount(
    page,
    fixture({ items: 4, anchors: [3], attrs: 'data-sp-position="last-anchor"' }),
  );
  await expect.poll(() => scrollTop(page)).toBe(120);
});

test("scrollToMessage queues until content arrives", async ({ page }) => {
  await mount(page, fixture({ items: 0 }));
  const queued = await page.evaluate(() =>
    window.sp.messageScroller(document.querySelector("#c")!)?.scrollToMessage("m3"),
  );
  expect(queued).toBe(true);
  await page.evaluate(() => {
    const content = document.querySelector(".message-scroller-content")!;
    for (let i = 1; i <= 5; i += 1) {
      const item = document.createElement("div");
      item.className = "message-scroller-item";
      item.id = `m${i}`;
      item.style.height = "80px";
      content.insertBefore(item, content.querySelector("[aria-hidden]"));
    }
  });
  await expect.poll(() => scrollTop(page)).toBe(160);
});

test("a viewport resize keeps following pinned to the end", async ({
  page,
}) => {
  await mount(page, fixture({ attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("#c")!.style.height = "150px";
    document.querySelector<HTMLElement>(
      ".message-scroller-viewport",
    )!.style.height = "150px";
  });
  await expect.poll(() => scrollTop(page)).toBe(250);
});

test("existing anchors do not re-pin on unrelated changes", async ({
  page,
}) => {
  await mount(page, fixture({ anchors: [1], attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await page.evaluate(() => {
    const content = document.querySelector(".message-scroller-content")!;
    content.querySelector("#m5")!.remove();
    const item = document.createElement("div");
    item.className = "message-scroller-item";
    item.id = "m6";
    item.style.height = "80px";
    content.insertBefore(item, content.querySelector("[aria-hidden]"));
  });
  await page.waitForTimeout(100);
  await expect.poll(() => scrollTop(page)).toBe(200);
});

test("a replaced item with an anchor still pins", async ({ page }) => {
  await mount(page, fixture({ attrs: "data-sp-auto-scroll" }));
  await expect.poll(() => scrollTop(page)).toBe(200);
  await page.evaluate(() => {
    const content = document.querySelector(".message-scroller-content")!;
    content.querySelector("#m5")!.remove();
    const item = document.createElement("div");
    item.className = "message-scroller-item";
    item.id = "m6";
    item.style.height = "80px";
    item.setAttribute("data-sp-anchor", "");
    content.insertBefore(item, content.querySelector("[aria-hidden]"));
  });
  await expect.poll(() => scrollTop(page)).toBe(256);
});

test("sp-change reports the scrollable edges", async ({ page }) => {
  await mount(page, fixture());
  await page.evaluate(() => {
    (window as never as { _changes: unknown[] })._changes = [];
    document.querySelector("#c")?.addEventListener("sp-change", (e) => {
      (window as never as { _changes: unknown[] })._changes.push(
        (e as CustomEvent).detail.scrollable,
      );
    });
    document.querySelector(".message-scroller-viewport")!.scrollTop = 100;
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as never as { _changes: unknown[] })._changes.at(-1),
      ),
    )
    .toEqual({ start: true, end: true });
});
