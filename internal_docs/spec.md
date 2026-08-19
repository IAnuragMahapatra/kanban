# Amygdylla Kanban Board — spec.md

## 1. Product Overview

Real-time Kanban board for Amygdylla Solutions LLP's 3 members (Anurag, Srinibas, Ayush). Priorities: zero-friction task creation, instant sync across devices, low ceremony. Not a general-purpose PM tool — built for exactly 3 people, no client-facing surface.

## 2. Tech Stack & Architecture

- **Frontend:** React + Vite
- **Styling:** TailwindCSS
- **Database / Realtime:** Supabase (Postgres + Realtime WebSocket subscriptions + Realtime Presence for online status)
- **Hosting:** Vercel
- **Access control:** Vercel Edge Middleware, single shared password (env var, not per-user). No Supabase Auth — see §3.

## 3. Auth Model (explicit trade-off)

Single site-wide password gates the whole app. On first load, user picks their name from a fixed dropdown of 3 (Anurag / Srinibas / Ayush) — this selection is stored in `localStorage` and used as the client's identity for `author`/`assignee` fields going forward.

**This is self-attested identity, not verified auth.** Anyone with the password can pick any name. Acceptable here because all 3 users are trusted co-founders and the password itself is the real access boundary. Do not extend this pattern if the board ever gets a 4th user or external access — switch to Supabase Auth magic links at that point.

## 4. Core Layout

- **Top bar:** Amygdylla geometric "A" mark (24px) + "Amygdylla Kanban" in Canela, total open task count, search (filters by title/assignee), "+" quick-add button, 3 presence dots showing online status (via Supabase Presence channel — see §7).
- **Board:** horizontal columns with drag-and-drop via `dnd-kit` on desktop; single-column tab view on mobile (see §10).

### Columns (left to right)

| # | Column | Initial default | Notes |
| --- | -------- | --------------------- | ------- |
| 1 | TRIAGE | Expanded | Default landing column for quick-add |
| 2 | TODO | Expanded | |
| 3 | SCHEDULED | Collapsed | Has a deadline set |
| 4 | READY | Collapsed | Unblocked, about to start |
| 5 | RUNNING | Expanded | In active progress |
| 6 | BLOCKED | Collapsed | Requires `blockerReason` — see §5 |
| 7 | DONE | Collapsed | |
| 8 | ARCHIVED | Collapsed | Manual move only, no auto-archive job (see §8) |

"Initial default" only applies the very first time a user sees the board (no saved state yet). After that, each column remembers its last expand/collapse state — see below.

REVIEW is cut — folds into RUNNING → DONE directly, no separate review gate.

