import { GLANCES_URL } from './env';

export interface CpuInfo {
	total: number;
	user: number;
	system: number;
	nice: number;
	idle: number;
	iowait: number;
	cpucore: number;
}

export interface PerCpu {
	cpu_number: number;
	total: number;
}

export interface MemInfo {
	total: number;
	available: number;
	percent: number;
	used: number;
	free: number;
}

export interface MemSwap {
	total: number;
	used: number;
	free: number;
	percent: number;
}

export interface FsInfo {
	device_name: string;
	fs_type: string;
	mnt_point: string;
	size: number;
	used: number;
	free: number;
	percent: number;
}

export interface GpuInfo {
	gpu_id: string;
	name: string;
	mem: number | null;
	proc: number;
	temperature: number | null;
	fan_speed: number | null;
}

export interface SensorInfo {
	label: string;
	unit: string;
	value: number;
	warning: number | null;
	critical: number | null;
	type: string;
}

export interface SystemInfo {
	os_name: string;
	hostname: string;
	linux_distro: string;
	hr_name: string;
}

export interface LoadInfo {
	min1: number;
	min5: number;
	min15: number;
	cpucore: number;
}

export interface QuicklookInfo {
	cpu_name: string;
	cpu_hz_current: number;
	cpu_hz: number;
	cpu_phys_core: number;
	cpu_log_core: number;
}

export interface DashboardData {
	cpu: CpuInfo;
	percpu: PerCpu[];
	mem: MemInfo;
	swap: MemSwap;
	fs: FsInfo[];
	gpu: GpuInfo[];
	sensors: SensorInfo[];
	system: SystemInfo;
	load: LoadInfo;
	uptime: string;
	quicklook: QuicklookInfo;
}

export interface AllResponse {
	cpu: CpuInfo;
	percpu: PerCpu[];
	mem: MemInfo;
	memswap: MemSwap;
	fs: FsInfo[];
	gpu: GpuInfo[];
	sensors: SensorInfo[];
	system: SystemInfo;
	load: LoadInfo;
	uptime: string;
	quicklook: QuicklookInfo;
}

async function getJson<T>(path: string): Promise<T> {
	const res = await fetch(`${GLANCES_URL}/${path}`);
	if (!res.ok) throw new Error(`Glances ${path}: ${res.status}`);
	return res.json() as Promise<T>;
}

export function mapAllResponse(data: AllResponse): DashboardData {
	return {
		cpu: data.cpu,
		percpu: data.percpu,
		mem: data.mem,
		swap: data.memswap,
		fs: data.fs,
		gpu: data.gpu,
		sensors: data.sensors,
		system: data.system,
		load: data.load,
		uptime: data.uptime,
		quicklook: data.quicklook
	};
}

export async function fetchDashboard(): Promise<DashboardData> {
	// Fetch every metric in a single /all request so all values are consistent (same snapshot).
	const data = await getJson<AllResponse>('all');
	return mapAllResponse(data);
}
