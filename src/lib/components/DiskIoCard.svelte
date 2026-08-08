<script lang="ts">
	import type { DiskIoInfo } from '$lib/api';
	import { formatRate } from '$lib/format';
	import Bar from './Bar.svelte';
	import StatCard from './StatCard.svelte';

	interface Props {
		diskio: DiskIoInfo[];
	}

	let { diskio }: Props = $props();

	const accent = '#fb923c';

	const rootDisks = $derived(
		diskio.filter(
			(disk) =>
				!diskio.some(
					(other) =>
						other.disk_name !== disk.disk_name && disk.disk_name.startsWith(other.disk_name)
				)
		)
	);
	const maxRead = $derived(Math.max(0, ...rootDisks.map((d) => d.read_bytes_rate_per_sec)));
	const maxWrite = $derived(Math.max(0, ...rootDisks.map((d) => d.write_bytes_rate_per_sec)));
</script>

<StatCard title="Disk I/O" icon="📀" {accent}>
	{#if rootDisks.length === 0}
		<p class="text-sm text-white/40">No disk activity</p>
	{:else}
		<div class="space-y-4">
			{#each rootDisks as disk (disk.disk_name)}
				<div>
					<p class="mb-2 text-sm font-medium text-white/85">{disk.disk_name}</p>
					<div class="space-y-2">
						<Bar
							value={maxRead > 0 ? (disk.read_bytes_rate_per_sec / maxRead) * 100 : 0}
							label="Read"
							hint={formatRate(disk.read_bytes_rate_per_sec)}
							color="#38bdf8"
						/>
						<Bar
							value={maxWrite > 0 ? (disk.write_bytes_rate_per_sec / maxWrite) * 100 : 0}
							label="Write"
							hint={formatRate(disk.write_bytes_rate_per_sec)}
							color="#a78bfa"
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</StatCard>
