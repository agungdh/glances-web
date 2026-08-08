export function tempColor(
	value: number | null,
	warning: number | null,
	critical: number | null,
	defaults: { warning: number; critical: number } = { warning: 70, critical: 85 }
): string {
	if (value == null) return 'rgb(255 255 255 / 0.5)';
	const { warning: w, critical: c } = sanitizeThresholds(
		warning ?? defaults.warning,
		critical ?? defaults.critical
	);
	if (c != null && value >= c) return '#ef4444';
	if (w != null && value >= w) return '#f59e0b';
	return '#4ade80';
}

export function tempPct(value: number, warning: number | null, critical: number | null): number {
	const { warning: w, critical: c } = sanitizeThresholds(warning, critical);
	const ref = c ?? w ?? 100;
	return Math.min(100, (value / Math.max(1, ref)) * 100);
}

function sanitizeThresholds(
	warning: number | null,
	critical: number | null
): { warning: number | null; critical: number | null } {
	// Glances sometimes reports bogus thresholds (e.g. 65261) — treat them as absent.
	if (critical != null && critical > 10000) critical = null;
	if (warning != null && warning > 10000) warning = null;
	return { warning, critical };
}
