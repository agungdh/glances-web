import { describe, expect, it } from 'bun:test';
import { mapAllResponse, type AllResponse } from './api';

const full: AllResponse = {
	cpu: { total: 10, user: 5, system: 2, nice: 0, idle: 90, iowait: 1, cpucore: 4 },
	percpu: [{ cpu_number: 0, total: 10 }],
	mem: { total: 1024, available: 512, percent: 50, used: 512, free: 256 },
	memswap: { total: 1024, used: 0, free: 1024, percent: 0 },
	fs: [
		{
			device_name: '/dev/sda1',
			fs_type: 'ext4',
			mnt_point: '/',
			size: 1024,
			used: 512,
			free: 512,
			percent: 50
		}
	],
	gpu: [{ gpu_id: '0', name: 'GPU', mem: 100, proc: 2, temperature: 40, fan_speed: null }],
	sensors: [
		{ label: 'core0', unit: 'C', value: 45, warning: 70, critical: 85, type: 'temperature_core' }
	],
	system: { os_name: 'Linux', hostname: 'host', linux_distro: 'Ubuntu', hr_name: 'Ubuntu' },
	load: { min1: 1, min5: 2, min15: 1, cpucore: 4 },
	uptime: '1:02:03',
	quicklook: {
		cpu_name: 'CPU',
		cpu_hz_current: 1e9,
		cpu_hz: 2e9,
		cpu_phys_core: 4,
		cpu_log_core: 8
	},
	network: [
		{
			interface_name: 'enp3s0',
			speed: 1e9,
			bytes_recv: 100,
			bytes_sent: 50,
			bytes_recv_rate_per_sec: 10,
			bytes_sent_rate_per_sec: 5
		}
	],
	diskio: [
		{
			disk_name: 'sda',
			read_bytes: 100,
			write_bytes: 50,
			read_bytes_rate_per_sec: 10,
			write_bytes_rate_per_sec: 5
		}
	],
	processlist: [
		{ pid: 1, name: 'init', username: 'root', cpu_percent: 1.5, memory_percent: 0.5, status: 'S' }
	],
	processcount: { total: 100, running: 2, sleeping: 90, thread: 400 },
	containers: [
		{
			name: 'redis',
			status: 'running',
			cpu_percent: 1,
			memory_usage: 1024,
			memory_limit: 2048,
			network_rx: 10,
			network_tx: 5,
			uptime: '2 hours',
			image: ['redis:latest'],
			ports: '6379/tcp'
		}
	],
	alert: [{ level: 'critical', name: 'CPU', message: 'high load' }],
	ports: [{ host: 'localhost', port: 8080, description: 'web', status: 0.001, rtt_warning: 0.5 }],
	amps: [{ name: 'Nginx', result: 1, count: 2, countmin: 1, countmax: 4 }]
};

describe('mapAllResponse', () => {
	it('maps memswap and keeps all fields for a complete response', () => {
		const d = mapAllResponse(full);
		expect(d.swap).toBe(full.memswap);
		expect(d.cpu).toBe(full.cpu);
		expect(d.uptime).toBe('1:02:03');
	});

	it('provides defaults for missing sections', () => {
		const d = mapAllResponse({});
		expect(d.fs).toEqual([]);
		expect(d.gpu).toEqual([]);
		expect(d.sensors).toEqual([]);
		expect(d.percpu).toEqual([]);
		expect(d.network).toEqual([]);
		expect(d.diskio).toEqual([]);
		expect(d.processlist).toEqual([]);
		expect(d.containers).toEqual([]);
		expect(d.alert).toEqual([]);
		expect(d.ports).toEqual([]);
		expect(d.amps).toEqual([]);
		expect(d.processcount.total).toBe(0);
		expect(d.uptime).toBe('');
		expect(d.cpu.total).toBe(0);
		expect(d.system.hostname).toBe('');
		expect(d.load.cpucore).toBe(0);
		expect(d.quicklook.cpu_name).toBe('');
	});

	it('tolerates partially-missing array fields', () => {
		const d = mapAllResponse({ cpu: full.cpu });
		expect(d.cpu.total).toBe(10);
		expect(d.fs).toEqual([]);
		expect(d.swap.total).toBe(0);
	});

	it('maps all new monitoring sections', () => {
		const d = mapAllResponse(full);
		expect(d.network).toHaveLength(1);
		expect(d.network[0].interface_name).toBe('enp3s0');
		expect(d.diskio[0].disk_name).toBe('sda');
		expect(d.processlist[0].pid).toBe(1);
		expect(d.processcount.total).toBe(100);
		expect(d.containers[0].name).toBe('redis');
		expect(d.alert[0].level).toBe('critical');
		expect(d.ports[0].port).toBe(8080);
		expect(d.amps[0].result).toBe(1);
	});
});
