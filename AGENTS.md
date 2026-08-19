# Agent Instructions

**Goal:** Build a high-performance, real-time Kanban board for a 3-man startup.

## Key Conventions

### Specifications

Before beginning any task, read the internal documentation:

- `internal_docs/spec.md` — Core functionality, architecture, tech stack, and design rules.

### Environment

- **OS:** Windows 11.
- **Shell:** `pwsh7` (PowerShell 7). Do not assume `bash` syntax.
- **Package Manager:** Use `npm`.
- **Framework:** React + Vite. (Do not use Next.js).
- **Styling:** TailwindCSS.

### Secrets & Data

- **Credentials:** Never hardcode Supabase URLs/Keys or the Vercel edge password. Put them in `.env`.

### Workflow & Communication

- **Do not invent features.** Stick to the specifications in `spec.md`.
- **Blockers & Guidance:** If blocked, STOP. Guide the user step-by-step.
- **No Mock Code/Hacks:** Do not use mock code if a feature is meant to be functional.
- **Context:** Log decisions in `internal_docs/decisions.md` if architectural changes are made.

---

## Folder Structure

```plaintext
amygdylla_kanban/
├── internal_docs/        # Project specs and decisions
│   └── spec.md           # Core specifications and requirements
│
├── src/                  # React application code
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific logic (e.g., board, auth)
│   ├── lib/              # Utils and SDK clients (Supabase)
│   └── main.tsx          # App entry point
│
├── .agents/              # Agent customisation rules
└── AGENTS.md             # This file. Agent instructions.
```

---

## UI & Frontend Work (CRITICAL)

**Rule: Operate Mode**
The design must prioritize utility, scannability, and task completion. Adhere strictly to the `impeccable` skill guidelines for "Operate" mode.

1. **Aesthetics:** Amygdylla brand palette — Carbon (`#171717`) background, olive-tinted card surfaces (`#242420`), Bone (`#F5F1EA`) text, Antique Bronze (`#8C7550`) accents. See `spec.md` §9 for full token table.
2. **Typography:** Clean, sans-serif fonts. High contrast for titles, muted for metadata.
3. **Motion:** Maximum 300ms duration. Snappy and predictable drag-and-drop.
4. **Frictionless UI:** Support keyboard shortcuts, 1-click actions ("Claim"), and inline editing.

---

## Architecture & Code Rules

- **Frontend:** React + Vite.
- **State & Sync:** Supabase for real-time WebSockets and data persistence.
- **Security:** Vercel Edge Middleware for site-wide Basic Auth password protection.

---

## Commits & Version Control

### Author Credentials by Module

| Person | Name | Email | Owns |
| --- | --- | --- | --- |
| P1 | Anurag Mahapatra | `<anurag2005om@gmail.com>` | Infrastructure, Security, Auth |
| P2 | Srinibas Das | `<srinibasdas107@gmail.com>` | UI Components, Board Design |
| P3 | Ayush Kishan | `<ayush.kishan29@gmail.com>` | Supabase, State Management |

Use Conventional Commits.
