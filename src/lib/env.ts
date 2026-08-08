import { PUBLIC_GLANCES_URL } from '$env/static/public';

export const GLANCES_URL: string = (PUBLIC_GLANCES_URL ?? 'http://localhost:61208/api/4').replace(
	/\/$/,
	''
);
