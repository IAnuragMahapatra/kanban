# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite, TailwindCSS, Supabase (Postgres + Realtime WebSocket subscriptions + Realtime Presence).
Vercel Edge Middleware for site-wide Basic Auth.
Deployed to Vercel.

## Users

3 co-founders of Amygdylla Solutions LLP (Anurag, Srinibas, Ayush). They will use this as a daily-driver tool to manage tasks, checking from desktop and mobile (bed, commute, etc.).

## Product Purpose

Real-time Kanban board for Amygdylla Solutions LLP's 3 members. Priorities: zero-friction task creation, instant sync across devices, low ceremony. Not a general-purpose PM tool — built for exactly 3 people, no client-facing surface.

## Positioning

Built for exactly 3 people, ultra-fast task creation (quick-add via 'C' shortcut), single shared password, frictionless task claiming. No heavy PM tool overhead.

## Operating Context

Daily task management, fast triage, tracking blocked and running tasks. Users check tasks from bed, commute, and desktop. High reliance on mobile phone usability.

## Capabilities and Constraints

- **Capabilities**: Drag-and-drop task management, real-time sync via Supabase, presence indicators, task grouping (Overdue, This week, Older). Quick-add keyboard shortcuts.
- **Constraints**: Single site-wide password (no individual user auth), self-attested identity stored in localStorage. Maximum 3 users. No auto-archiving.
- **Terminology**: Columns (TRIAGE, TODO, SCHEDULED, READY, RUNNING, BLOCKED, DONE, ARCHIVED).

## Brand Commitments

Amygdylla geometric "A" mark. Clean, scannable UI focusing on utility and zero friction.

## Evidence on Hand

`spec.md` with explicit column definitions, layout rules, task schemas, and mobile responsive guidelines. No decorative icons, minimalistic elevated sticky notes.

## Product Principles

1. **Zero-friction**: Keyboard shortcuts, 1-click actions, and snappy motion (<300ms).
2. **Scannability**: Clear visual hierarchy, high contrast for titles, no decorative clutter.
3. **Anti-dump**: Automatic sub-grouping to prevent overwhelming column views.
4. **Mobile-first utility**: Fully usable on phones as a daily driver without horizontal scrolling.
