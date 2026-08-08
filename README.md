# Glances Web

Real-time system monitoring dashboard for [Glances](https://nicolargo.github.io/glances/), built with
SvelteKit (SPA), Tailwind CSS, and Server-Sent Events.

## Features

- Live CPU (per-thread, load, temp), GPU, RAM/swap, and storage usage
- Sensor temperature badges with warning/critical thresholds
- Multi-host support with a host switcher
- Server-side polling shared across all connected clients via SSE
- Exponential backoff when a host is unreachable; poller idles when no clients are connected

## Prerequisites

A running Glances REST API server on each host you want to monitor:

```sh
glances -w
```

The API must be reachable at `http://<host>:61208/api/4`.

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable              | Description                                                               | Default                        |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| `PUBLIC_GLANCES_URLS` | Comma-separated base URLs (each ending in `/api/4`) for the host switcher | `http://localhost:61208/api/4` |
| `PUBLIC_GLANCES_URL`  | Single-host fallback used when `PUBLIC_GLANCES_URLS` is empty             | `http://localhost:61208/api/4` |
| `PORT` / `HOST`       | Server listen address (read by the node adapter on `bun start`)           | `3000` / `127.0.0.1`           |
| `GLANCES_POLL_MS`     | Server-side poll interval in ms (min 500)                                 | `2000`                         |

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
                                          │ SSE (text/event-stream, retry: 5000)
                                    +---►  /api/stream  ──►  dashboard (EventSource, multi-host tabs)
```

All hosts are polled by a single shared in-memory cache on the server; each browser client
subscribes to one SSE stream instead of hammering Glances directly.
