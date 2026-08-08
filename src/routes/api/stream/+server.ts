import { subscribeGlances, type GlancesHostState } from '$lib/server/glances-cache';
import type { RequestHandler } from './$types';

const HEARTBEAT_MS = 15000;

export const GET: RequestHandler = async () => {
	let unsubscribe: (() => void) | undefined;
	let heartbeat: ReturnType<typeof setInterval> | undefined;

	const cleanup = () => {
		unsubscribe?.();
		unsubscribe = undefined;
		if (heartbeat) clearInterval(heartbeat);
		heartbeat = undefined;
	};

	const stream = new ReadableStream({
		start(controller) {
			const enqueue = (event: string, data: unknown) => {
				controller.enqueue(
					new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
				);
			};

			const send = (host: number, state: GlancesHostState) => {
				try {
					if (state.data) enqueue('snapshot', { host, data: state.data });
					enqueue('status', {
						host,
						connected: state.error === null,
						error: state.error ?? undefined
					});
				} catch {
					cleanup();
					throw new Error('stream closed');
				}
			};

			// Ask the client to wait 5s before reconnecting after a dropped stream.
			controller.enqueue(new TextEncoder().encode('retry: 5000\n\n'));
			enqueue('hello', { connected: true });
			unsubscribe = subscribeGlances(send);

			heartbeat = setInterval(() => {
				try {
					controller.enqueue(new TextEncoder().encode(': ping\n\n'));
				} catch {
					cleanup();
				}
			}, HEARTBEAT_MS);
		},
		cancel() {
			cleanup();
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
