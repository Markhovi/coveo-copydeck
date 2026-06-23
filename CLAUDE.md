# CLAUDE.md — context & handoff notes

This file gives an AI assistant (or a new contributor) the context to continue work.

## What this project is

Coveo Event Copydeck — a Vue 3 + Vite + Pinia web app. A guided 3-step form
(Remplir → Révision → Export CSV) that describes a Coveo event, previews the rendered
event page, and exports a **Sitecore Item Import CSV**. Everything is driven by one schema
(`src/schema/index.js`), the single source of truth that feeds the form, the live preview,
and the CSV/docx builders.

See `README.md` for the user-facing description and file layout.

## Tech & commands

- Vue 3 (`<script setup>`), Vite, Pinia.
- `npm install` → `npm run dev` (http://localhost:5173) → `npm run build` → `npm run preview`.

## Key implementation notes

- **Schema-driven**: add/change a field in `src/schema/index.js` and it propagates to the
  form (`src/components/form/*`), preview (`src/components/ui/EventPreview.vue`), and the
  builders (`src/builders/csv-builder.js`, `docx-builder.js`).
- **State** lives in `src/stores/event.js` (Pinia): form data, current/prev step, csvContent,
  driveUrl, syncStatus, theme.
- **Themes**: default "Coveo" + hidden "Samurai (Mugen)". The theme switcher is hidden by
  default — typing `mugen` anywhere on the page reveals it
  (`src/components/layout/ThemeToggle.vue`).
- **Vite base** is set to `'./'` (relative) in `vite.config.js` so the build works under any
  GitHub Pages sub-path regardless of repo name. Do NOT change it back to an absolute
  `/repo-name/` path unless you have a specific reason.

## Deployment (GitHub Pages) — current focus

- Repo name: `coveo-copydeck`. Pages URL: `https://<user>.github.io/coveo-copydeck/`.
- Deploy is via GitHub Actions: `.github/workflows/deploy.yml` builds and publishes `dist/`.
- In the repo: **Settings → Pages → Source must be "GitHub Actions"** (not "Deploy from a
  branch"). Deploying from a branch serves the raw dev `index.html` (which points at
  `/src/main.js`) and produces a BLANK page.

### Known gotcha that caused a blank page
- The `.github` folder is hidden and was missed during a web upload, so the workflow never
  ran. If the **Actions** tab has no "Deploy to GitHub Pages" workflow, the file is missing —
  re-add `.github/workflows/deploy.yml` (use github.dev via the `.` shortcut to avoid the web
  editor's YAML auto-indent corruption).
- `npm ci` requires `package-lock.json` to be committed — make sure it's in the repo.

## Immediate next step

1. Ensure `.github/workflows/deploy.yml` and `package-lock.json` are committed to `main`.
2. Settings → Pages → Source = GitHub Actions.
3. Push to `main` (or run the workflow manually) → wait for green in the Actions tab.
4. Hard-refresh the Pages URL (Ctrl+Shift+R).

## Later / planned work

- Google Drive integration (`src/composables/useGoogleDrive.js` is stubbed):
  real `createDoc()` via Drive + Docs API, drop the copydeck in the right folder, feed the
  real URL into `store.driveUrl` (already wired to the Page-2 `GoogleDocBar`).
- Two-way sync via Drive Push Notifications webhook → backend → `store.syncStatus`.
- Page 2 visual polish: make the separation between the top "information" zone (Google Doc
  bar/actions) and the "preview" zone clearer (labeled sections / stronger divider).
