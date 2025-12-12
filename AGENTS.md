# Repository Guidelines

## Project Structure & Module Organization
- App entry is `src/main.jsx`, with the root component in `src/App.jsx`.
- Shared UI and logic live under `src/components` and `src/libs` (e.g., cookies, config).
- Global styles are in `src/App.css` and `src/index.css`; assets live in `src/assets` and `public`.
- Tests sit in `tests/` and target the public API of modules in `src/`.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server with hot reload.
- `npm run build` — create a production build.
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint across the repo.
- `npm run test` — run unit tests via Vitest (jsdom environment).

## Coding Style & Naming Conventions
- JavaScript/JSX with ES modules; prefer functional React components and hooks.
- Use 2-space indentation, single quotes in code, and trailing commas in multiline literals.
- Keep component files PascalCased (e.g., `Loading.jsx`), modules snake/kebab only when matching directories.
- Import shared helpers from `src/libs/*`; avoid duplicating utilities.
- Keep styles scoped to components when possible; reuse existing class names before adding new ones, and prefer a dedicated CSS file per component over inline styles.

## Testing Guidelines
- Framework: Vitest with jsdom; tests live in `tests/` and mirror source filenames (e.g., `cookies.test.js` for `src/libs/cookies.js`).
- Use clear, behavior-focused test names (`it('marks intro as seen when skipping')`).
- Reset global state (cookies, timers, DOM) between tests.
- Always add or update tests alongside new features or bug fixes, and run `npm run test` locally before sending changes; add coverage for new helpers or branches.
- Run `npm run lint` on each feature to keep style and imports consistent.

## Commit & Pull Request Guidelines
- Write concise commits in the imperative mood (`Add cookie helpers`, `Fix loading fade timing`).
- Each PR should describe scope, risks, and how to verify (commands run, screenshots if UI changes).
- Link related issues or tickets when applicable; note any configuration or ENV variables that changed.

## Security & Configuration Tips
- Cookie usage can be disabled via `src/libs/config.js` (`DISABLE_COOKIES`); ensure behavior is tested in both modes.
- Avoid hardcoding secrets or tokens; keep environment-specific values in `.env` (not checked in).
