<script lang="ts">
	import type { AlertInfo } from '$lib/api';
	import StatCard from './StatCard.svelte';

	interface Props {
		alert: AlertInfo[];
	}

	let { alert }: Props = $props();

	const accent = '#f43f5e';

	function levelColor(level: string): string {
		if (/critical|error/i.test(level)) return '#ef4444';
		if (/warning|warn/i.test(level)) return '#f59e0b';
		return '#22d3ee';
	}
</script>

<StatCard title="Alerts" icon="🚨" {accent}>
	{#if alert.length === 0}
		<p class="text-sm text-white/40">No alerts</p>
	{:else}
		<div class="space-y-2">
			{#each alert as item, i (i)}
				<div
					class="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
				>
					<span
						class="mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
						style="background: {levelColor(item.level)}1a; color: {levelColor(item.level)};"
					>
						{item.level}
					</span>
					<div class="min-w-0">
						<p class="text-sm font-medium text-white/85">{item.name}</p>
						{#if item.message}
							<p class="text-xs text-white/50">{item.message}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
