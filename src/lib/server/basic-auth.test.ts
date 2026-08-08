import { describe, expect, it } from 'bun:test';
import { isAuthorized, parseBasicAuth, safeEqual, unauthorizedResponse } from './basic-auth';

describe('parseBasicAuth', () => {
	it('parses a valid Authorization header', () => {
		const token = Buffer.from('admin:secret', 'utf8').toString('base64');
		expect(parseBasicAuth(`Basic ${token}`)).toEqual({ username: 'admin', password: 'secret' });
	});

	it('accepts case-insensitive Basic scheme', () => {
		const token = Buffer.from('user:pass', 'utf8').toString('base64');
		expect(parseBasicAuth(`basic ${token}`)).toEqual({ username: 'user', password: 'pass' });
	});

	it('keeps extra colons in the password', () => {
		const token = Buffer.from('user:p:a:ss', 'utf8').toString('base64');
		expect(parseBasicAuth(`Basic ${token}`)).toEqual({ username: 'user', password: 'p:a:ss' });
	});

	it('returns undefined for a missing header', () => {
		expect(parseBasicAuth(null)).toBeUndefined();
	});

	it('returns undefined for a non-Basic scheme', () => {
		expect(parseBasicAuth('Bearer abc')).toBeUndefined();
	});

	it('returns undefined for malformed base64', () => {
		expect(parseBasicAuth('Basic !!!not-base64!!!')).toBeUndefined();
	});

	it('returns undefined when there is no colon', () => {
		const token = Buffer.from('nocolon', 'utf8').toString('base64');
		expect(parseBasicAuth(`Basic ${token}`)).toBeUndefined();
	});
});

describe('safeEqual', () => {
	it('compares equal strings', () => {
		expect(safeEqual('abc', 'abc')).toBe(true);
	});

	it('rejects different strings', () => {
		expect(safeEqual('abc', 'abd')).toBe(false);
	});

	it('rejects different lengths', () => {
		expect(safeEqual('abc', 'abcd')).toBe(false);
	});
});

describe('isAuthorized', () => {
	const config = { username: 'admin', password: 'secret' };

	it('accepts matching credentials', () => {
		const token = Buffer.from('admin:secret', 'utf8').toString('base64');
		expect(isAuthorized(`Basic ${token}`, config)).toBe(true);
	});

	it('rejects a wrong username', () => {
		const token = Buffer.from('root:secret', 'utf8').toString('base64');
		expect(isAuthorized(`Basic ${token}`, config)).toBe(false);
	});

	it('rejects a wrong password', () => {
		const token = Buffer.from('admin:nope', 'utf8').toString('base64');
		expect(isAuthorized(`Basic ${token}`, config)).toBe(false);
	});

	it('rejects a missing header', () => {
		expect(isAuthorized(null, config)).toBe(false);
	});
});

describe('unauthorizedResponse', () => {
	it('returns a 401 with a WWW-Authenticate challenge', () => {
		const res = unauthorizedResponse('My Realm');
		expect(res.status).toBe(401);
		expect(res.headers.get('www-authenticate')).toContain('Basic');
		expect(res.headers.get('www-authenticate')).toContain('My Realm');
	});
});
