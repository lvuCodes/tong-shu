// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
    expect(screen.getByRole("button", { name: /^Recommended \d+$/ })).toBeTruthy();
  });

  it("opens a date from a table in the calendar ledger", async () => {
    render(<App />);
    const [link] = await screen.findAllByRole("button", { name: DATE });
    const date = link.textContent!;
    await userEvent.click(link);
    expect(screen.getByRole("article", { name: `Almanac for ${date}` })).toBeTruthy();
    expect(within(screen.getByRole("article")).getByRole("table", { name: "Hours" })).toBeTruthy();
  });

  it("narrows the shown dates with the range pickers and swaps a reversed range", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    fireEvent.change(screen.getByLabelText("From month"), { target: { value: "07" } });
    expect((screen.getByLabelText("From month") as HTMLSelectElement).value).toBe("06");
    expect((screen.getByLabelText("To month") as HTMLSelectElement).value).toBe("07");
    expect(screen.getByText(/June 2027 to July 2027/)).toBeTruthy();
  });

  it("sets a whole year from the year dropdowns and presets", async () => {
    render(<App />);
    await screen.findAllByRole("button", { name: DATE });
    fireEvent.change(screen.getByLabelText("To year"), { target: { value: "2028" } });
    expect(screen.getByText(/May 2027 to June 2028/)).toBeTruthy();
    const thisYear = new Date().getFullYear();
    fireEvent.click(screen.getByRole("button", { name: `Show all of ${thisYear + 2}` }));
    expect(
      screen.getByText(new RegExp(`January ${thisYear + 2} to December ${thisYear + 2}`)),
    ).toBeTruthy();
  });

  it("links each cross-check source on the Sources tab", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Sources" }));
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
