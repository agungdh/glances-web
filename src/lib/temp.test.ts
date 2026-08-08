import { describe, expect, it } from 'bun:test';
import { tempColor, tempPct } from './temp';

describe('tempColor', () => {
	it('returns dim for null values', () => {
		expect(tempColor(null, null, null)).toBe('rgb(255 255 255 / 0.5)');
	});

	it('returns green below warning', () => {
		expect(tempColor(50, 70, 85)).toBe('#4ade80');
	});

	it('returns amber at/above warning', () => {
		expect(tempColor(70, 70, 85)).toBe('#f59e0b');
		expect(tempColor(80, 70, 85)).toBe('#f59e0b');
	});

	it('returns red at/above critical', () => {
		expect(tempColor(85, 70, 85)).toBe('#ef4444');
	});

	it('falls back to defaults when thresholds are missing', () => {
		expect(tempColor(72, null, null)).toBe('#f59e0b');
		expect(tempColor(90, null, null)).toBe('#ef4444');
	});

	it('ignores bogus thresholds reported by Glances', () => {
		expect(tempColor(50, 65261, 65261)).toBe('#4ade80');
		expect(tempColor(50, 70, 65261)).toBe('#4ade80');
	});
});

describe('tempPct', () => {
	it('is 100 when value reaches the reference threshold', () => {
		expect(tempPct(85, 70, 85)).toBe(100);
	});

	it('clamps above 100', () => {
		expect(tempPct(120, null, 100)).toBe(100);
	});

	it('falls back to critical then warning then 100', () => {
		expect(tempPct(70, null, null)).toBe(70);
		expect(tempPct(35, 70, null)).toBe(50);
	});

	it('ignores bogus thresholds', () => {
		expect(tempPct(50, 65261, 65261)).toBe(50);
	});
});
