# tong-shu

Tong Shu almanac and date-selection app, served at [lvucodes.github.io/tong-shu](https://lvucodes.github.io/tong-shu/). Every almanac value is computed in the browser with [lunar-javascript](https://www.npmjs.com/package/lunar-javascript), and bundled source snapshots for 2020 to 2035 provide the cross-check. Built from [site-template](https://github.com/lvuCodes/site-template) on **[@lvucodes/ui](https://www.npmjs.com/package/@lvucodes/ui)**.

## Usage

- `npm install` installs dependencies and wires the pre-push hook.
- `npm run dev` starts the Vite dev server.

## Included Tooling

| Item             | Definition                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify` | `lint` (ESLint + stylelint), `format:check` (Prettier), `test` (Vitest), and `build`                                                     |
| Pre-push hook    | [.githooks/pre-push](.githooks/pre-push) runs `npm run verify` before every push                                                         |
| Reusable CI      | [.github/workflows/ci.yml](.github/workflows/ci.yml) runs `verify`, the iPhone SE Playwright smoke gate and the AI-usage staleness check |
| Deploy workflow  | [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) publishes to GitHub Pages from `main`                           |

## Branch Flow

`dev` is the default working branch. `main` is deploy-only and is promoted from `dev` by pull request, which triggers the Pages deploy.

## AI Usage

See [AI-USAGE.md](AI-USAGE.md).

## License

GNU General Public License v3.0 or later. See [LICENSE](LICENSE). Copyright © 2026 lvuCodes.
