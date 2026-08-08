<script lang="ts">
	import type { NetworkInfo } from '$lib/api';
	import { formatBytes, formatRate } from '$lib/format';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		network: NetworkInfo[];
	}

	let { network }: Props = $props();

	const accent = '#f472b6';

	const active = $derived(
		network
			.filter((n) => n.bytes_recv_rate_per_sec + n.bytes_sent_rate_per_sec > 0 || n.speed > 0)
			.sort((a, b) => {
				const ta = a.bytes_recv_rate_per_sec + a.bytes_sent_rate_per_sec;
				const tb = b.bytes_recv_rate_per_sec + b.bytes_sent_rate_per_sec;
				return tb - ta;
			})
	);

	function utilization(net: NetworkInfo): number {
		if (!net.speed || net.speed <= 0) return 0;
		const total = net.bytes_recv_rate_per_sec + net.bytes_sent_rate_per_sec;
		return Math.min(100, (total / net.speed) * 100);
	}
</script>

<StatCard title="Network" icon="🌐" {accent}>
	{#if active.length === 0}
		<p class="text-sm text-white/40">No network activity</p>
	{:else}
		<div class="space-y-4">
			{#each active as net (net.interface_name)}
				<div>
					<div class="mb-1 flex items-center justify-between text-sm">
						<p class="font-medium text-white/85">{net.interface_name}</p>
						<p class="flex items-center gap-3 text-white/50 tabular-nums">
							<span class="text-sky-400">
								↓ {formatRate(net.bytes_recv_rate_per_sec)}
							</span>
							<span class="text-violet-400">
								↑ {formatRate(net.bytes_sent_rate_per_sec)}
							</span>
						</p>
					</div>
					{#if net.speed > 0}
						<Bar value={utilization(net)} label="Utilization" color={accent} />
					{/if}
					<div
						class="mt-1 flex items-center justify-between text-[11px] text-white/35 tabular-nums"
					>
						<span>
							recv {formatBytes(net.bytes_recv)} · sent {formatBytes(net.bytes_sent)}
						</span>
						{#if net.speed > 0}
							<span>{formatRate(net.speed)} link</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
