# Portfolio Website — Plan

## 1. Purpose

A personal, professional portfolio site for a research analyst. It's not a
traditional "developer portfolio" — it's a working showcase of investment
thinking: what's being tracked, the views behind it, and the person behind
the research. Tone: credible, understated, sell-side/buy-side research
aesthetic rather than flashy startup-landing-page aesthetic.

## 2. Site Structure (Tabs)

A single-page app feel with tab-based navigation (no full page reloads),
plus a landing/hero view.

| Tab | Purpose | Content shape |
|---|---|---|
| **Home** | First impression — name, role, one-line pitch, current focus, links (email, LinkedIn, Twitter/X, resume) | Hero section, short intro, CTA into other tabs |
| **About** | Professional background | Bio, experience timeline, education, coverage sectors, skills/tools (e.g. Excel modeling, Bloomberg, valuation methods) |
| **Tracking** | What's currently on watch | List/grid of tickers or themes being followed, sector, why it's on the radar, last updated date |
| **Views** | Actual opinions on the above | Per-stock/theme thesis cards: view (Bullish/Bearish/Neutral/Watching), thesis summary, key catalysts/risks, conviction, date published. Could be nested under Tracking as an expandable detail rather than a fully separate tab — see Open Questions. |
| **Reading** | What's being read | Books/articles/reports list, short takeaway per item, maybe tags (macro, sector, biography, etc.) |
| **Exploring** | Interests beyond work | Short cards — hobbies, side projects, non-market curiosities. Keeps the site human, not just a research terminal. |

**Note:** "Tracking" and "Views" are closely related (a ticker being
tracked *is* the view). Recommend merging into one tab — **"Coverage"** —
where each entry is a card with: ticker/theme, sector, current view,
thesis, catalysts, conviction level, last updated. Avoids duplication
between two tabs showing overlapping data. Open to keeping them separate
if the intent is "watchlist" (broad, lower-conviction) vs "views"
(published, higher-conviction) — flagged in Open Questions below.

## 3. Design Direction

- Clean, editorial, content-first — think a hybrid of a research note and
  a modern personal site. Generous whitespace, strong typography, minimal
  chrome.
- Light and dark mode.
- Subtle finance-adjacent visual language used sparingly: monospace
  accents for tickers/numbers, small up/down indicators for views
  (bullish/bearish), no gaudy stock-chart backgrounds.
- Fully responsive: tab bar collapses to a bottom nav or hamburger on
  mobile.
- Fast, static-first — this is a content site, not an app; should load
  instantly and work with JS disabled for core content where feasible.

## 4. Tech Stack (proposed)

- **Framework:** Next.js (App Router) + TypeScript — static export or
  ISR, good SEO, easy to host free on Vercel.
- **Styling:** Tailwind CSS.
- **Content:** MDX or JSON/YAML content files per section (e.g.
  `content/coverage/*.md`, `content/reading.json`) — no database needed.
  Editing a stock view = editing a markdown file, no CMS/backend
  required. Keeps updates fast and git-tracked.
- **Deployment:** Vercel (or GitHub Pages if a fully static export is
  preferred).
- **Icons/fonts:** system font stack or a single serif/sans pairing (e.g.
  Inter + a serif for headings) to keep it feeling like a publication.

Alternative if a simpler, zero-JS-framework approach is preferred: Astro
instead of Next.js — same content-file model, ships less JS by default.
Recommendation: **Next.js** for familiarity/ecosystem unless there's a
reason to prefer Astro.

## 5. Content Data Model (draft)

```
content/
  profile.json        # name, title, bio, links, photo
  about.md            # long-form bio / experience / education
  coverage/
    TICKER1.md         # frontmatter: ticker, sector, view, conviction, catalysts, date
    TICKER2.md
  reading.json         # [{ title, author, status, takeaway, tags, date }]
  exploring.json        # [{ title, description, link?, date }]
```

Each `coverage/*.md` frontmatter example:

```yaml
ticker: TCS
sector: IT Services
view: Bullish        # Bullish | Bearish | Neutral | Watching
conviction: High      # High | Medium | Low
lastUpdated: 2026-07-20
catalysts:
  - Q1 FY27 earnings
  - Deal wins in BFSI vertical
```

## 6. Build Phases

1. **Scaffold** — Next.js + TypeScript + Tailwind, base layout, tab
   navigation, routing per tab, light/dark theme toggle.
2. **Home + About** — static content, hero section, bio.
3. **Coverage (Tracking + Views)** — data model, card/list components,
   detail view per ticker/theme.
4. **Reading + Exploring** — simpler list-based sections.
5. **Polish** — responsive QA on mobile/tablet, accessibility pass,
   meta tags/SEO, favicon, animations/transitions between tabs.
6. **Deploy** — connect to Vercel (or GH Pages), custom domain if
   available.

## 7. Open Questions

1. Keep **Coverage** as one merged tab (ticker + view together), or two
   separate tabs (broad watchlist vs. published views)?
2. Any existing brand elements — name, preferred colors, logo, headshot,
   resume PDF — to work from, or start from a neutral default palette?
3. Should stock views be public opinions (compliance-sensitive — worth a
   disclaimer footer, e.g. "not investment advice") or anonymized/
   illustrative? Recommend adding a standard disclaimer given the content.
4. Any real content ready now (bio text, current tickers, reading list),
   or should the initial build ship with placeholder content to be
   swapped in after?
5. Preferred hosting/domain — Vercel with a `vercel.app` subdomain,
   custom domain, or GitHub Pages?
