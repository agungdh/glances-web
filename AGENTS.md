# Glances Web — Agent Guide

## Project Overview

Real-time multi-host Glances monitoring dashboard. SvelteKit **SPA** (`ssr = false`) served by the
**node adapter** via Bun. A single shared server-side poller fetches each Glances host's `/api/4/all`
payload and pushes updates to browsers over **SSE** (`/api/stream`).

## Commands

| Command          | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `bun install`    | Install dependencies                     |
| `bun run dev`    | Start Vite dev server                    |
| `bun run build`  | Build into `build/` (node adapter)       |
| `bun start`      | Serve `build/index.js` (reads PORT/HOST) |
| `bun run check`  | Type-check via `svelte-check`            |
| `bun run lint`   | `prettier --check`                       |
| `bun run format` | `prettier --write`                       |
| `bun test`       | Run unit tests (`bun test`)              |

Always run `bun run check` and `bun run lint` after making changes.

## Project Structure

- `src/lib/api.ts` — Glances `/all` payload types + `mapAllResponse` (defaults missing fields)
- `src/lib/env.ts` — host URL parsing from `PUBLIC_GLANCES_URLS` / `PUBLIC_GLANCES_URL`
- `src/lib/format.ts`, `src/lib/temp.ts` — pure formatting/temp-threshold helpers (unit-tested)
- `src/lib/server/` — server-only code:
  - `glances-cache.ts` — shared poller: per-host schedules, exponential backoff (60s cap, 5s fetch
    timeout), auto start/stop based on subscriber count
  - `poll-log.ts` — ring buffer of poll events (100k entries, 24h TTL) served by `/api/poll-log`
  - `glances-auth.ts` — parses `GLANCES_CREDENTIALS` (`url|user|pass`) for per-host auth
  - `basic-auth.ts` — timing-safe HTTP Basic auth helpers for the dashboard gate
- `src/lib/components/` — dashboard cards (Cpu, Gpu, Mem, Storage, Network, DiskIo, Processes,
  Containers, Sensors, Alerts, Ports, Amps, plus `Bar`/`Gauge`/`StatCard`/`TempBadge` primitives)
- `src/routes/+page.svelte` — SPA dashboard: host switcher tabs, SSE client, status indicator
- `src/routes/+layout.ts` — `ssr = false`, `prerender = false`
- `src/hooks.server.ts` — HTTP Basic auth gate for the whole app
- `src/routes/api/stream/+server.ts` — SSE endpoint (retry: 5000, ping: 15s)
- `src/routes/api/poll-log/+server.ts` — poll log JSON (`?limit=`, max 1000)

## Conventions

- **Svelte 5 runes mode is forced** by `vite.config.ts` — use `$state`, `$derived`, `$effect`, `$props`.
- Svelte/TS code goes through the Svelte MCP server (`list-sections` → `get-documentation` →
  `svelte-autofixer`) — use it when writing or editing `.svelte` files.
- Import shared code via the `$lib` alias; `$env/static/public` for public vars,
  `$env/dynamic/private` for secrets.
- Secrets must stay server-side: `PUBLIC_*` vars are exposed to the browser, everything else is not.
- Tests are co-located `*.test.ts` next to the code they cover; run with `bun test`.
- Config lives in `vite.config.ts` (adapter + Tailwind + runes); there is no `svelte.config.js`.
- Never edit `build/`, `.svelte-kit/`, or `.output/` — generated output.
