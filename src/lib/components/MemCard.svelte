<script lang="ts">
	import type { MemInfo, MemSwap } from '$lib/api';
	import { formatBytes } from '$lib/format';
	import Gauge from './Gauge.svelte';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		mem: MemInfo;
		swap: MemSwap;
	}

	let { mem, swap }: Props = $props();

	const accent = '#34d399';
</script>

<StatCard title="RAM" icon="🧠" {accent}>
	<div class="flex items-center justify-between gap-4">
		<Gauge value={mem.percent} label="Used" sub={formatBytes(mem.used)} color={accent} />
		<div class="flex-1 space-y-2 text-sm">
			<div class="flex items-center justify-between">
				<p class="text-[11px] tracking-wider text-white/40 uppercase">Total</p>
				<p class="text-white/85 tabular-nums">{formatBytes(mem.total)}</p>
			</div>
			<div class="flex items-center justify-between">
				<p class="text-[11px] tracking-wider text-white/40 uppercase">Used</p>
				<p class="text-white/85 tabular-nums">{formatBytes(mem.used)}</p>
			</div>
			<div class="flex items-center justify-between">
				<p class="text-[11px] tracking-wider text-white/40 uppercase">Available</p>
				<p class="text-emerald-400/90 tabular-nums">{formatBytes(mem.available)}</p>
			</div>
			<div class="flex items-center justify-between">
				<p class="text-[11px] tracking-wider text-white/40 uppercase">Free</p>
				<p class="text-white/60 tabular-nums">{formatBytes(mem.free)}</p>
			</div>
		</div>
	</div>
	<div class="mt-4">
		<Bar
			label={`Swap · ${formatBytes(swap.used)} / ${formatBytes(swap.total)}`}
			value={swap.percent}
			color={accent}
		/>
	</div>
</StatCard>
