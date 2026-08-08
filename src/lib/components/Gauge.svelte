<script lang="ts">
	interface Props {
		value: number;
		label?: string;
		sub?: string;
		color?: string;
		size?: number;
		stroke?: number;
	}

	let { value, label = '', sub = '', color = '#22d3ee', size = 180, stroke = 14 }: Props = $props();

	const radius = $derived((size - stroke) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const clamped = $derived(Math.min(100, Math.max(0, value)));
	const offset = $derived(circumference * (1 - clamped / 100));
</script>

<div
	class="relative inline-flex items-center justify-center"
	style="width:{size}px; height:{size}px"
>
	<svg width={size} height={size} class="-rotate-90">
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke="rgb(255 255 255 / 0.06)"
			stroke-width={stroke}
		/>
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={color}
			stroke-width={stroke}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			style="transition: stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1), stroke 300ms; filter: drop-shadow(0 0 6px {color}55);"
		/>
	</svg>
	<div class="absolute flex flex-col items-center">
		<span class="text-3xl font-bold tabular-nums" style="color: {color}">
			{Math.round(clamped)}
			<span class="text-base font-semibold text-white/50">%</span>
		</span>
		{#if label}
			<span class="mt-0.5 text-[11px] font-medium tracking-wider text-white/60 uppercase"
				>{label}</span
			>
		{/if}
		{#if sub}
			<span class="text-[11px] text-white/40 tabular-nums">{sub}</span>
		{/if}
	</div>
</div>
