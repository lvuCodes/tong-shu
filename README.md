# site-template

GitHub template repository for lvucodes.github.io sites. It is a Vite + React 19 + TypeScript starter that consumes the shared component library **[@lvucodes/ui](https://www.npmjs.com/package/@lvucodes/ui)** from npm, so every new site inherits the theme system, the theme switcher, the back link, the footer credits, and the shared lint configuration without copying any of it. The demo shell in [src/App.tsx](src/App.tsx) renders the switcher over a small panel of live token swatches; replace it with the real site while keeping the wiring intact.

## Usage

Create a repository from this template on GitHub ("Use this template"), clone it, then install and run it locally.

- `npm install` — install dependencies and wire the pre-push hook (`prepare` sets `core.hooksPath`).
- `npm run dev` — start the Vite dev server and open the site.

Rename the project after cloning: update the `name` field in [package.json](package.json), the `<title>` in [index.html](index.html), and this [README.md](README.md). Point the `licenseHref` prop on `FooterCredits` in [src/App.tsx](src/App.tsx) at the new repository's `LICENSE`, and update the matching URL in [src/App.test.tsx](src/App.test.tsx).

## Included Tooling

| Item             | Definition                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify` | The full local gate set: `lint` (ESLint + stylelint), `format:check` (Prettier), `test` (Vitest), and `build`.                                                                                           |
| Pre-push hook    | [.githooks/pre-push](.githooks/pre-push) runs `npm run verify` before every push; installed by the `prepare` script.                                                                                     |
| Reusable CI      | [.github/workflows/ci.yml](.github/workflows/ci.yml) calls `lvuCodes/terminal-themes/.github/workflows/site-ci.yml@main`, which runs `verify` and the iPhone SE Playwright smoke gate (`npm run smoke`). |
| Deploy workflow  | [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) builds and publishes to GitHub Pages, scoped to the `main` branch.                                                              |

## Branch Flow

`dev` is the default working branch; CI runs there on every push and pull request. `main` is deploy-only: a linear fast-forward from `dev` — gated on `verify` and the SE smoke suite being green — that triggers the Pages deploy.

## License

GNU General Public License v3.0 or later — see [LICENSE](LICENSE). Copyright © 2026 lvuCodes. `@lvucodes/ui` is published under GPL-3.0-or-later, so a site built from this template must also be licensed GPL-3.0-or-later and make its source available.
