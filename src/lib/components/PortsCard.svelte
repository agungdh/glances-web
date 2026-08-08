<script lang="ts">
	import type { PortInfo } from '$lib/api';
	import StatCard from './StatCard.svelte';

	interface Props {
		ports: PortInfo[];
	}

	let { ports }: Props = $props();

	const accent = '#a3e635';

	function rttLabel(port: PortInfo): string {
		if (port.status == null || port.status < 0) return 'down';
		const ms = Math.round(port.status * 1000);
		return `${ms} ms`;
	}

	function rttColor(port: PortInfo): string {
		if (port.status == null || port.status < 0) return '#ef4444';
		if (port.rtt_warning != null && port.status > port.rtt_warning) return '#f59e0b';
		return '#34d399';
	}
</script>

<StatCard title="Ports" icon="🔌" {accent}>
	{#if ports.length === 0}
		<p class="text-sm text-white/40">No monitored ports</p>
	{:else}
		<div class="space-y-2">
			{#each ports as port (port.indice ?? `${port.host}:${port.port}`)}
				<div
					class="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
				>
					<div class="min-w-0">
						<p class="text-sm font-medium text-white/85 tabular-nums">
							{port.host}:{port.port}
						</p>
						{#if port.description}
							<p class="truncate text-[11px] text-white/40">{port.description}</p>
						{/if}
					</div>
					<span class="shrink-0 font-semibold tabular-nums" style="color: {rttColor(port)}">
						{rttLabel(port)}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
