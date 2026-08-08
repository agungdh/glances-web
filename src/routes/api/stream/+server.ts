import { subscribeGlances, type GlancesHostState } from '$lib/server/glances-cache';
import type { RequestHandler } from './$types';

const HEARTBEAT_MS = 15000;

export const GET: RequestHandler = async () => {
	let unsubscribe: (() => void) | undefined;
	let heartbeat: ReturnType<typeof setInterval> | undefined;

	const stream = new ReadableStream({
		start(controller) {
			const enqueue = (event: string, data: unknown) => {
				try {
					controller.enqueue(
						new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
					);
				} catch {
					// Stream closed (client disconnected) — nothing to do.
				}
			};

			const send = (host: number, state: GlancesHostState) => {
				if (state.data) enqueue('snapshot', { host, data: state.data });
				enqueue('status', {
					host,
					connected: state.error === null,
					error: state.error ?? undefined
				});
			};

			enqueue('hello', { connected: true });
			unsubscribe = subscribeGlances(send);

			heartbeat = setInterval(() => {
				try {
					controller.enqueue(new TextEncoder().encode(': ping\n\n'));
				} catch {
					// Stream closed — nothing to do.
				}
			}, HEARTBEAT_MS);
		},
		cancel() {
			unsubscribe?.();
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
