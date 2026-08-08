import { env } from '$env/dynamic/public';

export const GLANCES_URL: string = (
	env.PUBLIC_GLANCES_URL ?? 'http://localhost:61208/api/4'
).replace(/\/$/, '');
