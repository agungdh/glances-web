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

export function mapAllResponse(data: Partial<AllResponse>): DashboardData {
	return {
		cpu: data.cpu ?? { total: 0, user: 0, system: 0, nice: 0, idle: 0, iowait: 0, cpucore: 0 },
		percpu: data.percpu ?? [],
		mem: data.mem ?? { total: 0, available: 0, percent: 0, used: 0, free: 0 },
		swap: data.memswap ?? { total: 0, used: 0, free: 0, percent: 0 },
		fs: data.fs ?? [],
		gpu: data.gpu ?? [],
		sensors: data.sensors ?? [],
		system: data.system ?? { os_name: '', hostname: '', linux_distro: '', hr_name: '' },
		load: data.load ?? { min1: 0, min5: 0, min15: 0, cpucore: 0 },
		uptime: data.uptime ?? '',
		quicklook: data.quicklook ?? {
			cpu_name: '',
			cpu_hz_current: 0,
			cpu_hz: 0,
			cpu_phys_core: 0,
			cpu_log_core: 0
		}
	};
}
