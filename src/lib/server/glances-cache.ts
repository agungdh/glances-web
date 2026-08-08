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
const listeners = new Set<(host: number, state: GlancesHostState) => void>();
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
	for (const fn of listeners) {
		try {
			fn(host, state);
		} catch {
			// Listener's connection is dead (stream closed) — drop it.
			listeners.delete(fn);
		}
	}
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

export function subscribeGlances(fn: (host: number, state: GlancesHostState) => void): () => void {
	startPoller();
	listeners.add(fn);
	for (let host = 0; host < GLANCES_HOSTS.length; host++) {
		try {
			fn(host, getState(host));
		} catch {
			// Connection already dead during the initial sync — drop it.
			listeners.delete(fn);
			break;
		}
	}
	return () => {
		listeners.delete(fn);
	};
}
