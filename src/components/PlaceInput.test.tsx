// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlaceInput } from "./PlaceInput";

const HITS = [
  {
    id: 1,
    name: "Orlando",
    admin1: "Florida",
    country: "United States",
    country_code: "US",
    latitude: 28.5,
    longitude: -81.4,
    timezone: "America/New_York",
  },
  {
    id: 2,
    name: "Orlando",
    admin1: "Oklahoma",
    country: "United States",
    country_code: "US",
    latitude: 36.1,
    longitude: -97.4,
    timezone: "America/Chicago",
  },
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function search() {
  vi.stubGlobal("fetch", () => Promise.resolve(new Response(JSON.stringify({ results: HITS }))));
  const onResolve = vi.fn();
  render(<PlaceInput label="Place" value="" tz="" onResolve={onResolve} />);
  const input = screen.getByRole("combobox", { name: "Place" });
  fireEvent.change(input, { target: { value: "orlando" } });
  await screen.findByRole("listbox", {}, { timeout: 2000 });
  return { input, onResolve };
}

describe("PlaceInput", () => {
  it("lists matches with the name in bold and the region muted", async () => {
    await search();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0].querySelector("strong")?.textContent).toBe("Orlando");
    expect(options[0].querySelector(".placeregion")?.textContent).toBe("Florida, United States");
  });

  it("moves the highlight with the arrow keys and picks with Enter", async () => {
    const { input, onResolve } = await search();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onResolve).toHaveBeenCalledWith(
      expect.objectContaining({ place: "Orlando, Oklahoma, United States", tz: "America/Chicago" }),
    );
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("picks a clicked suggestion and closes on Escape", async () => {
    const { input, onResolve } = await search();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.focus(input);
    fireEvent.click(screen.getAllByRole("option")[0]);
    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({ country: "US" }));
  });
});
