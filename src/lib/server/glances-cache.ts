import { env } from '$env/dynamic/private';
import { GLANCES_HOSTS } from '$lib/env';
import type { AllResponse } from '$lib/api';

const DEFAULT_POLL_MS = 2000;
const FETCH_TIMEOUT_MS = 5000;

const POLL_MS = Math.max(500, Number.parseInt(env.GLANCES_POLL_MS ?? '', 10) || DEFAULT_POLL_MS);

export interface GlancesHostState {
	host: number;
	data: AllResponse | null;
	error: string | null;
	lastUpdate: number | null;
}

const states = new Map<number, GlancesHostState>();
const listeners = new Map<number, Set<(state: GlancesHostState) => void>>();
const inflight = new Set<number>();
let started = false;

function getState(host: number): GlancesHostState {
	let state = states.get(host);
	if (!state) {
		state = { host, data: null, error: null, lastUpdate: null };
		states.set(host, state);
	}
	return state;
}

function notify(host: number) {
	const state = states.get(host);
	if (!state) return;
	for (const fn of listeners.get(host) ?? []) fn(state);
}

async function pollHost(host: number) {
	if (inflight.has(host)) return;
	inflight.add(host);
	const state = getState(host);
	try {
		const res = await fetch(`${GLANCES_HOSTS[host].url}/all`, {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
		});
		if (!res.ok) throw new Error(`Glances ${res.status}`);
		state.data = (await res.json()) as AllResponse;
		state.error = null;
		state.lastUpdate = Date.now();
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'unknown error';
	} finally {
		inflight.delete(host);
		notify(host);
	}
}

function startPoller() {
	if (started) return;
	started = true;
	const tick = () => {
		for (let host = 0; host < GLANCES_HOSTS.length; host++) pollHost(host);
	};
	tick();
	setInterval(tick, POLL_MS);
}

export function getGlancesState(host: number): GlancesHostState {
	startPoller();
	return getState(host);
}

export function subscribeGlances(host: number, fn: (state: GlancesHostState) => void): () => void {
	startPoller();
	if (!listeners.has(host)) listeners.set(host, new Set());
	listeners.get(host)!.add(fn);
	fn(getState(host));
	return () => {
		listeners.get(host)?.delete(fn);
	};
}
