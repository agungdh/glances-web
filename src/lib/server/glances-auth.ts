export interface GlancesCredential {
	username: string;
	password: string;
}

function normalize(url: string): string {
	return url.trim().replace(/\/$/, '');
}

// Parses the GLANCES_CREDENTIALS value: a comma-separated list of
// `url|username|password` entries. The url must match one of the
// PUBLIC_GLANCES_URLS.
export function credentialsFor(url: string, raw: string): GlancesCredential | undefined {
	const target = normalize(url);
	for (const entry of raw.split(',')) {
		const [entryUrl, username, ...rest] = entry.split('|');
		if (!entryUrl || !username) continue;
		if (normalize(entryUrl) === target) {
			return { username, password: rest.join('|') };
		}
	}
	return undefined;
}
