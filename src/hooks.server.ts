import { env } from '$env/dynamic/private';
import { isAuthorized, unauthorizedResponse } from '$lib/server/basic-auth';
import type { Handle } from '@sveltejs/kit';

const REALM = 'Glances Dashboard';

// HTTP Basic auth gate. Enabled when both BASIC_AUTH_USERNAME and
// BASIC_AUTH_PASSWORD are set; otherwise all routes are public (dev default).
export const handle: Handle = async ({ event, resolve }) => {
	const username = env.BASIC_AUTH_USERNAME;
	const password = env.BASIC_AUTH_PASSWORD;

	if (
		username &&
		password &&
		!isAuthorized(event.request.headers.get('authorization'), { username, password })
	) {
		return unauthorizedResponse(REALM);
	}

	return resolve(event);
};
