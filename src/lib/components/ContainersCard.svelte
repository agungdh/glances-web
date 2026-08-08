<script lang="ts">
	import type { ContainerInfo } from '$lib/api';
	import { formatBytes, formatRate } from '$lib/format';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		containers: ContainerInfo[];
	}

	let { containers }: Props = $props();

	const accent = '#38bdf8';

	function statusColor(status: string): string {
		if (/running|up/i.test(status)) return '#34d399';
		if (/exited|stopped|dead/i.test(status)) return '#ef4444';
		if (/restarting|paused/i.test(status)) return '#fbbf24';
		return 'rgb(255 255 255 / 0.4)';
	}

	function memPercent(container: ContainerInfo): number {
		if (!container.memory_limit || container.memory_limit <= 0) return 0;
		return Math.min(100, (container.memory_usage / container.memory_limit) * 100);
	}
</script>

<StatCard title="Containers" icon="📦" {accent}>
	{#if containers.length === 0}
		<p class="text-sm text-white/40">No containers detected</p>
	{:else}
		<div class="space-y-4">
			{#each containers as container (container.name)}
				<div>
					<div class="mb-1 flex items-center justify-between gap-2 text-sm">
						<div class="flex min-w-0 items-center gap-2">
							<span
								class="h-2 w-2 shrink-0 rounded-full"
								style="background: {statusColor(
									container.status
								)}; box-shadow: 0 0 6px {statusColor(container.status)}55;"
							></span>
							<p class="truncate font-medium text-white/85">{container.name}</p>
						</div>
						<p class="shrink-0 text-white/50 tabular-nums">
							{container.cpu_percent.toFixed(1)}% cpu
						</p>
					</div>
					<Bar
						value={memPercent(container)}
						label={`${container.image[0] ?? 'container'} · ${container.uptime}`}
						hint={formatBytes(container.memory_usage)}
						color={accent}
					/>
					<div
						class="mt-1 flex items-center justify-between text-[11px] text-white/35 tabular-nums"
					>
						<span>
							↓ {formatRate(container.network_rx)} · ↑ {formatRate(container.network_tx)}
						</span>
						<span class="truncate">{container.ports}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
