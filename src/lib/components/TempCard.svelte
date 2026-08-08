<script lang="ts">
	import type { SensorInfo } from '$lib/api';
	import StatCard from './StatCard.svelte';

	interface Props {
		sensors: SensorInfo[];
	}

	let { sensors }: Props = $props();

	const accent = '#fb923c';

	const temps = $derived(sensors.filter((s) => s.type.startsWith('temperature')));

	function tempColor(value: number, warning: number | null, critical: number | null): string {
		if (critical != null && warning != null && critical > 10000) {
			// broken thresholds (e.g. 65261) — fall back to sensible defaults
			warning = null;
			critical = null;
		}
		if (critical != null && value >= critical) return '#ef4444';
		if (warning != null && value >= warning) return '#f59e0b';
		return '#4ade80';
	}

	function pct(value: number, warning: number | null, critical: number | null): number {
		if (critical != null && warning != null && critical > 10000) {
			warning = null;
			critical = null;
		}
		const ref = critical ?? warning ?? 100;
		return Math.min(100, (value / Math.max(1, ref)) * 100);
	}
</script>

<StatCard title="Temperatures" icon="🌡" {accent}>
	{#if temps.length === 0}
		<p class="text-sm text-white/40">No temperature sensors</p>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each temps as sensor}
				<div
					class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
					title="warning: {sensor.warning} / critical: {sensor.critical}"
				>
					<p class="truncate text-[10px] tracking-wider text-white/40 uppercase">
						{sensor.label}
					</p>
					<p
						class="mt-1 text-xl font-bold tabular-nums"
						style="color: {tempColor(sensor.value, sensor.warning, sensor.critical)}"
					>
						{sensor.value}<span class="text-xs font-semibold text-white/40">°C</span>
					</p>
					<div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
						<div
							class="h-full rounded-full"
							style="width: {pct(
								sensor.value,
								sensor.warning,
								sensor.critical
							)}%; background: {tempColor(
								sensor.value,
								sensor.warning,
								sensor.critical
							)}; transition: width 500ms;"
						></div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
