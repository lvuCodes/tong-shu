// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import {
  BACK_LINK_DEFAULT_HREF,
  BACK_LINK_DEFAULT_LABEL,
  DEFAULT_THEME,
  THEMES,
} from "@lvucodes/ui";

const LICENSE_HREF = "https://github.com/lvuCodes/site-template/blob/main/LICENSE";

// RTL's automatic cleanup only runs under vitest `globals: true`; unmount
// explicitly so renders don't stack across tests.
afterEach(cleanup);

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

  it("links this repo's own licence from the footer", () => {
    const { container } = render(<App />);
    const footer = container.querySelector("footer.credits")!;
    const hrefs = [...footer.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(LICENSE_HREF);
  });
});
