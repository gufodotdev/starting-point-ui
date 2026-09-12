import { test, expect, type Page } from "@playwright/test";

// The date picker binds a calendar to native <input type="date"> elements, so
// a form submits plain YYYY-MM-DD values with or without JavaScript. The mode
// follows the inputs: one input is a single date, two are a range, one with
// `multiple` collects several dates as same-name inputs.

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

async function mount(page: Page, html: string) {
  await page.evaluate(async (markup) => {
    document.body.innerHTML = markup;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, html);
}

const SINGLE = `
  <form id="form">
    <div id="picker" class="date-picker" data-sp-month="2026-09">
      <input id="date" type="date" name="date" />
      <button id="trigger" type="button">
        <span class="date-picker-value" data-sp-placeholder="Pick a date"></span>
      </button>
    </div>
  </form>
  <button id="outside">Outside</button>`;

const PRESET = SINGLE.replace('name="date" />', 'name="date" value="2026-09-12" />');

const RANGE = `
  <form id="form">
    <div id="picker" class="date-picker" data-sp-month="2026-09" data-sp-months="2">
      <input id="from" type="date" name="from" />
      <input id="to" type="date" name="to" />
      <button id="trigger" type="button">
        <span class="date-picker-value" data-sp-placeholder="Pick dates"></span>
      </button>
    </div>
  </form>`;

const MULTIPLE = `
  <form id="form">
    <div id="picker" class="date-picker" data-sp-month="2026-09">
      <input id="dates" type="date" name="dates" multiple />
      <button id="trigger" type="button">
        <span class="date-picker-value" data-sp-placeholder="Pick dates"></span>
      </button>
    </div>
  </form>`;

const LIMITS = SINGLE.replace(
  'data-sp-month="2026-09"',
  'data-sp-month="2026-09" data-sp-min="2026-09-05" data-sp-max="2026-09-25" data-sp-disabled="2026-09-10..2026-09-12,2026-09-20"',
);

const INLINE = `
  <form id="form">
    <div id="cal" class="calendar" data-sp-month="2026-09">
      <input id="date" type="date" name="date" />
    </div>
  </form>`;

const day = (page: Page, iso: string) => page.locator(`.calendar-day[data-date="${iso}"]`);
const value = (page: Page) => page.locator(".date-picker-value");

async function open(page: Page) {
  await page.locator("#trigger").click();
  await expect(page.locator("#picker .calendar")).toBeVisible();
}

const formData = (page: Page, name: string) =>
  page.evaluate((n) => new FormData(document.querySelector<HTMLFormElement>("#form")!).getAll(n), name);

async function listenChange(page: Page, selector: string) {
  await page.evaluate((sel) => {
    (window as unknown as { changes: string[] }).changes = [];
    document.querySelector(sel)!.addEventListener("change", (e) => {
      (window as unknown as { changes: string[] }).changes.push((e.target as HTMLInputElement).value);
    });
  }, selector);
}
const changes = (page: Page) => page.evaluate(() => (window as unknown as { changes: string[] }).changes);

test("opens a calendar for the configured month", async ({ page }) => {
  await mount(page, SINGLE);
  await open(page);
  await expect(page.locator(".calendar-caption")).toHaveText("September 2026");
  await expect(page.locator(".calendar-weekday")).toHaveCount(7);
  await expect(day(page, "2026-09-01")).toBeVisible();
  await expect(day(page, "2026-09-30")).toBeVisible();
});

test("picking a day writes an ISO value to the native input, fires change, and closes", async ({ page }) => {
  await mount(page, SINGLE);
  await listenChange(page, "#date");
  await open(page);
  await day(page, "2026-09-12").click();
  await expect(page.locator("#date")).toHaveValue("2026-09-12");
  expect(await changes(page)).toEqual(["2026-09-12"]);
  await expect(page.locator("#picker .calendar")).toBeHidden();
  expect(await formData(page, "date")).toEqual(["2026-09-12"]);
});

test("a preset value renders selected and the trigger shows the formatted date", async ({ page }) => {
  await mount(page, PRESET);
  await expect(value(page)).toHaveText("September 12, 2026");
  await open(page);
  await expect(day(page, "2026-09-12")).toHaveAttribute("aria-selected", "true");
});

test("the trigger label updates after a pick and after the input changes by script", async ({ page }) => {
  await mount(page, SINGLE);
  await open(page);
  await day(page, "2026-09-03").click();
  await expect(value(page)).toHaveText("September 3, 2026");
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>("#date")!;
    input.value = "2026-10-15";
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(value(page)).toHaveText("October 15, 2026");
  await open(page);
  await expect(page.locator(".calendar-caption")).toHaveText("October 2026");
  await expect(day(page, "2026-10-15")).toHaveAttribute("aria-selected", "true");
});

test("emits sp-change with the selection", async ({ page }) => {
  await mount(page, SINGLE);
  await page.evaluate(() => {
    document.querySelector("#picker")!.addEventListener("sp-change", (e) => {
      (window as unknown as { detail: unknown }).detail = (e as CustomEvent).detail;
    });
  });
  await open(page);
  await day(page, "2026-09-12").click();
  expect(await page.evaluate(() => (window as unknown as { detail: unknown }).detail)).toEqual({ value: "2026-09-12" });
});

test.describe("range", () => {
  test("two picks fill from and to in date order, whichever is clicked first", async ({ page }) => {
    await mount(page, RANGE);
    await open(page);
    await expect(page.locator(".calendar-month")).toHaveCount(2);
    await day(page, "2026-09-20").click();
    await expect(page.locator("#from")).toHaveValue("2026-09-20");
    await expect(page.locator("#to")).toHaveValue("");
    await expect(page.locator("#picker .calendar")).toBeVisible();
    await day(page, "2026-09-09").click();
    await expect(page.locator("#from")).toHaveValue("2026-09-09");
    await expect(page.locator("#to")).toHaveValue("2026-09-20");
    await expect(day(page, "2026-09-09")).toHaveClass(/range-start/);
    await expect(day(page, "2026-09-15")).toHaveClass(/range-middle/);
    await expect(day(page, "2026-09-20")).toHaveClass(/range-end/);
    await expect(value(page)).toHaveText("Sep 9, 2026 - Sep 20, 2026");
    expect(await formData(page, "from")).toEqual(["2026-09-09"]);
    expect(await formData(page, "to")).toEqual(["2026-09-20"]);
  });

  test("a pick on a complete range starts a new range at that day", async ({ page }) => {
    await mount(page, RANGE);
    await open(page);
    await day(page, "2026-09-01").click();
    await day(page, "2026-09-15").click();
    await day(page, "2026-09-13").click();
    await expect(page.locator("#from")).toHaveValue("2026-09-13");
    await expect(page.locator("#to")).toHaveValue("");
    await day(page, "2026-09-15").click();
    await expect(page.locator("#from")).toHaveValue("2026-09-13");
    await expect(page.locator("#to")).toHaveValue("2026-09-15");
  });

  test("picking the same day twice makes a one-day range", async ({ page }) => {
    await mount(page, RANGE);
    await open(page);
    await day(page, "2026-09-09").click();
    await day(page, "2026-09-09").click();
    await expect(page.locator("#from")).toHaveValue("2026-09-09");
    await expect(page.locator("#to")).toHaveValue("2026-09-09");
  });
});

test.describe("multiple", () => {
  test("each picked day becomes its own same-name input, and picking again removes it", async ({ page }) => {
    await mount(page, MULTIPLE);
    await open(page);
    await day(page, "2026-09-01").click();
    await day(page, "2026-09-05").click();
    await day(page, "2026-09-09").click();
    expect(await formData(page, "dates")).toEqual(["2026-09-01", "2026-09-05", "2026-09-09"]);
    await expect(page.locator("#picker .calendar")).toBeVisible();
    await day(page, "2026-09-05").click();
    expect(await formData(page, "dates")).toEqual(["2026-09-01", "2026-09-09"]);
    await expect(value(page)).toHaveText("2 dates");
  });

  test("with nothing picked the form sends no value for the name", async ({ page }) => {
    await mount(page, MULTIPLE);
    expect(await formData(page, "dates")).toEqual([]);
  });
});

test.describe("limits", () => {
  test("days outside min and max, and disabled dates, cannot be picked", async ({ page }) => {
    await mount(page, LIMITS);
    await open(page);
    for (const iso of ["2026-09-04", "2026-09-26", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-20"]) {
      await expect(day(page, iso)).toBeDisabled();
    }
    await expect(day(page, "2026-09-05")).toBeEnabled();
    await day(page, "2026-09-04").click({ force: true });
    await expect(page.locator("#date")).toHaveValue("");
  });
});

test.describe("keyboard", () => {
  test("arrow keys move between days, Enter picks, Escape closes", async ({ page }) => {
    await mount(page, PRESET);
    await open(page);
    await expect(day(page, "2026-09-12")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(day(page, "2026-09-13")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(day(page, "2026-09-20")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(day(page, "2026-09-19")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#date")).toHaveValue("2026-09-19");
    await open(page);
    await page.keyboard.press("Escape");
    await expect(page.locator("#picker .calendar")).toBeHidden();
    await expect(page.locator("#trigger")).toBeFocused();
  });

  test("PageUp and PageDown move a month, keeping the day", async ({ page }) => {
    await mount(page, PRESET);
    await open(page);
    await page.keyboard.press("PageDown");
    await expect(page.locator(".calendar-caption")).toHaveText("October 2026");
    await expect(day(page, "2026-10-12")).toBeFocused();
    await page.keyboard.press("PageUp");
    await expect(day(page, "2026-09-12")).toBeFocused();
  });
});

test.describe("navigation", () => {
  test("next and previous buttons move a month", async ({ page }) => {
    await mount(page, SINGLE);
    await open(page);
    await page.locator(".calendar-next").click();
    await expect(page.locator(".calendar-caption")).toHaveText("October 2026");
    await page.locator(".calendar-previous").click();
    await page.locator(".calendar-previous").click();
    await expect(page.locator(".calendar-caption")).toHaveText("August 2026");
  });

  test("a dropdown caption renders month and year selects that navigate", async ({ page }) => {
    await mount(page, SINGLE.replace('data-sp-month="2026-09"', 'data-sp-month="2026-09" data-sp-caption="dropdown"'));
    await open(page);
    await expect(page.locator(".calendar-month-select")).toHaveValue("8");
    await page.locator(".calendar-year-select").selectOption("2024");
    await expect(day(page, "2024-09-12")).toBeVisible();
  });
});

test.describe("display options", () => {
  test("week numbers are ISO weeks and the week can start on Monday", async ({ page }) => {
    await mount(page, SINGLE.replace('data-sp-month="2026-09"', 'data-sp-month="2026-09" data-sp-week-numbers data-sp-week-start="1"'));
    await open(page);
    await expect(page.locator(".calendar-weekday").first()).toHaveText("Mo");
    await expect(page.locator(".calendar-weekday").last()).toHaveText("Su");
    await expect(page.locator(".calendar-week-number")).toHaveText(["36", "37", "38", "39", "40"]);
    await expect(page.locator(".calendar-week").first().locator(".calendar-day").first()).toHaveAttribute("data-date", "2026-08-31");
  });

  test("a locale formats the caption, weekdays, and trigger label", async ({ page }) => {
    await mount(page, PRESET.replace('data-sp-month="2026-09"', 'data-sp-month="2026-09" data-sp-locale="sv-SE" data-sp-week-start="1"'));
    await expect(value(page)).toHaveText("12 september 2026");
    await open(page);
    await expect(page.locator(".calendar-caption")).toHaveText("september 2026");
    await expect(page.locator(".calendar-weekday").first()).toHaveText("må");
  });

  test("two months render side by side and navigate together", async ({ page }) => {
    await mount(page, RANGE);
    await open(page);
    await expect(page.locator(".calendar-caption")).toHaveText(["September 2026", "October 2026"]);
    await page.locator(".calendar-next").click();
    await expect(page.locator(".calendar-caption")).toHaveText(["October 2026", "November 2026"]);
  });

  test("hovering while a range is open previews it", async ({ page }) => {
    await mount(page, RANGE);
    await open(page);
    await day(page, "2026-09-09").click();
    await day(page, "2026-09-14").hover();
    await expect(day(page, "2026-09-11")).toHaveClass(/range-middle/);
    await expect(page.locator("#to")).toHaveValue("");
  });
});

test.describe("limits, continued", () => {
  test("weekday names disable those days, and today works as a bound", async ({ page }) => {
    await mount(page, SINGLE.replace('data-sp-month="2026-09"', 'data-sp-month="2026-09" data-sp-disabled="sat,sun" data-sp-max="today"'));
    await open(page);
    await expect(day(page, "2026-09-05")).toBeDisabled();
    await expect(day(page, "2026-09-06")).toBeDisabled();
    await expect(day(page, "2026-09-07")).toBeEnabled();
    const tomorrow = await page.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
    await page.evaluate((iso) => window.sp.calendar(document.querySelector<HTMLElement>("#picker .calendar")!)!.goTo(iso), tomorrow);
    await expect(day(page, tomorrow)).toBeDisabled();
  });

  test("min and max are mirrored onto the native input for browser validation", async ({ page }) => {
    await mount(page, LIMITS);
    await expect(page.locator("#date")).toHaveAttribute("min", "2026-09-05");
    await expect(page.locator("#date")).toHaveAttribute("max", "2026-09-25");
  });
});

test("arrow keys follow the reading direction in RTL", async ({ page }) => {
  await mount(page, `<div dir="rtl">${PRESET}</div>`);
  await open(page);
  await expect(day(page, "2026-09-12")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(day(page, "2026-09-13")).toBeFocused();
});

test.describe("review fixes", () => {
  test("weekday headers stay distinct in locales whose short names share a prefix", async ({ page }) => {
    await mount(page, SINGLE.replace('data-sp-month="2026-09"', 'data-sp-month="2026-09" data-sp-locale="he-IL"'));
    await open(page);
    const names = await page.locator(".calendar-weekday").allTextContents();
    expect(new Set(names).size).toBe(7);
    await mount(page, SINGLE);
    await open(page);
    await expect(page.locator(".calendar-weekday").first()).toHaveText("Su");
  });

  test("select() keeps a range in date order whichever way it is given", async ({ page }) => {
    await mount(page, RANGE);
    await page.evaluate(() => window.sp.datePicker(document.querySelector<HTMLElement>("#picker")!)!.select({ from: "2026-09-20", to: "2026-09-05" }));
    await expect(page.locator("#from")).toHaveValue("2026-09-05");
    await expect(page.locator("#to")).toHaveValue("2026-09-20");
  });

  test("a calendar without inputs is view only", async ({ page }) => {
    await mount(page, `<div id="cal" class="calendar" data-sp-month="2026-09"></div>`);
    await expect(page.locator(".calendar-caption")).toHaveText("September 2026");
    await day(page, "2026-09-10").click();
    await expect(day(page, "2026-09-10")).toHaveAttribute("aria-selected", "false");
  });

  test("a picker that leaves the DOM and comes back keeps working, multiple included", async ({ page }) => {
    await mount(page, MULTIPLE);
    await open(page);
    await day(page, "2026-09-04").click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#picker .calendar")).toBeHidden();
    await page.evaluate(async () => {
      const picker = document.querySelector<HTMLElement>("#picker")!;
      const form = picker.parentElement!;
      picker.remove();
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      form.appendChild(picker);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    await page.locator("#trigger").click();
    await expect(page.locator("#picker .calendar")).toBeVisible();
    await day(page, "2026-09-08").click();
    expect(await formData(page, "dates")).toEqual(["2026-09-04", "2026-09-08"]);
    await expect(value(page)).toHaveText("2 dates");
  });
});

test("applies grid semantics", async ({ page }) => {
  await mount(page, PRESET);
  await open(page);
  await expect(page.locator(".calendar-grid")).toHaveAttribute("role", "grid");
  await expect(day(page, "2026-09-12")).toHaveAttribute("aria-selected", "true");
  await expect(day(page, "2026-09-11")).toHaveAttribute("aria-selected", "false");
  await expect(page.locator("#trigger")).toHaveAttribute("aria-haspopup", "dialog");
});

test("an inline calendar bound to an input works without a picker", async ({ page }) => {
  await mount(page, INLINE);
  await expect(page.locator("#cal .calendar-grid")).toBeVisible();
  await day(page, "2026-09-12").click();
  await expect(page.locator("#date")).toHaveValue("2026-09-12");
  expect(await formData(page, "date")).toEqual(["2026-09-12"]);
});

test("sp.datePicker(el) exposes select, clear, and the current value", async ({ page }) => {
  await mount(page, SINGLE);
  await page.evaluate(() => window.sp.datePicker(document.querySelector<HTMLElement>("#picker")!)!.select("2026-09-01"));
  await expect(page.locator("#date")).toHaveValue("2026-09-01");
  await expect(value(page)).toHaveText("September 1, 2026");
  expect(await page.evaluate(() => window.sp.datePicker(document.querySelector<HTMLElement>("#picker")!)!.value())).toBe("2026-09-01");
  await page.evaluate(() => window.sp.datePicker(document.querySelector<HTMLElement>("#picker")!)!.clear());
  await expect(page.locator("#date")).toHaveValue("");
  await expect(value(page)).toBeEmpty();
});

test.describe("server rendering", () => {
  test("a label rendered on the server is kept as is until the selection changes", async ({ page }) => {
    await mount(page, PRESET.replace('data-sp-placeholder="Pick a date"></span>', 'data-sp-placeholder="Pick a date">12 Sep 2026</span>'));
    await expect(value(page)).toHaveText("12 Sep 2026");
    await open(page);
    await day(page, "2026-09-03").click();
    await expect(value(page)).toHaveText("September 3, 2026");
  });

  test("a blank label is filled from a preset value, and clearing empties it for the CSS placeholder", async ({ page }) => {
    await mount(page, PRESET);
    await expect(value(page)).toHaveText("September 12, 2026");
    await page.evaluate(() => window.sp.datePicker(document.querySelector<HTMLElement>("#picker")!)!.clear());
    await expect(value(page)).toBeEmpty();
    await expect(value(page)).toHaveAttribute("data-sp-placeholder", "Pick a date");
  });

  test("hidden inputs with the template's name are adopted as picked dates, and a reset restores them", async ({ page }) => {
    await mount(page, MULTIPLE.replace('multiple />', 'multiple />\n      <input type="hidden" name="dates" value="2026-09-04" />\n      <input type="hidden" name="dates" value="2026-09-08" />'));
    expect(await formData(page, "dates")).toEqual(["2026-09-04", "2026-09-08"]);
    await expect(value(page)).toHaveText("2 dates");
    await open(page);
    await expect(day(page, "2026-09-04")).toHaveAttribute("aria-selected", "true");
    await day(page, "2026-09-04").click();
    await day(page, "2026-09-20").click();
    expect(await formData(page, "dates")).toEqual(["2026-09-08", "2026-09-20"]);
    await page.evaluate(() => document.querySelector<HTMLFormElement>("#form")!.reset());
    await expect.poll(() => formData(page, "dates")).toEqual(["2026-09-04", "2026-09-08"]);
    await expect(day(page, "2026-09-04")).toHaveAttribute("aria-selected", "true");
    await expect(day(page, "2026-09-20")).toHaveAttribute("aria-selected", "false");
  });
});

test.describe("form contract", () => {
  test("a required multiple input blocks an empty submit and passes once a date is picked", async ({ page }) => {
    await mount(page, MULTIPLE.replace("multiple />", "multiple required />"));
    const submits = () => page.evaluate(() => {
      const form = document.querySelector<HTMLFormElement>("#form")!;
      let submitted = false;
      form.addEventListener("submit", (e) => { e.preventDefault(); submitted = true; }, { once: true });
      form.requestSubmit();
      return submitted;
    });
    expect(await submits()).toBe(false);
    await expect(page.locator(".date-picker-popover")).toHaveClass(/show/);
    await day(page, "2026-09-05").click();
    expect(await submits()).toBe(true);
    expect(await formData(page, "dates")).toEqual(["2026-09-05"]);
  });

  test("clicking the picked day again clears an optional single date, but not a required one", async ({ page }) => {
    await mount(page, PRESET);
    await open(page);
    await day(page, "2026-09-12").click();
    await expect(page.locator("#date")).toHaveValue("");
    await expect(value(page)).toBeEmpty();
    await mount(page, PRESET.replace('name="date"', 'name="date" required'));
    await open(page);
    await day(page, "2026-09-12").click();
    await expect(page.locator("#date")).toHaveValue("2026-09-12");
  });
});

test("submitting with a required empty date opens the popover so the browser can report it", async ({ page }) => {
  await mount(page, SINGLE.replace('name="date" />', 'name="date" required />'));
  await page.evaluate(() => {
    const form = document.querySelector("form")!;
    form.addEventListener("submit", (e) => e.preventDefault());
    form.requestSubmit();
  });
  await expect(page.locator(".date-picker-popover")).toHaveClass(/show/);
  await expect(page.locator("#date")).toBeFocused();
  await expect(page.locator("#trigger")).toHaveAttribute("aria-invalid", "true");
  await day(page, "2026-09-03").click();
  await expect(page.locator("#trigger")).not.toHaveAttribute("aria-invalid");
});

test("a form reset returns the picker to its authored state", async ({ page }) => {
  await mount(page, PRESET);
  await open(page);
  await day(page, "2026-09-03").click();
  await expect(value(page)).toHaveText("September 3, 2026");
  await page.evaluate(() => document.querySelector<HTMLFormElement>("#form")!.reset());
  await expect(page.locator("#date")).toHaveValue("2026-09-12");
  await expect(value(page)).toHaveText("September 12, 2026");
});
