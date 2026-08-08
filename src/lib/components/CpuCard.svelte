<script lang="ts">
	import type { CpuInfo, PerCpu, LoadInfo, SensorInfo } from '$lib/api';
	import { formatClock } from '$lib/format';
	import Gauge from './Gauge.svelte';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';
	import TempBadge from './TempBadge.svelte';

	interface Props {
		cpu: CpuInfo;
		percpu: PerCpu[];
		load: LoadInfo;
		hz: number;
		hz_current: number;
		cpu_name: string;
		sensors?: SensorInfo[];
	}

	let { cpu, percpu, load, hz = 0, hz_current = 0, cpu_name = '', sensors = [] }: Props = $props();

	const accent = '#22d3ee';

	function loadLabel(value: number, cores: number): string {
		return `${value.toFixed(1)} (${Math.round((value / Math.max(1, cores)) * 100)}%)`;
	}

	const cpuTemps = $derived(
		sensors.filter(
			(s) => s.type.startsWith('temperature') && !/gigabyte|acpitz|Sensor/.test(s.label)
		)
	);
	const packageTemp = $derived(cpuTemps.find((s) => /package|composite/i.test(s.label)));
	const coreTemps = $derived(cpuTemps.filter((s) => /^core/i.test(s.label)));
</script>

<StatCard title="CPU" icon="⚙" {accent}>
	<div class="flex items-center justify-between gap-4">
		<Gauge value={cpu.total} label="Usage" sub={formatClock(hz_current)} color={accent} />
		<div class="min-w-0 flex-1 space-y-2 text-sm">
			<div>
				<p class="truncate text-[11px] tracking-wider text-white/40 uppercase">Model</p>
				<p class="truncate font-medium text-white/85">{cpu_name}</p>
			</div>
			<div>
				<p class="text-[11px] tracking-wider text-white/40 uppercase">Clock</p>
				<p class="text-white/85 tabular-nums">
					{formatClock(hz_current)} <span class="text-white/40">/ {formatClock(hz)}</span>
				</p>
			</div>
			<div class="grid grid-cols-3 gap-2 pt-1">
				<div class="rounded-lg bg-white/[0.04] p-2 text-center">
					<p class="text-[10px] text-white/40 uppercase">1m</p>
					<p class="text-white/80 tabular-nums">{loadLabel(load.min1, load.cpucore)}</p>
				</div>
				<div class="rounded-lg bg-white/[0.04] p-2 text-center">
					<p class="text-[10px] text-white/40 uppercase">5m</p>
					<p class="text-white/80 tabular-nums">{loadLabel(load.min5, load.cpucore)}</p>
				</div>
				<div class="rounded-lg bg-white/[0.04] p-2 text-center">
					<p class="text-[10px] text-white/40 uppercase">15m</p>
					<p class="text-white/80 tabular-nums">{loadLabel(load.min15, load.cpucore)}</p>
				</div>
			</div>
		</div>
	</div>
	<div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
		{#each percpu as core (core.cpu_number)}
			<Bar label={`Core ${core.cpu_number}`} value={core.total} color={accent} />
		{/each}
	</div>
	{#if cpuTemps.length > 0}
		<div class="mt-4 border-t border-white/[0.06] pt-3">
			<div class="flex flex-wrap items-center gap-2">
				{#if packageTemp}
					<TempBadge sensor={packageTemp} />
				{/if}
				{#each coreTemps as sensor (sensor.label)}
					<TempBadge {sensor} compact />
				{/each}
			</div>
		</div>
	{/if}
</StatCard>
