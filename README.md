# Glances Web

Real-time system monitoring dashboard for [Glances](https://nicolargo.github.io/glances/), built with
SvelteKit (SPA, Svelte 5 runes), Tailwind CSS 4, and Server-Sent Events.

## Features

- Live CPU (per-thread bars, load, frequency, temp), GPU, RAM/swap, and storage usage
- Network and disk I/O throughput, process list, Docker container stats
- Sensor temperature badges with warning/critical thresholds
- Alert feed, port status checks, and AMP (alert manager plugin) metrics
- Multi-host support with a host switcher
- Server-side polling shared across all connected clients via SSE (`/api/stream`)
- Per-host basic-auth credentials for protected Glances servers (server-side only)
- Optional HTTP Basic auth for the dashboard itself
- Poll activity log (`/api/poll-log`) for debugging backoff/reconnect behaviour
- Exponential backoff when a host is unreachable; poller idles when no clients are connected

## Prerequisites

A running Glances REST API server on each host you want to monitor:

```sh
glances -w
```

The API must be reachable at `http://<host>:61208/api/4`, and the dashboard reads the aggregate
`/api/4/all` endpoint for every metric it displays.

If a Glances server is started with basic auth (`glances -w -u <user> -p <pass>`), configure its
credentials via `GLANCES_CREDENTIALS` (server-side only — the password is never sent to the browser).

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable              | Description                                                                  | Default                        |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| `PUBLIC_GLANCES_URLS` | Comma-separated base URLs (each ending in `/api/4`) for the host switcher    | `http://localhost:61208/api/4` |
| `PUBLIC_GLANCES_URL`  | Single-host fallback used when `PUBLIC_GLANCES_URLS` is empty                | `http://localhost:61208/api/4` |
| `PORT` / `HOST`       | Server listen address (read by the node adapter on `bun start`)              | `3000` / `127.0.0.1`           |
| `GLANCES_POLL_MS`     | Server-side poll interval in ms (min 500, clamped)                           | `2000`                         |
| `GLANCES_CREDENTIALS` | Per-host basic auth, `url\|username\|password` comma-separated (server-only) | none                           |
| `BASIC_AUTH_USERNAME` | HTTP Basic username protecting the dashboard + API (server-only)             | none (auth disabled)           |
| `BASIC_AUTH_PASSWORD` | HTTP Basic password protecting the dashboard + API (server-only)             | none (auth disabled)           |

## Development

```sh
bun install
bun run dev
```

## Building & running

```sh
bun run build   # build client + node server into build/
bun start       # serve via the adapter-node server (PORT/HOST from env)
```

## Quality

```sh
bun run check   # svelte-check (types)
bun run lint    # prettier --check
bun test        # unit tests for lib utilities
```

## Architecture

```
Glances REST (/api/4/all)  ──poll──►  server cache (per-host, backoff, shared)
                                          │ SSE (text/event-stream, retry: 5000, ping: 15s)
                                    +---►  /api/stream  ──►  dashboard (EventSource, multi-host tabs)
                                    └──►  /api/poll-log ──►  poll activity (JSON, ?limit=)
```

All hosts are polled by a single shared in-memory cache on the server (`src/lib/server/glances-cache.ts`);
each browser client subscribes to one SSE stream instead of hammering Glances directly. Each host is
polled on its own schedule — exponential backoff on failures (capped at 60s, fetch timeout 5s) doesn't
slow down healthy hosts, and the poller shuts down when the last client disconnects.

- `src/lib/api.ts` — TypeScript types for the Glances `/all` payload and the `mapAllResponse` mapper
- `src/lib/server/` — poller cache, poll log ring buffer, Glances + dashboard basic-auth helpers
- `src/routes/+page.svelte` — SPA dashboard consuming the SSE stream
