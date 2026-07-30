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
