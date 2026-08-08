import { env } from '$env/dynamic/private';
import { GLANCES_HOSTS } from '$lib/env';
import type { AllResponse } from '$lib/api';

const DEFAULT_POLL_MS = 2000;
const FETCH_TIMEOUT_MS = 5000;
const MAX_BACKOFF_MS = 60000;

const BASE_POLL_MS = Math.max(
	500,
	Number.parseInt(env.GLANCES_POLL_MS ?? '', 10) || DEFAULT_POLL_MS
);

export interface GlancesHostState {
	host: number;
	data: AllResponse | null;
	error: string | null;
	lastUpdate: number | null;
}

const states = new Map<number, GlancesHostState>();
const listeners = new Set<(host: number, state: GlancesHostState) => void>();
const inflight = new Set<number>();
const failStreaks = new Map<number, number>();
const nextPollAt = new Map<number, number>();
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;

function getState(host: number): GlancesHostState {
	let state = states.get(host);
	if (!state) {
		state = { host, data: null, error: null, lastUpdate: null };
		states.set(host, state);
	}
	return state;
}

function pollDelayMs(host: number): number {
	const failures = failStreaks.get(host) ?? 0;
	if (failures === 0) return BASE_POLL_MS;
	return Math.min(BASE_POLL_MS * 2 ** failures, MAX_BACKOFF_MS);
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
		failStreaks.set(host, 0);
	} catch (err) {
		state.error = err instanceof Error ? err.message : 'unknown error';
		failStreaks.set(host, (failStreaks.get(host) ?? 0) + 1);
	} finally {
		inflight.delete(host);
		nextPollAt.set(host, Date.now() + pollDelayMs(host));
		notify(host);
	}
}

function scheduleNext() {
	if (listeners.size === 0) {
		stopPoller();
		return;
	}
	const now = Date.now();
	let earliest = Infinity;
	for (let host = 0; host < GLANCES_HOSTS.length; host++) {
		earliest = Math.min(earliest, nextPollAt.get(host) ?? now);
	}
	// Clamp so a busy/cold loop can't spin faster than 2 Hz.
	const delay = Math.max(500, earliest - now);
	pollTimer = setTimeout(run, delay);
}

// Polls each host on its own schedule (exponential backoff on failure) and
// keeps running only while there is at least one subscriber. Hosts that are
// backing off don't slow down the healthy ones.
function run() {
	if (listeners.size === 0) {
		stopPoller();
		return;
	}
	const now = Date.now();
	for (let host = 0; host < GLANCES_HOSTS.length; host++) {
		if ((nextPollAt.get(host) ?? 0) <= now) pollHost(host);
	}
	scheduleNext();
}

function stopPoller() {
	if (pollTimer) {
		clearTimeout(pollTimer);
		pollTimer = null;
	}
}

function startPoller() {
	if (started) return;
	started = true;
	for (let host = 0; host < GLANCES_HOSTS.length; host++) nextPollAt.set(host, 0);
	run();
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
		if (listeners.size === 0) stopPoller();
	};
}
