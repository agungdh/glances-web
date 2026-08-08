import { PUBLIC_GLANCES_URL, PUBLIC_GLANCES_URLS } from '$env/static/public';

const DEFAULT_URL = 'http://localhost:61208/api/4';

function normalize(url: string): string {
	return url.trim().replace(/\/$/, '');
}

const urls = (PUBLIC_GLANCES_URLS ?? '')
	.split(',')
	.map(normalize)
	.filter((u) => u.length > 0);

if (urls.length === 0 && PUBLIC_GLANCES_URL) urls.push(normalize(PUBLIC_GLANCES_URL));
if (urls.length === 0) urls.push(DEFAULT_URL);

export const GLANCES_HOSTS: { url: string }[] = urls.map((url) => ({ url }));

export function hostUrl(index: number): string {
	const host = GLANCES_HOSTS[index];
	if (host) return host.url;
	return GLANCES_HOSTS[0]?.url ?? DEFAULT_URL;
}
