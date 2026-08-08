<script lang="ts">
	import type { FsInfo, SensorInfo } from '$lib/api';
	import { formatBytes } from '$lib/format';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';
	import TempBadge from './TempBadge.svelte';

	interface Props {
		fs: FsInfo[];
		sensors?: SensorInfo[];
	}

	let { fs, sensors = [] }: Props = $props();

	const accent = '#60a5fa';

	function colorFor(percent: number): string {
		if (percent >= 90) return '#f87171';
		if (percent >= 75) return '#fbbf24';
		return accent;
	}

	const diskTemps = $derived(
		sensors.filter((s) => s.type.includes('hdd') || /ssd|nvme|disk|drive/i.test(s.label))
	);
</script>

<StatCard title="Storage" icon="💾" {accent}>
	{#if fs.length === 0}
		<p class="text-sm text-white/40">No filesystem data</p>
	{:else}
		<div class="space-y-4">
			{#each fs as disk (disk.mnt_point)}
				<div>
					<div class="mb-1 flex items-center justify-between text-sm">
						<p class="font-medium text-white/85">{disk.mnt_point}</p>
						<p class="text-white/50 tabular-nums">
							{formatBytes(disk.used)}
							<span class="text-white/30">/</span>
							{formatBytes(disk.size)}
						</p>
					</div>
					<Bar value={disk.percent} label={disk.device_name} color={colorFor(disk.percent)} />
				</div>
			{/each}
		</div>
	{/if}
	{#if diskTemps.length > 0}
		<div class="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
			{#each diskTemps as sensor (sensor.label)}
				<TempBadge {sensor} />
			{/each}
		</div>
	{/if}
</StatCard>
