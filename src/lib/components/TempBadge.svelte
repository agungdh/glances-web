<script lang="ts">
	import type { SensorInfo } from '$lib/api';
	import { tempColor, tempPct } from '$lib/temp';

	interface Props {
		sensor: SensorInfo;
		compact?: boolean;
	}

	let { sensor, compact = false }: Props = $props();
</script>

<div
	class="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5"
>
	<div class="min-w-0">
		<p class="truncate text-[10px] tracking-wider text-white/40 uppercase">{sensor.label}</p>
		<p
			class="text-sm leading-tight font-bold tabular-nums"
			style="color: {tempColor(sensor.value, sensor.warning, sensor.critical)}"
		>
			{sensor.value}<span class="text-[10px] font-semibold text-white/40">°C</span>
		</p>
	</div>
	{#if !compact}
		<div class="ml-auto h-1 w-12 overflow-hidden rounded-full bg-white/[0.08]">
			<div
				class="h-full rounded-full"
				style="width: {tempPct(
					sensor.value,
					sensor.warning,
					sensor.critical
				)}%; background: {tempColor(sensor.value, sensor.warning, sensor.critical)};"
			></div>
		</div>
	{/if}
</div>
