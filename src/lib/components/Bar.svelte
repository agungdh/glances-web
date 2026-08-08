<script lang="ts">
	interface Props {
		value: number;
		color?: string;
		label?: string;
		track?: string;
	}

	let { value, color = '#22d3ee', label = '', track = 'rgb(255 255 255 / 0.07)' }: Props = $props();

	const clamped = $derived(Math.min(100, Math.max(0, value)));
</script>

<div class="w-full">
	<div class="flex items-center justify-between text-[11px] font-medium text-white/50">
		<span>{label}</span>
		<span class="text-white/70 tabular-nums">{Math.round(clamped)}%</span>
	</div>
	<div class="mt-1 h-2 w-full overflow-hidden rounded-full" style="background: {track}">
		<div
			class="h-full rounded-full"
			style="width: {clamped}%; background: {color}; box-shadow: 0 0 8px {color}66; transition: width 500ms cubic-bezier(0.4,0,0.2,1);"
		></div>
	</div>
</div>
