<script lang="ts">
	import { fetchDashboard, type DashboardData } from '$lib/api';
	import { GLANCES_URL } from '$lib/env';
	import CpuCard from '$lib/components/CpuCard.svelte';
	import GpuCard from '$lib/components/GpuCard.svelte';
	import MemCard from '$lib/components/MemCard.svelte';
	import StorageCard from '$lib/components/StorageCard.svelte';

	let data = $state<DashboardData | null>(null);
	let connected = $state(false);
	let loading = $state(true);
	let lastUpdate = $state<Date | null>(null);
	const REFRESH_MS = 2000;

	let stopped = $state(false);

	async function refresh() {
		try {
			data = await fetchDashboard();
			connected = true;
			lastUpdate = new Date();
		} catch {
			connected = false;
		} finally {
			loading = false;
			if (!stopped) timer = setTimeout(refresh, REFRESH_MS);
		}
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		refresh();
		return () => {
			stopped = true;
			clearTimeout(timer);
		};
	});

	function parseUptime(uptime: string): string {
		if (!uptime) return '—';
		const parts = uptime.split(':').map(Number);
		if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return uptime;
		const [h, m, s] = parts;
		return `${h}h ${m}m ${s}s`;
	}
</script>

<svelte:head>
	<title>Glances Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-white">
	<div
		class="pointer-events-none fixed inset-0"
		style="background: radial-gradient(1200px 500px at 20% -10%, rgb(34 211 238 / 0.08), transparent), radial-gradient(1000px 400px at 90% 0%, rgb(167 139 250 / 0.08), transparent);"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<header class="mb-6 flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<div
					class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-xl font-black shadow-lg shadow-cyan-500/20"
				>
					G
				</div>
				<div>
					<h1 class="text-lg font-bold tracking-tight">Glances Dashboard</h1>
					<p class="text-xs text-white/40">
						{data?.system.hostname ?? 'connecting…'} · {data?.system.linux_distro ?? ''}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-4 text-xs text-white/50">
				{#if data}
					<span class="hidden sm:inline">up {parseUptime(data.uptime)}</span>
					<span class="hidden md:inline">
						last update {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
					</span>
				{/if}
				<span
					class={[
						'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium',
						connected
							? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
							: 'border-red-400/30 bg-red-400/10 text-red-300'
					]}
				>
					<span
						class={[
							'h-1.5 w-1.5 rounded-full',
							connected ? 'animate-pulse bg-emerald-400' : 'bg-red-400'
						]}
					></span>
					{connected ? 'LIVE' : 'OFFLINE'}
				</span>
			</div>
		</header>

		{#if loading}
			<div class="flex h-[60vh] items-center justify-center">
				<div
					class="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400"
				></div>
			</div>
		{:else if !data}
			<div class="rounded-2xl border border-red-400/30 bg-red-400/10 p-8 text-center">
				<p class="text-lg font-semibold text-red-300">Cannot reach Glances</p>
				<p class="mt-1 text-sm text-red-200/70">
					Make sure <code class="rounded bg-black/30 px-1.5 py-0.5">glances -w</code> is running and
					the API is reachable at {GLANCES_URL}.
				</p>
			</div>
		{:else}
			<main class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
				<CpuCard
					cpu={data.cpu}
					percpu={data.percpu}
					load={data.load}
					hz={data.quicklook.cpu_hz}
					hz_current={data.quicklook.cpu_hz_current}
					cpu_name={data.quicklook.cpu_name}
					sensors={data.sensors}
				/>
				<GpuCard gpus={data.gpu} />
				<MemCard mem={data.mem} swap={data.swap} />
				<StorageCard fs={data.fs} sensors={data.sensors} />
			</main>
		{/if}

		<footer class="mt-8 text-center text-[11px] text-white/25">
			glances-web · polling every {(REFRESH_MS / 1000).toFixed(0)}s · API {GLANCES_URL}
		</footer>
	</div>
</div>
