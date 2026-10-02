// Site Template. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import "./App.css";
import { BackLink, FooterCredits, ThemeSwitcher, useTheme } from "@lvucodes/ui";

const SWATCHES = [
  { token: "--accent", label: "Accent" },
  { token: "--panel", label: "Panel" },
  { token: "--text", label: "Text" },
  { token: "--border", label: "Border" },
];

function App() {
  const [theme, setTheme] = useTheme();

  return (
    <main className="page">
      <BackLink />

      <h1>Site Template</h1>
      <p className="tagline">
        Starter site for the lvucodes.github.io family, wired to <code>@lvucodes/ui</code> — themes,
        the switcher, back link, and footer credits out of the box.
      </p>

      <ThemeSwitcher theme={theme} onChange={setTheme} />

      <section className="panel">
        <div className="swatches">
          {SWATCHES.map((s) => (
            <div key={s.token} className="swatch">
              <div className="chip" style={{ background: `var(${s.token})` }} />
              <code>{s.token}</code>
            </div>
          ))}
        </div>
      </section>

      <FooterCredits
        licenseHref="https://github.com/lvuCodes/site-template/blob/main/LICENSE"
        year={2026}
      />
    </main>
  );
}

export default App;
