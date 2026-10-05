// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Day } from "../engine/almanac";
import { NotePills, SourceList } from "./pills";

afterEach(cleanup);

const day = (date: string, weekday: string, holiday: string | null = null) =>
  ({
    date,
    weekday,
    holiday,
    group: { hourSensitive: false },
    sources: { lunar_python: true },
  }) as unknown as Day;

describe("NotePills", () => {
  it("marks Friday the 13th and holidays as Western notes", () => {
    render(<NotePills day={day("2027-08-13", "Fri", "Labor Day")} place="Houston" />);
    expect(screen.getByText("Friday the 13th").className).toContain("t-western");
    expect(screen.getByText("Labor Day").className).toContain("t-western");
  });

  it("leaves other Fridays and the 13th on other weekdays alone", () => {
    const { container } = render(<NotePills day={day("2027-08-20", "Fri")} place="Houston" />);
    expect(container.textContent).toBe("");
    render(<NotePills day={day("2027-09-13", "Mon")} place="Houston" />);
    expect(screen.queryByText("Friday the 13th")).toBeNull();
  });
});

describe("our almanac", () => {
  it("leaves our own almanac out of the source pills", () => {
    const d = { listed: ["lunar_python", "baibai"] } as unknown as Day;
    render(<SourceList day={d} />);
    expect(screen.getByText("BaiBai")).toBeTruthy();
    expect(screen.queryByText("Our almanac")).toBeNull();
  });

  it("flags days our almanac does not list in amber", () => {
    const d = {
      date: "2027-08-20",
      weekday: "Fri",
      holiday: null,
      group: { hourSensitive: false },
      sources: { lunar_python: false },
    } as unknown as Day;
    render(<NotePills day={d} place="Houston" />);
    expect(screen.getByText("Not in our almanac").className).toContain("t-caution");
  });
});
