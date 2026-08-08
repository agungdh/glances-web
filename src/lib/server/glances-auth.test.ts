import { describe, expect, it } from 'bun:test';
import { credentialsFor } from './glances-auth';

describe('credentialsFor', () => {
	it('resolves credentials for an exact url', () => {
		expect(
			credentialsFor(
				'http://192.168.1.40:61208/api/4',
				'http://192.168.1.40:61208/api/4|admin|secret'
			)
		).toEqual({
			username: 'admin',
			password: 'secret'
		});
	});

	it('ignores a trailing slash difference on the url', () => {
		expect(credentialsFor('http://host:61208/api/4/', 'http://host:61208/api/4|u|p')).toEqual({
			username: 'u',
			password: 'p'
		});
	});

	it('supports multiple comma-separated entries', () => {
		const raw = 'http://a:61208/api/4|u1|p1,http://b:61208/api/4|u2|p2';
		expect(credentialsFor('http://b:61208/api/4', raw)).toEqual({ username: 'u2', password: 'p2' });
		expect(credentialsFor('http://a:61208/api/4', raw)).toEqual({ username: 'u1', password: 'p1' });
	});

	it('keeps extra pipe characters as part of the password', () => {
		expect(credentialsFor('http://host:61208/api/4', 'http://host:61208/api/4|u|p|a|s|s')).toEqual({
			username: 'u',
			password: 'p|a|s|s'
		});
	});

	it('returns undefined when no credentials match', () => {
		expect(
			credentialsFor('http://unknown:61208/api/4', 'http://a:61208/api/4|u1|p1')
		).toBeUndefined();
	});

	it('returns undefined for an empty raw value', () => {
		expect(credentialsFor('http://host:61208/api/4', '')).toBeUndefined();
	});
});
