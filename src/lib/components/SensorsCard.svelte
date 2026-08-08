<script lang="ts">
	import type { SensorInfo } from '$lib/api';
	import { tempColor } from '$lib/temp';
	import StatCard from './StatCard.svelte';
	import TempBadge from './TempBadge.svelte';

	interface Props {
		sensors: SensorInfo[];
	}

	let { sensors }: Props = $props();

	const accent = '#fb7185';

	const temperatures = $derived(sensors.filter((s) => s.type.includes('temperature')));
	const fans = $derived(sensors.filter((s) => s.type.includes('fan')));
	const voltages = $derived(sensors.filter((s) => s.type.includes('voltage')));
	const batteries = $derived(sensors.filter((s) => s.type.includes('battery')));
	const others = $derived(
		sensors.filter(
			(s) =>
				!s.type.includes('temperature') &&
				!s.type.includes('fan') &&
				!s.type.includes('voltage') &&
				!s.type.includes('battery')
		)
	);

	function readout(sensor: SensorInfo): string {
		return `${sensor.value}${sensor.unit}`;
	}
</script>

<StatCard title="Sensors" icon="🌡️" {accent}>
	{#if sensors.length === 0}
		<p class="text-sm text-white/40">No sensor data</p>
	{:else}
		<div class="space-y-4">
			{#if fans.length > 0}
				<div>
					<p class="mb-2 text-[11px] tracking-wider text-white/40 uppercase">Fans</p>
					<div class="grid grid-cols-2 gap-2">
						{#each fans as sensor (sensor.label)}
							<div class="rounded-lg bg-white/[0.04] px-2 py-1.5">
								<p class="truncate text-[10px] tracking-wider text-white/40 uppercase">
									{sensor.label}
								</p>
								<p class="text-sm font-semibold text-white/85 tabular-nums">
									{readout(sensor)}
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if voltages.length > 0}
				<div>
					<p class="mb-2 text-[11px] tracking-wider text-white/40 uppercase">Voltages</p>
					<div class="grid grid-cols-2 gap-2">
						{#each voltages as sensor (sensor.label)}
							<div class="rounded-lg bg-white/[0.04] px-2 py-1.5">
								<p class="truncate text-[10px] tracking-wider text-white/40 uppercase">
									{sensor.label}
								</p>
								<p class="text-sm font-semibold text-white/85 tabular-nums">
									{readout(sensor)}
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if batteries.length > 0}
				<div>
					<p class="mb-2 text-[11px] tracking-wider text-white/40 uppercase">Battery</p>
					<div class="flex flex-wrap gap-2">
						{#each batteries as sensor (sensor.label)}
							<div class="rounded-lg bg-white/[0.04] px-2 py-1.5">
								<p class="truncate text-[10px] tracking-wider text-white/40 uppercase">
									{sensor.label}
								</p>
								<p class="text-sm font-semibold tabular-nums">
									<span style="color: {tempColor(sensor.value, sensor.warning, sensor.critical)}">
										{readout(sensor)}
									</span>
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if temperatures.length > 0}
				<div>
					<p class="mb-2 text-[11px] tracking-wider text-white/40 uppercase">Temperatures</p>
					<div class="flex flex-wrap gap-2">
						{#each temperatures as sensor (sensor.label)}
							<TempBadge {sensor} compact />
						{/each}
					</div>
				</div>
			{/if}

			{#if others.length > 0}
				<div>
					<p class="mb-2 text-[11px] tracking-wider text-white/40 uppercase">Other</p>
					<div class="flex flex-wrap gap-2">
						{#each others as sensor (sensor.label)}
							<div class="rounded-lg bg-white/[0.04] px-2 py-1.5">
								<p class="truncate text-[10px] tracking-wider text-white/40 uppercase">
									{sensor.label}
								</p>
								<p class="text-sm font-semibold text-white/85 tabular-nums">
									{readout(sensor)}
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</StatCard>
