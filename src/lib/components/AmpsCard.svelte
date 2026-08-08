<script lang="ts">
	import type { AmpInfo } from '$lib/api';
	import StatCard from './StatCard.svelte';

	interface Props {
		amps: AmpInfo[];
	}

	let { amps }: Props = $props();

	const accent = '#facc15';

	function ampStatus(amp: AmpInfo): { color: string; label: string } {
		if (amp.result == null) return { color: 'rgb(255 255 255 / 0.4)', label: 'unknown' };
		if (amp.result === 0) return { color: '#ef4444', label: 'alert' };
		return { color: '#34d399', label: 'ok' };
	}

	function rangeLabel(amp: AmpInfo): string {
		const bounds = [
			amp.countmin != null ? `${amp.countmin}` : null,
			amp.countmax != null ? `${amp.countmax}` : null
		];
		if (bounds[0] == null && bounds[1] == null) return 'no limit';
		return `${bounds[0] ?? '-'} – ${bounds[1] ?? '-'}`;
	}
</script>

<StatCard title="Apps" icon="🧩" {accent}>
	{#if amps.length === 0}
		<p class="text-sm text-white/40">No app monitors</p>
	{:else}
		<div class="space-y-2">
			{#each amps as amp (amp.name)}
				{@const status = ampStatus(amp)}
				<div
					class="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
				>
					<div class="flex min-w-0 items-center gap-2">
						<span
							class="h-2 w-2 shrink-0 rounded-full"
							style="background: {status.color}; box-shadow: 0 0 6px {status.color}55;"
						></span>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-white/85">{amp.name}</p>
							<p class="text-[11px] text-white/40">limit {rangeLabel(amp)}</p>
						</div>
					</div>
					<div class="shrink-0 text-right">
						<p class="text-sm font-semibold text-white/85 tabular-nums">{amp.count}</p>
						<p class="text-[10px] tracking-wider uppercase" style="color: {status.color}">
							{status.label}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
