export function formatBytes(bytes: number): string {
	if (!bytes || bytes <= 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatClock(hz: number): string {
	if (!hz) return '—';
	return `${(hz / 1e9).toFixed(1)} GHz`;
}

export function formatRate(bytesPerSec: number): string {
	if (!bytesPerSec || bytesPerSec <= 0) return '0 B/s';
	return `${formatBytes(bytesPerSec)}/s`;
}
