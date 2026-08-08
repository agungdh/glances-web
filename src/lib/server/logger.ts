import { pino } from 'pino';
import { dev } from '$app/environment';

const level = process.env.GLANCES_LOG_LEVEL ?? (dev ? 'debug' : 'info');

export const logger = dev
	? pino({
			level,
			transport: {
				target: 'pino-pretty',
				options: { colorize: true, translateTime: 'SYS:standard' }
			}
		})
	: pino({ level });
