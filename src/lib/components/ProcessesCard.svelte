<script lang="ts">
	import type { ProcessCountInfo, ProcessInfo } from '$lib/api';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		processlist: ProcessInfo[];
		processcount: ProcessCountInfo;
	}

	let { processlist, processcount }: Props = $props();

	const accent = '#22c55e';

	const top = $derived(
		[...processlist]
			.filter((p) => p.cpu_percent > 0)
			.sort((a, b) => b.cpu_percent - a.cpu_percent)
			.slice(0, 8)
	);
	const maxCpu = $derived(Math.max(0, ...top.map((p) => p.cpu_percent)));
</script>

<StatCard title="Processes" icon="🔬" {accent}>
	<div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
		<div class="rounded-lg bg-white/[0.04] p-2 text-center">
			<p class="text-[10px] text-white/40 uppercase">Total</p>
			<p class="text-white/85 tabular-nums">{processcount.total}</p>
		</div>
		<div class="rounded-lg bg-white/[0.04] p-2 text-center">
			<p class="text-[10px] text-white/40 uppercase">Running</p>
			<p class="text-emerald-400/90 tabular-nums">{processcount.running}</p>
		</div>
		<div class="rounded-lg bg-white/[0.04] p-2 text-center">
			<p class="text-[10px] text-white/40 uppercase">Sleeping</p>
			<p class="text-white/60 tabular-nums">{processcount.sleeping}</p>
		</div>
		<div class="rounded-lg bg-white/[0.04] p-2 text-center">
			<p class="text-[10px] text-white/40 uppercase">Threads</p>
			<p class="text-white/85 tabular-nums">{processcount.thread}</p>
		</div>
	</div>
	{#if top.length === 0}
		<p class="text-sm text-white/40">No process data</p>
	{:else}
		<div class="space-y-3">
			{#each top as proc (proc.pid)}
				<div>
					<div class="mb-1 flex items-center justify-between text-sm">
						<p class="truncate font-medium text-white/85">{proc.name}</p>
						<p class="text-white/50 tabular-nums">
							<span class="text-emerald-400">{proc.cpu_percent.toFixed(1)}%</span>
							<span class="mx-1 text-white/25">·</span>
							{proc.memory_percent.toFixed(1)}% mem
						</p>
					</div>
					<Bar
						value={maxCpu > 0 ? (proc.cpu_percent / maxCpu) * 100 : 0}
						label={proc.username}
						color={accent}
						hint={`${proc.status} · ${proc.pid}`}
					/>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
