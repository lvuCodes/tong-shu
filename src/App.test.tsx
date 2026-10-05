// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { defaultSettings, saveSettings } from "./settings";
import {
  BACK_LINK_DEFAULT_HREF,
  BACK_LINK_DEFAULT_LABEL,
  DEFAULT_THEME,
  THEMES,
} from "@lvucodes/ui";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const LICENSE_HREF = "https://github.com/lvuCodes/tong-shu/blob/main/LICENSE";

// RTL's automatic cleanup only runs under vitest `globals: true`; unmount
// explicitly so renders don't stack across tests.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// A two-month range keeps the jsdom render fast.
beforeEach(() => {
  history.replaceState(null, "", "/");
  saveSettings({ ...defaultSettings(null), start: "2027-05", end: "2027-06" });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
});

describe("App", () => {
  it("renders the back link with the package's default href and label", () => {
    render(<App />);
    const back = screen.getByRole("link", { name: BACK_LINK_DEFAULT_LABEL });
    expect(back.getAttribute("href")).toBe(BACK_LINK_DEFAULT_HREF);
  });

  it("defaults this page to the Basic theme", () => {
    localStorage.removeItem("tong-shu:theme");
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe("basic");
  });

  it("applies the theme picked from the switcher to the document element", async () => {
    render(<App />);
    const picked = THEMES.find((t) => t.id !== DEFAULT_THEME)!;
    await userEvent.click(screen.getByRole("button", { name: picked.label }));
    expect(document.documentElement.dataset.theme).toBe(picked.id);
  });

  it("defaults to synthetic people and computes the tier tables", async () => {
    render(<App />);
    expect((await screen.findAllByRole("button", { name: DATE })).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("Partner A")).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Great \d+$/ })).toBeTruthy();
  });

  it("opens a date from a table in the calendar ledger", async () => {
    render(<App />);
    const [link] = await screen.findAllByRole("button", { name: DATE });
    const date = link.textContent!;
    await userEvent.click(link);
    expect(screen.getByRole("article", { name: `Almanac for ${date}` })).toBeTruthy();
    expect(within(screen.getByRole("article")).getByRole("table", { name: "Hours" })).toBeTruthy();
    const article = within(screen.getByRole("article"));
    expect(
      article.getAllByText(/^(Our almanac|CCO|BaiBai|CFC|Regent|TST|YCA)$/).length,
    ).toBeGreaterThan(0);
  });

  it("narrows the shown dates with the range pickers and swaps a reversed range", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    fireEvent.change(screen.getByLabelText("Start month"), { target: { value: "07" } });
    expect((screen.getByLabelText("Start month") as HTMLSelectElement).value).toBe("06");
    expect((screen.getByLabelText("End month") as HTMLSelectElement).value).toBe("07");
  });

  it("extends the range from the end year dropdown", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    fireEvent.change(screen.getByLabelText("End year"), { target: { value: "2028" } });
    expect((screen.getByLabelText("End year") as HTMLSelectElement).value).toBe("2028");
    expect(screen.getByRole("button", { name: "2028" })).toBeTruthy();
  });

  it("keeps the Date column fixed and restores hidden columns with Show all", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    const picker = screen.getByRole("group", { name: "Columns" });
    expect(within(picker).queryByRole("button", { name: "Date" })).toBeNull();
    const notes = within(picker).getByRole("button", { name: "Sources and notes" });
    expect(notes.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(within(picker).getByRole("button", { name: "Show all" }));
    expect(notes.getAttribute("aria-pressed")).toBe("true");
    expect(
      (within(picker).getByRole("button", { name: "Show all" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("describes every tier-table column in its header tooltip", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    const heads = screen
      .getAllByRole("columnheader")
      .filter((th) => th.closest("table[aria-label]"));
    expect(heads.length).toBeGreaterThan(0);
    for (const th of heads) expect(th.getAttribute("data-tip")?.length).toBeGreaterThan(0);
    expect(screen.queryByText("Column guide")).toBeNull();
  });

  it("sorts a monthly counts table by a column", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    const table = within(screen.getByRole("region", { name: "Monthly counts 2027" })).getByRole(
      "table",
    );
    const counts = () =>
      within(table)
        .getAllByRole("row")
        .slice(1)
        .map((r) => Number(r.querySelectorAll("td")[1].textContent));
    const sorter = within(table).getByRole("button", { name: "Count" });
    await userEvent.click(sorter);
    expect(counts()).toEqual([...counts()].sort((a, b) => a - b));
    await userEvent.click(sorter);
    expect(counts()).toEqual([...counts()].sort((a, b) => b - a));
    expect(within(table).getAllByRole("columnheader")[1].getAttribute("aria-sort")).toBe(
      "descending",
    );
  });

  it("returns to the previous tab and day with the browser back button", async () => {
    render(<App />);
    const [link] = await screen.findAllByRole("button", { name: DATE });
    const date = link.textContent!;
    await userEvent.click(link);
    expect(location.hash).toBe(`#calendar/${date.slice(0, 7)}/${date}`);
    await userEvent.click(screen.getByRole("tab", { name: "About" }));
    expect(location.hash).toBe("#about");
    history.back();
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Calendar View" }).getAttribute("aria-selected")).toBe(
        "true",
      ),
    );
    expect(screen.getByRole("article", { name: `Almanac for ${date}` })).toBeTruthy();
    history.back();
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Date View" }).getAttribute("aria-selected")).toBe(
        "true",
      ),
    );
  });

  it("links the Open-Meteo place search and shows source coverage on About", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "About" }));
    const href = "https://open-meteo.com/en/docs/geocoding-api";
    expect(screen.getByRole("link", { name: "Open-Meteo place search" }).getAttribute("href")).toBe(
      href,
    );
    expect(screen.getByRole("link", { name: "Open-Meteo" }).getAttribute("href")).toBe(href);
    expect(
      (await screen.findAllByText("Saved lists are unavailable right now.")).length,
    ).toBeGreaterThan(0);
  });

  it("clears entered data after confirmation", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    const [label] = screen.getAllByLabelText("Label");
    fireEvent.change(label, { target: { value: "Private" } });
    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await userEvent.click(screen.getByRole("button", { name: "Clear all data" }));
    expect(screen.getByDisplayValue("Private")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Clear all data" }));
    expect(screen.queryByDisplayValue("Private")).toBeNull();
    expect(screen.getByDisplayValue("Partner A")).toBeTruthy();
  });

  it("recommends staying within three calendar years", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.change(screen.getByLabelText("End year"), { target: { value: "2030" } });
    expect(screen.getByRole("status").textContent).toMatch(/spans 4 calendar years/);
  });

  it("warns when the start month is in the past", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    fireEvent.change(screen.getByLabelText("Start year"), { target: { value: "2020" } });
    expect(screen.getByText(/May 2020 is in the past/)).toBeTruthy();
  });

  it("lists tier sections in filter order and narrows them to weekends", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    const order = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(order.filter((t) => ["Great", "Good", "Caution", "Poor"].includes(t!))).toEqual([
      "Great",
      "Good",
      "Caution",
      "Poor",
    ]);
    expect(screen.getByRole("heading", { name: "Great" }).closest("details")?.open).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Weekends only" }));
    const dates = screen.getAllByRole("button", { name: DATE }).map((b) => b.textContent!);
    expect(dates.length).toBeGreaterThan(0);
    for (const d of dates) expect([0, 6]).toContain(new Date(`${d}T12:00:00`).getDay());
  });

  it("explains the almanac on the About tab", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "About" }));
    expect(screen.getByRole("region", { name: "About" })).toBeTruthy();
    expect(screen.getByText("通书", { selector: "dt" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tōng Shū" }).getAttribute("href")).toBe(
      "https://en.wikipedia.org/wiki/Tung_Shing",
    );
  });

  it("offers Date View, Calendar View and About tabs only", () => {
    render(<App />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Date View",
      "Calendar View",
      "About",
    ]);
  });

  it("hides a tier list when its filter pill is switched off", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    const pill = screen.getByRole("button", { name: /^Caution \d+$/ });
    expect(screen.getByRole("heading", { name: "Caution" })).toBeTruthy();
    await userEvent.click(pill);
    expect(pill.getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByRole("heading", { name: "Caution" })).toBeNull();
  });

  it("shows each person's Four Pillars and sets the spouse-star basis from gender", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    expect(screen.getByText("八字 Four Pillars")).toBeTruthy();
    const [gender] = screen.getAllByLabelText("Gender") as HTMLSelectElement[];
    expect(gender.value).toBe("officer");
    fireEvent.change(gender, { target: { value: "wealth" } });
    expect((screen.getAllByLabelText("Gender")[0] as HTMLSelectElement).value).toBe("wealth");
  });

  it("links each cross-check source on the About tab", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "About" }));
    const link = screen.getByRole("link", { name: "baibai.app" });
    expect(link.getAttribute("href")).toBe("https://baibai.app/auspicious-dates/wedding/");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("links this repo's own licence from the footer", () => {
    const { container } = render(<App />);
    const footer = container.querySelector("footer.credits")!;
    const hrefs = [...footer.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(LICENSE_HREF);
  });
});
