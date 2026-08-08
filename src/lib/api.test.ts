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
	}
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
});
