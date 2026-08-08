import { env } from '$env/dynamic/private';
import { GLANCES_HOSTS } from '$lib/env';
import type { AllResponse } from '$lib/api';
import type { RequestHandler } from './$types';

const DEFAULT_POLL_MS = 2000;
const FETCH_TIMEOUT_MS = 5000;
const HEARTBEAT_MS = 15000;

const POLL_MS = Math.max(500, Number.parseInt(env.GLANCES_POLL_MS ?? '', 10) || DEFAULT_POLL_MS);

export const GET: RequestHandler = async ({ url }) => {
	const rawIndex = Number.parseInt(url.searchParams.get('host') ?? '', 10);
	const hostIndex = Number.isNaN(rawIndex)
		? 0
		: Math.min(Math.max(rawIndex, 0), GLANCES_HOSTS.length - 1);
	const glancesUrl = GLANCES_HOSTS[hostIndex].url;
	let timer: ReturnType<typeof setInterval> | undefined;
	let heartbeat: ReturnType<typeof setInterval> | undefined;

	const stream = new ReadableStream({
		start(controller) {
			let polling = false;

			const enqueue = (event: string, data: unknown) => {
				try {
					controller.enqueue(
						new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
					);
				} catch {
					// Stream closed (client disconnected) — nothing to do.
				}
			};

			const poll = async () => {
				if (polling) return;
				polling = true;
				try {
					const res = await fetch(`${glancesUrl}/all`, {
						signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
					});
					if (!res.ok) throw new Error(`Glances ${res.status}`);
					const data = (await res.json()) as AllResponse;
					enqueue('snapshot', data);
				} catch (err) {
					enqueue('status', {
						connected: false,
						error: err instanceof Error ? err.message : 'unknown error'
					});
				} finally {
					polling = false;
				}
			};

			enqueue('hello', { host: hostIndex, connected: true });
			poll();
			timer = setInterval(poll, POLL_MS);
			heartbeat = setInterval(() => {
				try {
					controller.enqueue(new TextEncoder().encode(': ping\n\n'));
				} catch {
					// Stream closed — nothing to do.
				}
			}, HEARTBEAT_MS);
		},
		cancel() {
			if (timer) clearInterval(timer);
			if (heartbeat) clearInterval(heartbeat);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
