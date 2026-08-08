<script lang="ts">
	import type { CpuInfo, PerCpu, LoadInfo, SensorInfo } from '$lib/api';
	import { formatClock } from '$lib/format';
	import { tempColor } from '$lib/temp';
	import Gauge from './Gauge.svelte';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		cpu: CpuInfo;
		percpu: PerCpu[];
		load: LoadInfo;
		hz: number;
		hz_current: number;
		cpu_name: string;
		phys_core: number;
		sensors?: SensorInfo[];
	}

	let {
		cpu,
		percpu,
		load,
		hz = 0,
		hz_current = 0,
		cpu_name = '',
		phys_core = 0,
		sensors = []
	}: Props = $props();

	const accent = '#22d3ee';

	function loadLabel(value: number, cores: number): string {
		return `${value.toFixed(1)} (${Math.round((value / Math.max(1, cores)) * 100)}%)`;
	}

	const cpuTemps = $derived(
		sensors.filter(
			(s) => s.type.startsWith('temperature') && !/gigabyte|acpitz|Sensor/.test(s.label)
		)
	);
	const coreTemps = $derived(cpuTemps.filter((s) => /^core/i.test(s.label)));
	const coreTempFor = $derived(
		new Map(coreTemps.map((s) => [Number.parseInt(s.label.replace(/\D+/g, ''), 10), s]))
	);
	const compositeTemp = $derived(cpuTemps.find((s) => /^package/i.test(s.label)));

	// SMT/hyperthreading: sensor reports physical cores only (Core 0..phys-1), but
	// percpu has logical threads. On Linux, SMT siblings are adjacent logical CPUs,
	// e.g. 6 phys / 12 threads → Core 0 = CPU 0+1, Core 1 = CPU 2+3, ...
	function threadTemp(thread: number): SensorInfo | undefined {
		if (phys_core <= 0) return coreTempFor.get(thread);
		const threadsPerCore = Math.max(1, Math.round(percpu.length / phys_core));
		return coreTempFor.get(Math.floor(thread / threadsPerCore));
	}

	const isHyperthreading = $derived(phys_core > 0 && percpu.length > phys_core);
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
			{#if compositeTemp}
				<div>
					<p class="text-[11px] tracking-wider text-white/40 uppercase">Temp</p>
					<p
						class="tabular-nums"
						style="color: {tempColor(
							compositeTemp.value,
							compositeTemp.warning,
							compositeTemp.critical
						)}"
					>
						{compositeTemp.value}°C
					</p>
				</div>
			{/if}
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
			{@const temp = threadTemp(core.cpu_number)}
			<Bar
				label={`Thread ${core.cpu_number}`}
				value={core.total}
				color={accent}
				hint={temp ? `${temp.value}°` : ''}
				hintColor={temp ? tempColor(temp.value, temp.warning, temp.critical) : ''}
			/>
		{/each}
	</div>
</StatCard>
