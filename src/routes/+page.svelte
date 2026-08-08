<script lang="ts">
	import { mapAllResponse, type DashboardData, type AllResponse } from '$lib/api';
	import { GLANCES_HOSTS, hostUrl } from '$lib/env';
	import CpuCard from '$lib/components/CpuCard.svelte';
	import GpuCard from '$lib/components/GpuCard.svelte';
	import MemCard from '$lib/components/MemCard.svelte';
	import StorageCard from '$lib/components/StorageCard.svelte';

	interface HostState {
		data: DashboardData | null;
		error: string | null;
		lastUpdate: Date | null;
	}

	let hosts = $state<HostState[]>(
		GLANCES_HOSTS.map(() => ({ data: null, error: null, lastUpdate: null }))
	);
	let selectedHost = $state(0);
	let streamOpen = $state(false);
	let hostnames = $state<string[]>(new Array(GLANCES_HOSTS.length).fill(''));

	let now = $state(new Date());

	let data = $derived(hosts[selectedHost].data);
	let errorMsg = $derived(hosts[selectedHost].error ?? '');
	let lastUpdate = $derived(hosts[selectedHost].lastUpdate);
	let status = $derived.by((): 'connecting' | 'live' | 'reconnecting' | 'offline' => {
		if (!streamOpen) return data ? 'reconnecting' : 'offline';
		if (errorMsg) return data ? 'reconnecting' : 'offline';
		if (data) return 'live';
		return 'connecting';
	});

	$effect(() => {
		const es = new EventSource('/api/stream');

		es.addEventListener('snapshot', (event) => {
			const { host, data } = JSON.parse((event as MessageEvent).data) as {
				host: number;
				data: AllResponse;
			};
			const d = mapAllResponse(data);
			hosts[host] = { data: d, error: null, lastUpdate: new Date() };
			hostnames[host] = d.system.hostname;
		});

		es.addEventListener('status', (event) => {
			const s = JSON.parse((event as MessageEvent).data) as {
				host: number;
				connected: boolean;
				error?: string;
			};
			hosts[s.host] = {
				data: hosts[s.host].data,
				error: s.connected ? null : (s.error ?? 'unknown error'),
				lastUpdate: hosts[s.host].lastUpdate
			};
		});

		es.onopen = () => {
			streamOpen = true;
		};

		es.onerror = () => {
			streamOpen = false;
		};

		const tick = setInterval(() => {
			now = new Date();
		}, 1000);

		return () => {
			es.close();
			clearInterval(tick);
		};
	});

	function selectHost(index: number) {
		selectedHost = index;
	}

	function hostLabel(i: number): string {
		return hostnames[i] || 'Host ' + (i + 1);
	}

	function parseUptime(uptime: string): string {
		if (!uptime) return '—';
		const parts = uptime.split(':').map(Number);
		if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return uptime;
		const [h, m, s] = parts;
		return `${h}h ${m}m ${s}s`;
	}

	function timeAgo(date: Date | null): string {
		if (!date) return '—';
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		if (seconds < 5) return 'just now';
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
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

			<div class="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
				{#each GLANCES_HOSTS as _, i (i)}
					<button
						class={[
							'rounded-lg border px-3 py-1 text-xs font-medium transition-colors',
							i === selectedHost
								? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
								: 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80'
						]}
						onclick={() => selectHost(i)}
					>
						{hostLabel(i)}
					</button>
				{/each}
			</div>

			<div class="flex items-center gap-4 text-xs text-white/50">
				{#if data}
					<span class="hidden sm:inline">up {parseUptime(data.uptime)}</span>
					<span class="hidden md:inline">last update {timeAgo(lastUpdate)}</span>
					{#if status === 'reconnecting'}
						<span class="hidden text-amber-300/70 md:inline">reconnecting…</span>
					{/if}
				{/if}
				<span
					class={[
						'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium',
						status === 'live'
							? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
							: status === 'reconnecting'
								? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
								: 'border-red-400/30 bg-red-400/10 text-red-300'
					]}
				>
					<span
						class={[
							'h-1.5 w-1.5 rounded-full',
							status === 'live'
								? 'animate-pulse bg-emerald-400'
								: status === 'reconnecting'
									? 'animate-pulse bg-amber-400'
									: 'bg-red-400'
						]}
					></span>
					{status === 'live' ? 'LIVE' : status === 'reconnecting' ? 'RECONNECTING' : 'OFFLINE'}
				</span>
			</div>
		</header>

		{#if !data && status === 'connecting'}
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
					the API is reachable at {hostUrl(selectedHost)}.
				</p>
				{#if errorMsg}
					<p class="mt-3 text-xs text-red-200/50">({errorMsg})</p>
				{/if}
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
					phys_core={data.quicklook.cpu_phys_core}
					sensors={data.sensors}
				/>
				<GpuCard gpus={data.gpu} />
				<MemCard mem={data.mem} swap={data.swap} />
				<StorageCard fs={data.fs} sensors={data.sensors} />
			</main>
		{/if}

		<footer class="mt-8 text-center text-[11px] text-white/25">
			glances-web · live SSE stream · API {hostUrl(selectedHost)}
		</footer>
	</div>
</div>
