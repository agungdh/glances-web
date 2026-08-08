import { describe, expect, it } from 'bun:test';
import { formatBytes, formatClock, formatRate } from './format';

describe('formatBytes', () => {
	it('returns 0 B for zero and falsy input', () => {
		expect(formatBytes(0)).toBe('0 B');
		expect(formatBytes(-5)).toBe('0 B');
		expect(formatBytes(NaN)).toBe('0 B');
	});

	it('formats bytes without decimals', () => {
		expect(formatBytes(512)).toBe('512 B');
	});

	it('formats KiB/MiB/GiB with one decimal', () => {
		expect(formatBytes(1024)).toBe('1.0 KB');
		expect(formatBytes(1536)).toBe('1.5 KB');
		expect(formatBytes(1024 ** 2)).toBe('1.0 MB');
		expect(formatBytes(1024 ** 3)).toBe('1.0 GB');
	});

	it('caps at TB', () => {
		expect(formatBytes(1024 ** 5)).toBe('1024.0 TB');
	});
});

describe('formatClock', () => {
	it('returns em dash for falsy values', () => {
		expect(formatClock(0)).toBe('—');
		expect(formatClock(NaN)).toBe('—');
	});

	it('formats hz as GHz', () => {
		expect(formatClock(3.4e9)).toBe('3.4 GHz');
		expect(formatClock(1.2e9)).toBe('1.2 GHz');
	});
});

describe('formatRate', () => {
	it('returns 0 B/s for zero and negative rates', () => {
		expect(formatRate(0)).toBe('0 B/s');
		expect(formatRate(-10)).toBe('0 B/s');
	});

	it('formats rates with a /s suffix', () => {
		expect(formatRate(512)).toBe('512 B/s');
		expect(formatRate(472539)).toBe('461.5 KB/s');
		expect(formatRate(1024 ** 2)).toBe('1.0 MB/s');
	});
});
