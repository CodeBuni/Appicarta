## Quick context

This is a small single-page React app bootstrapped with Create React App (CRA). It uses React 19, React Router, TailwindCSS for styling, and a small set of UI/animation libs (Framer Motion, react-icons, Headless UI). Many UI strings and comments use Portuguese — keep that in mind when editing copy.

## How to run (developer workflows)
- Start dev server: `npm start` (uses `react-scripts start`) — opens at http://localhost:3000
- Run tests: `npm test` (CRA interactive runner)
- Build for production: `npm run build` → output placed in `build/`

Files with commands: see `package.json` (scripts: start, test, build, eject).

## High-level architecture (what to know quickly)
- Entry: `src/index.js` — mounts `BrowserRouter` and `ThemeProvider` around `App`.
- Routing: `src/App.js` — defines top-level routes that map to files in `src/pages/` (e.g. `/` → `src/pages/home.js`).
- Theming: `src/ThemeContext.js` — manages dark mode by toggling the `dark` class on `document.documentElement`; components read `useTheme()`.
- Components: `src/components/` contains reusable UI pieces (mix of `.js` and `.jsx`). Pages compose these components.
- Assets: images and static assets live in `src/assets/` and are imported directly into components (e.g. `src/components/loadingoverlay.jsx`).

## Project-specific patterns and conventions
- Tailwind-first styling: components rely almost exclusively on Tailwind utility classes. Favor adding utility classes or small wrapper components rather than adding global CSS.
- Dark mode: controlled via `ThemeProvider` by adding/removing the `dark` class on the root element — follow `ThemeContext.js` when changing behavior.
- Routing: App uses React Router v7 patterns (`Routes` + `Route` with `element` props). Add routes in `src/App.js` and corresponding files in `src/pages/`.
- Scroll & navigation: `react-scroll` is used for one-page anchor scrolling (see `navbar.jsx`). Use `ScrollLink` for in-page links.
- Animations: use `framer-motion` for animated elements; examples in `loadingoverlay.jsx` and other components.
- Naming: components use lowercase filenames (e.g. `hero.jsx`, `navbar.jsx`) and default-exported functions — when adding files, follow the existing lowercase style and default exports.

## Integration points & external dependencies to watch
- react-router-dom — top-level and programmatic navigation (`useNavigate`) in components like `navbar.jsx`.
- Tailwind/PostCSS — CSS pipeline configured; avoid adding heavyweight CSS frameworks.
- Framer Motion — animations should use `motion` components and `transition` patterns already used in the repo.

## Examples to reference
- Theme toggle: `src/components/navbar.jsx` + `src/ThemeContext.js` show how theme state is read/toggled and how classes change.
- Routing: `src/App.js` shows the mapping of routes to `src/pages/*` files.
- Loading overlay animation: `src/components/loadingoverlay.jsx` shows how assets are imported, how `framer-motion` is used, and how the component short-circuits when `show` is false.

## Practical rules for edits (do this, not that)
- Do: Keep changes localized to `src/components` or `src/pages` for UI work; add new pages paired with a route in `src/App.js`.
- Do: Follow Tailwind utility pattern; prefer small JSX changes over global CSS edits.
- Don't: Eject CRA (`npm run eject`) unless explicitly requested — it changes the project shape drastically.
- Don't: Change the method of dark-mode toggling without updating `ThemeProvider` and checking every component that assumes `dark` classes.

## Debugging hints
- Dev server logs and React warnings appear in the browser console and the terminal where `npm start` runs.
- If styles look wrong, verify `index.css` / Tailwind config and that `dark` class is present on `<html>`.

## PR / code review hints for AI agents
- Keep changes small and focused. When adding UI, include screenshots or a short description in PR text (copy in Portuguese is fine).
- When touching routes, run `npm start` locally and test navigation and dark-mode toggling.

If anything here is incorrect or you want the tone/level adjusted (more examples, stricter rules), tell me which parts to expand or clarify.
