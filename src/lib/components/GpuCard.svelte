<script lang="ts">
	import type { GpuInfo } from '$lib/api';
	import { tempColor } from '$lib/temp';
	import Gauge from './Gauge.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		gpus: GpuInfo[];
	}

	let { gpus }: Props = $props();

	const accent = '#a78bfa';
</script>

<StatCard title="GPU" icon="🎮" {accent}>
	{#if gpus.length === 0}
		<p class="text-sm text-white/40">No GPU detected</p>
	{:else}
		<div class="space-y-5">
			{#each gpus as gpu (gpu.gpu_id)}
				<div class="flex items-center gap-5">
					<Gauge
						value={gpu.mem ?? 0}
						label="VRAM"
						sub={gpu.temperature != null ? `${gpu.temperature}°C` : '—'}
						color={gpu.temperature != null ? tempColor(gpu.temperature, null, null) : accent}
						size={140}
						stroke={12}
					/>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-white/85">{gpu.name}</p>
						<div class="mt-2 grid grid-cols-2 gap-3 text-sm">
							<div>
								<p class="text-[10px] tracking-wider text-white/40 uppercase">Temperature</p>
								<p
									class="font-semibold tabular-nums"
									style="color: {tempColor(gpu.temperature, null, null)}"
								>
									{gpu.temperature != null ? `${gpu.temperature}°C` : 'N/A'}
								</p>
							</div>
							<div>
								<p class="text-[10px] tracking-wider text-white/40 uppercase">Processes</p>
								<p class="text-white/80 tabular-nums">{gpu.proc ?? 0}</p>
							</div>
							<div class="col-span-2">
								<p class="text-[10px] tracking-wider text-white/40 uppercase">Fan</p>
								<p class="text-white/80 tabular-nums">
									{gpu.fan_speed != null ? `${gpu.fan_speed} RPM` : 'N/A'}
								</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
