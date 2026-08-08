const MAX_ENTRIES = 100_000;
const TTL_MS = 24 * 60 * 60 * 1000;

export type PollLogEntry =
	| {
			id: number;
			ts: number;
			type: 'poll';
			host: number;
			ok: boolean;
			ms: number;
			bytes?: number;
			error?: string;
	  }
	| { id: number; ts: number; type: 'poller'; action: 'started' | 'stopped'; hosts: number };

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
type PollLogEntryInput = DistributiveOmit<PollLogEntry, 'id'>;

let buffer: PollLogEntry[] = new Array(MAX_ENTRIES);
let head = 0;
let size = 0;
let nextId = 0;

function push(entry: PollLogEntryInput): void {
	const item = { id: nextId++, ...entry } as PollLogEntry;
	if (size < MAX_ENTRIES) {
		buffer[(head + size) % MAX_ENTRIES] = item;
		size++;
	} else {
		buffer[head] = item;
		head = (head + 1) % MAX_ENTRIES;
	}
}

export function logPoll(data: Omit<Extract<PollLogEntry, { type: 'poll' }>, 'id' | 'ts'>): void {
	push({ ts: Date.now(), ...data });
}

export function logPoller(action: 'started' | 'stopped', hosts: number): void {
	push({ type: 'poller', ts: Date.now(), action, hosts });
}

export function getPollLog(): PollLogEntry[] {
	const cutoff = Date.now() - TTL_MS;
	const entries: PollLogEntry[] = [];
	for (let i = 0; i < size; i++) {
		const entry = buffer[(head + i) % MAX_ENTRIES];
		if (entry.ts < cutoff) break;
		entries.push(entry);
	}
	return entries;
}

export function clearPollLog(): void {
	head = 0;
	size = 0;
}
