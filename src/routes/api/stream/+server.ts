import { GLANCES_URL } from '$lib/env';
import type { AllResponse } from '$lib/api';
import type { RequestHandler } from './$types';

const POLL_MS = 2000;

export const GET: RequestHandler = async () => {
	let timer: ReturnType<typeof setInterval> | undefined;

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
					const res = await fetch(`${GLANCES_URL}/all`);
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

			enqueue('hello', { connected: true });
			poll();
			timer = setInterval(poll, POLL_MS);
		},
		cancel() {
			if (timer) clearInterval(timer);
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
