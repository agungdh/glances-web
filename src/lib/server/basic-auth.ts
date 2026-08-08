import { timingSafeEqual } from 'node:crypto';

export interface BasicAuthConfig {
	username: string;
	password: string;
}

export function parseBasicAuth(
	header: string | null
): { username: string; password: string } | undefined {
	if (!header) return undefined;
	const match = /^Basic\s+(.+)$/i.exec(header.trim());
	if (!match) return undefined;
	try {
		const decoded = Buffer.from(match[1], 'base64').toString('utf8');
		const sep = decoded.indexOf(':');
		if (sep === -1) return undefined;
		return { username: decoded.slice(0, sep), password: decoded.slice(sep + 1) };
	} catch {
		return undefined;
	}
}

export function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

export function isAuthorized(header: string | null, config: BasicAuthConfig): boolean {
	const creds = parseBasicAuth(header);
	if (!creds) return false;
	return safeEqual(creds.username, config.username) && safeEqual(creds.password, config.password);
}

export function unauthorizedResponse(realm = 'Glances Web'): Response {
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"`,
			'Content-Type': 'text/plain'
		}
	});
}