**Collapsed column behavior:** collapsed columns render as a fixed-width (~48px) vertical strip showing column name (rotated 90°) and task count badge. Click to expand inline (push adjacent columns, don't overlay) — not hover, since hover-expand on a kanban board causes mis-clicks during drag operations.

**Expand/collapse state persistence:** per-user, stored in `localStorage`, keyed by column name. On load, restore whatever state the user last had. If no saved state exists (first visit), apply the "Initial default" from the table above. State is NOT synced across devices — each browser remembers independently.

### Task Grouping (anti-dump)

The core UX problem with the Hermes-style reference board: expanding a column with 20+ tasks dumps everything on you at once — overwhelming and unusable. Fix this with automatic sub-grouping inside expanded columns:

| Group | Rule | Visual |
| --- | --- | --- |
| **Overdue** | `deadline` in the past, status ≠ DONE/ARCHIVED | Red accent, shown first |
| **This week** | `deadline` within the current calendar week, or `createdAt` within the last 7 days (if no deadline) | Normal rendering |
| **Older / Later** | Everything else | Muted/dimmed, collapsed by default |

- Groups render as lightweight divider labels inside the column (not nested columns).
- The "Older / Later" group is **collapsed by default** — shows only a count chip (e.g. "12 older tasks") and expands on click. This is how you avoid the 90-task wall.
- If a column has ≤ 10 tasks total, skip grouping entirely — just show them flat.
- Grouping logic is client-side only, no server-side concept of groups.

## 5. Task Schema

```
Task {
  id: uuid
  title: string (required)
  description: string (markdown)
  status: enum [TRIAGE, TODO, SCHEDULED, READY, RUNNING, BLOCKED, DONE, ARCHIVED]
  author: string (one of the 3 names, set at creation, immutable)
  assignee: string | null (one of the 3 names)
  blockerReason: string | null (required when status = BLOCKED, cleared on exit)
  createdAt: timestamp
  deadline: timestamp | null
  updatedAt: timestamp
}
```

`blockerReason` is enforced client-side (can't drag into BLOCKED without filling a small inline prompt) and should also have a DB-level check constraint (`status != 'BLOCKED' OR blocker_reason IS NOT NULL`) so a bad client can't skip it.

## 6. Core Interactions

- **Quick-add:** press `C` anywhere → inline prompt, title only, `Enter` creates in TRIAGE. `Esc` cancels.
- **Claim:** unassigned tasks show a "Claim" button that sets `assignee` to the current user in one click.
- **Inline edit:** click title to edit in place; click description to open markdown editor.
- **Drag-and-drop:** `dnd-kit`, optimistic UI update on drop, then Supabase write. On write failure, revert to last known server state and toast an error.
- **Move to BLOCKED:** triggers a small inline text prompt for `blockerReason` before the move commits. Cancel = task stays in original column.

## 7. Realtime Sync

- Subscribe to Postgres changes on the `tasks` table via Supabase Realtime; apply incoming changes directly to local state.
- **Conflict handling:** last-write-wins by `updatedAt`. No merge logic, no locking — acceptable at 3 concurrent users. If two people drag the same card simultaneously, whichever write lands last in Postgres wins; the loser's client gets corrected by the next realtime event.
- **Presence:** separate Supabase Realtime Presence channel, one entry per connected client keyed by chosen name, drives the online-avatar indicator in the top bar.

## 8. Explicitly Out of Scope (v1)

- Auto-archiving DONE → ARCHIVED after N days (no pg_cron / scheduled job in this version — archiving is a manual drag action only). Revisit if manual archiving becomes annoying.
- Per-user real authentication (see §3).
- REVIEW column / approval step.
- Notifications (email, push, Telegram) on task changes — could later hook into existing Hermes/Telegram integration if wanted, but not in v1.

## 9. Brand Kit & Design System

### 9.1 Brand Palette

All colors are specified in OKLCH. Hex fallbacks in parentheses for reference only — use OKLCH in code.

| Token | Name | OKLCH | Hex | Usage |
| --- | --- | --- | --- | --- |
| `--color-carbon` | Carbon | `oklch(20.5% 0 0)` | `#171717` | Primary background, text on light surfaces |
| `--color-bone` | Bone | `oklch(95.9% 0.01 82)` | `#F5F1EA` | Light accents, text on dark surfaces, subtle borders |
| `--color-olive` | Deep Olive | `oklch(39.6% 0.019 136)` | `#42493F` | Card surfaces, secondary backgrounds, muted UI |
| `--color-bronze` | Antique Bronze | `oklch(57.5% 0.06 79)` | `#8C7550` | Accent color — active states, highlights, column headers, CTAs |

**Dark theme derivations** (not in the brand kit, derived for the Kanban context):

| Token | OKLCH | Hex | Usage |
| --- | --- | --- | --- |
| `--bg-app` | `oklch(17.8% 0 0)` | `#111111` | App-level background (near-Carbon, slightly warmer) |
| `--bg-column` | `oklch(21.8% 0 0)` | `#1A1A1A` | Column background |
| `--bg-card` | `oklch(25.9% 0.007 107)` | `#242420` | Card surface — olive-tinted dark, elevated feel |
| `--bg-card-hover` | `oklch(29.9% 0.011 107)` | `#2E2E28` | Card hover state |
| `--border-subtle` | `oklch(28.4% 0.007 107)` | `#2A2A26` | Card/column borders, dividers |
| `--text-primary` | `oklch(95.9% 0.01 82)` | `#F5F1EA` | Bone — titles, primary content |
| `--text-muted` | `oklch(61.9% 0.021 83)` | `#8C8578` | Metadata, timestamps, secondary info |
| `--text-dimmed` | `oklch(45.2% 0.014 80)` | `#5A554D` | Disabled / collapsed group counts |

**Status accent colors** (for card top borders and status indicators):

| Status | Color | OKLCH | Hex |
| --- | --- | --- | --- |
| TRIAGE / TODO / SCHEDULED | Muted Bone | `oklch(61.9% 0.021 83)` | `#8C8578` |
| READY / RUNNING | Antique Bronze | `oklch(57.5% 0.06 79)` | `#8C7550` |
| BLOCKED | Warm Red | `oklch(54.3% 0.174 30)` | `#C0392B` |
| DONE / ARCHIVED | Deep Olive | `oklch(39.6% 0.019 136)` | `#42493F` |

### 9.2 Typography

- **Display / Headings:** Canela — used for the app title ("Amygdylla Kanban") and column headers. Serif, elegant. Loaded via font-face from self-hosted files (do not use Google Fonts CDN for Canela — it's a commercial font; bundle the woff2 files in `public/fonts/`).
- **Body / UI:** Neue Haas Grotesk (or fallback to `Inter` if licensing is a problem) — all card text, metadata, inputs, buttons. Clean sans-serif.
- **Font weights:** 400 regular, 500 medium (card titles), 700 bold (column headers, counts). No weight below 400.
- **High contrast:** titles in `--text-primary` (Bone), metadata in `--text-muted`.

### 9.3 Logo

The Amygdylla geometric "A" mark is used as:
- **Favicon:** 32×32 and 16×16 versions of the mark in Carbon on transparent background.
- **PWA icon:** 192×192 and 512×512 versions (see §11).
- **Top bar:** small inline mark (24px) next to the "Amygdylla Kanban" title text. No full wordmark in the top bar — just the geometric mark + text.

### 9.4 Cards

Minimal elevated sticky notes. No avatars, no icons — text only. Each card shows:
- **Title** — primary visual weight, Neue Haas Grotesk 500, `--text-primary`.
- **Description snippet** — first 2 lines of the markdown description, truncated with ellipsis. Useful at a glance, not just a title.
- **Assignee name** — plain text, `--text-muted`. No avatar circles.
- **Time info** — relative age ("3d ago") and deadline if set. `--text-muted`, small.
- **Blocker reason** — shown inline on BLOCKED cards, warm red tinted text.

**Top border:** 3px solid, color-coded by status accent (see table above).
**Overdue tasks** (`deadline` in the past, status not DONE/ARCHIVED): `oklch(54.3% 0.174 30)` glow/border on the card.
**No decorative icons anywhere on cards.** Every pixel on a card must be useful information.

### 9.5 Motion

- All transitions ≤ 300ms. Column expand/collapse should feel snappy.
- Drag-and-drop via `dnd-kit` with minimal visual chrome during drag (subtle elevation shift, no heavy shadows or scale transforms).
- Card hover: background shifts to `--bg-card-hover`, 150ms ease.

## 10. Responsive & Mobile Layout

The board must be fully usable on phones (360px+). This is a daily-driver tool — people will check tasks from bed, from commute, from anywhere.

### Breakpoints

| Breakpoint | Name | Layout |
| --- | --- | --- |
| ≥ 1024px | Desktop | Horizontal columns side-by-side, collapsed strips, full board view |
| 768–1023px | Tablet | Horizontal columns, narrower cards, collapse more columns by default |
| < 768px | Mobile | **Single-column stack** — see below |

### Mobile layout (< 768px)

- **No horizontal scrolling.** The 8-column strip layout doesn't work on a phone. Instead:
  - Top bar stays fixed with title, search, and `+` button.
  - Below the top bar: a **horizontal scrollable tab strip** showing all 8 column names as pills/tabs with task counts. Active tab is highlighted with `--color-bronze`.
  - Below the tabs: the **active column's tasks** rendered as a vertical scrollable list, full-width cards.
  - Tapping a different tab switches the column view. Swipe left/right between adjacent columns.
- **Drag-and-drop on mobile:** disable `dnd-kit` drag on touch screens. Instead, each card gets a "Move to…" action (long-press or swipe-to-reveal) that shows a column picker. Touch drag on kanban boards is unreliable and conflicts with scroll.
- **Quick-add on mobile:** the `+` button in the top bar (always visible). No keyboard shortcut `C` on mobile (no physical keyboard).
- **Task grouping** (§4.1) still applies — "Older / Later" collapsed by default is even more important on mobile where screen real estate is tiny.

### Touch targets

- Minimum 44×44px for all interactive elements (tabs, buttons, card actions).
- Card tap opens the detail/edit view (not inline edit — too small on mobile). Inline editing is desktop-only.

## 11. PWA & Installability

Ship the app as a Progressive Web App so it can be installed to home screen on mobile and desktop.

### Manifest (`public/manifest.json`)

```json
{
  "name": "Amygdylla Kanban",
  "short_name": "Kanban",
  "description": "Real-time task board for Amygdylla Solutions",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111111",
  "theme_color": "#8C7550",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service Worker

- Use `vite-plugin-pwa` (Workbox-based) for automatic SW generation.
- **Caching strategy:** network-first for API/Supabase calls (realtime data must be fresh), cache-first for static assets (fonts, icons, CSS/JS bundles).
- **Offline behavior:** show a branded "You're offline — tasks will sync when reconnected" banner. Do NOT allow offline edits in v1 — too complex with Supabase realtime. Just show the last-cached board state as read-only.

### HTML head

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#8C7550" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

