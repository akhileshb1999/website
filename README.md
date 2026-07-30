# Portfolio Website

A Next.js portfolio site for a research analyst. See `plan.md` for the
full design plan.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating content

All content lives under `src/content/` — no code changes needed for
routine updates:

- `profile.json` — name, title, tagline, email, and links (LinkedIn,
  Twitter/X, Substack). Set `links.substack` to your Substack URL to
  pull recent posts onto the home page.
- `about.md` — long-form bio, rendered on the About Me page.
- `coverage/<sector>/<company>.md` — one file per company, filed under
  `consumer/`, `logistics/`, or `capital-markets/`. Frontmatter holds
  ticker, view, conviction, catalysts, and a `history` changelog; the
  markdown body is the full thesis write-up. Add a new sector by adding
  a new folder under `coverage/` and updating `SECTORS` in
  `src/lib/content.ts`.
- `reading.json` — list of what you're currently reading.
- `whats-new.json` — list of non-work interests/updates.

## Build

```bash
npm run build
```

## Deployment (GitHub Pages)

The site is a static export (`output: "export"` in `next.config.ts`)
and deploys automatically to GitHub Pages via
`.github/workflows/deploy.yml` on every push to `main`.

One-time setup (reuses your existing GitHub login, no new account
needed):

1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or re-run the workflow from the **Actions** tab) —
   the site will publish to `https://<owner>.github.io/website/`.

The build sets `GITHUB_PAGES=true`, which makes `next.config.ts` apply
the `/website` base path required for GitHub Pages project sites.
