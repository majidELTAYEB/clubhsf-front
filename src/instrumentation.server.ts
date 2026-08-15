import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://4ed5ddef8b744b1c5c4ecf04895e59d6@o4511912808218624.ingest.de.sentry.io/4511912808480848',

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
