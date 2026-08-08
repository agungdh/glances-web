import { getPollLog } from '$lib/server/poll-log';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const limit = Math.min(Number.parseInt(url.searchParams.get('limit') ?? '', 10) || 100, 1000);
	const entries = getPollLog().reverse().slice(0, limit);
	return new Response(JSON.stringify(entries), {
		headers: { 'Content-Type': 'application/json' }
	});
};
