# Coveo — Event Copydeck

A web tool for building Coveo event pages. You fill in a single guided form describing
an event, preview the rendered event page, and export a **Sitecore Item Import CSV**
ready to be imported into the CMS.

The whole app is driven by one schema (`src/schema/index.js`) that is the single source
of truth — every field defined there automatically appears in the form, the live preview,
and the CSV export.

## Features

- **Guided 3-step flow**
  1. **Remplir** — fill in event details (identification, SEO meta, hero data, date/time,
     location, registration, and repeatable content sections).
  2. **Révision** — a live preview of the event page exactly as the data will render,
     plus a Google Doc reference bar.
  3. **Export CSV** — generates the Sitecore import CSV with a summary and one-click copy
     or download.
- **Schema-driven** — add or change a field in one place and it propagates everywhere.
- **Dynamic content sections** — add, remove, and reorder rich-text "widget" blocks
  (title + description with left/right positioning).
- **Live validation** — required fields and at least one complete content section are
  enforced before review, with inline error highlighting.
- **Two visual themes** — the default **Coveo** theme and a hidden **Samurai (Mugen)**
  theme. The theme switcher is hidden by default; type `mugen` anywhere on the page to
  reveal it.

## Tech stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/) build tooling
- [Pinia](https://pinia.vuejs.org/) for state management

## Project structure

```
src/
├── main.js                 App bootstrap (Vue + Pinia)
├── App.vue                 Root: step routing + slide transitions
├── schema/index.js         Single source of truth for all event fields
├── stores/event.js         Pinia store: form data, step nav, CSV, theme
├── builders/
│   ├── csv-builder.js      Builds the Sitecore Item Import CSV
│   └── docx-builder.js     Builds the .docx copydeck
├── composables/
│   └── useGoogleDrive.js   Google Drive / Docs integration
├── components/
│   ├── layout/             TopBar, ThemeToggle, StepPills
│   ├── form/               EventForm, FormCard, FieldRenderer, Widgets
│   ├── steps/              StepOne, StepTwo, StepThree
│   └── ui/                 GoogleDocBar, EventPreview
└── assets/                 base + theme stylesheets
```

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # production build into dist/
npm run preview # preview the production build locally
```

## Deployment (GitHub Pages)

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds
and deploys to GitHub Pages on every push to `main`.

1. Push the project to a repository named **`coveo-copydeck`**.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. The site is published at `https://<user>.github.io/coveo-copydeck/`.

> The `base` path in `vite.config.js` is set to `/coveo-copydeck/`. If you rename the
> repository, update `base` to match (`/<repo-name>/`), otherwise assets will 404.
