import { test, expect, type Page } from "@playwright/test";

// data-sp-on-<event> expressions run when the matching sp-<event> bubbles
// through the element. Real components drive the happy paths; manual
// dispatches drive the delegation edge cases.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const log = (page: Page) =>
  page.evaluate(() => (window as never as { _log?: unknown[] })._log ?? []);

const dispatch = (page: Page, selector: string, type: string) =>
  page.evaluate(
    ([sel, name]) => {
      document.querySelector(sel)?.dispatchEvent(
        new CustomEvent(name, { bubbles: true, cancelable: true, detail: { value: "x" } }),
      );
    },
    [selector, type],
  );

const DIALOG = `
  <button id="trigger" class="btn">Open</button>
  <dialog class="dialog" data-sp-toggle="#trigger"
    data-sp-on-shown="(window._log ??= []).push('shown')"
    data-sp-on-hidden="(window._log ??= []).push('hidden')">
    <h2 class="dialog-title">Title</h2>
    <button id="dismiss" data-sp-dismiss>Close</button>
  </dialog>`;

const COMMAND = `
  <div id="wrapper">
    <div class="command" id="cmd"
      data-sp-on-select="(window._log ??= []).push(event.detail.value, el.id)">
      <div class="input-group"><input class="input" /></div>
      <div class="command-list">
        <button class="command-item" id="calendar">Calendar</button>
      </div>
    </div>
  </div>`;

test("runs when a component fires the event", async ({ page }) => {
  await mount(page, DIALOG);
  await page.click("#trigger");
  await expect.poll(() => log(page)).toEqual(["shown"]);
});

test("multiple attributes on one element each fire for their event", async ({ page }) => {
  await mount(page, DIALOG);
  await page.click("#trigger");
  await expect.poll(() => log(page)).toEqual(["shown"]);
  await page.click("#dismiss");
  await expect.poll(() => log(page)).toEqual(["shown", "hidden"]);
});

test("exposes event and el to the expression", async ({ page }) => {
  await mount(page, COMMAND);
  await page.click("#calendar");
  expect(await log(page)).toEqual(["Calendar", "cmd"]);
});

test("an ancestor catches events bubbling from components inside it", async ({ page }) => {
  await mount(
    page,
    COMMAND.replace(
      '<div id="wrapper">',
      `<div id="wrapper" data-sp-on-select="(window._log ??= []).push('outer:' + event.detail.value)">`,
    ),
  );
  await page.click("#calendar");
  expect(await log(page)).toEqual(["Calendar", "cmd", "outer:Calendar"]);
});

test("preventDefault cancels a cancelable lifecycle event", async ({ page }) => {
  await mount(
    page,
    DIALOG.replace(
      'data-sp-on-shown',
      `data-sp-on-beforehide="event.preventDefault(); (window._log ??= []).push('blocked')"
       data-sp-on-shown`,
    ),
  );
  await page.click("#trigger");
  await expect.poll(() => log(page)).toEqual(["shown"]);
  await page.click("#dismiss");
  await expect.poll(() => log(page)).toEqual(["shown", "blocked"]);
  await expect(page.locator("dialog.dialog")).toHaveClass(/shown/);
});

test("stopPropagation in an inner handler stops outer handlers", async ({ page }) => {
  await mount(
    page,
    `<div id="outer" data-sp-on-select="(window._log ??= []).push('outer')">
      <div id="inner" data-sp-on-select="(window._log ??= []).push('inner'); event.stopPropagation()">
        <button id="source">Fire</button>
      </div>
    </div>`,
  );
  await dispatch(page, "#source", "sp-select");
  expect(await log(page)).toEqual(["inner"]);
});

test("a throwing handler does not stop handlers above it", async ({ page }) => {
  await mount(
    page,
    `<div id="outer" data-sp-on-select="(window._log ??= []).push('outer')">
      <div id="inner" data-sp-on-select="null.boom">
        <button id="source">Fire</button>
      </div>
    </div>`,
  );
  await dispatch(page, "#source", "sp-select");
  expect(await log(page)).toEqual(["outer"]);
});

test("an unparsable expression is inert and does not affect others", async ({ page }) => {
  await mount(
    page,
    `<div id="outer" data-sp-on-select="(window._log ??= []).push('outer')">
      <div id="inner" data-sp-on-select="this is ( not js">
        <button id="source">Fire</button>
      </div>
    </div>`,
  );
  await dispatch(page, "#source", "sp-select");
  expect(await log(page)).toEqual(["outer"]);
});

test("only the matching event runs the expression", async ({ page }) => {
  await mount(
    page,
    `<div id="el" data-sp-on-hidden="(window._log ??= []).push('nope')">
      <button id="source">Fire</button>
    </div>`,
  );
  await dispatch(page, "#source", "sp-shown");
  await dispatch(page, "#source", "sp-select");
  expect(await log(page)).toEqual([]);
});

test("multi-line statement bodies with locals and control flow work", async ({ page }) => {
  await mount(
    page,
    `<div id="el" data-sp-on-select="
        const count = (Number(el.dataset.count) || 0) + 1;
        el.dataset.count = count;
        if (count > 2) {
          (window._log ??= []).push('capped at ' + count);
          return;
        }
        (window._log ??= []).push(count);
      ">
      <button id="source">Fire</button>
    </div>`,
  );
  for (let i = 0; i < 4; i++) await dispatch(page, "#source", "sp-select");
  expect(await log(page)).toEqual([1, 2, "capped at 3", "capped at 4"]);
});

test("markup added after load works without any wiring", async ({ page }) => {
  await mount(page, `<div id="host"></div>`);
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.setAttribute("data-sp-on-select", "(window._log ??= []).push('late')");
    el.innerHTML = `<button id="source">Fire</button>`;
    document.querySelector("#host")?.append(el);
  });
  await dispatch(page, "#source", "sp-select");
  expect(await log(page)).toEqual(["late"]);
});
