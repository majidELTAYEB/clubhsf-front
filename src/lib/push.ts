// import { api } from './services/api';
// import { PUBLIC_VAPID_KEY } from '$env/static/public';

// export async function subscribeToPush() {
// 	const registration = await navigator.serviceWorker.register('/sw.js');
// 	await navigator.serviceWorker.ready;

// 	const permission = await Notification.requestPermission();
// 	if (permission !== 'granted') {
// 		throw new Error('Permission refusée');
// 	}

// 	const subscription = await registration.pushManager.subscribe({
// 		userVisibleOnly: true,
// 		applicationServerKey: PUBLIC_VAPID_KEY
// 	});

// 	await api.post('/push-subscriptions', subscription);

// 	return subscription;
// }

// export async function unsubscribeFromPush() {
// 	const registration = await navigator.serviceWorker.ready;
// 	const subscription = await registration.pushManager.getSubscription();

// 	if (subscription) {
// 		await api.post('/push-subscriptions/unsubscribe', { endpoint: subscription.endpoint });
// 		await subscription.unsubscribe();
// 	}
// }


import { api } from './services/api';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

export async function subscribeToPush() {
	const registration = await navigator.serviceWorker.register('/sw.js');

	await navigator.serviceWorker.ready;

	const permission = await Notification.requestPermission();

	if (permission !== 'granted') {
		throw new Error('Permission refusée');
	}

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: PUBLIC_VAPID_KEY
	});

	const json = subscription.toJSON();

	const endpoint = json.endpoint;
	const p256dh = json.keys?.p256dh;
	const auth = json.keys?.auth;

	if (!endpoint || !p256dh || !auth) {
		throw new Error('Subscription push invalide : clés manquantes');
	}

	await api.post('/push-subscriptions', {
		endpoint,
		p256dh,
		auth
	});

	return subscription;
}

export async function unsubscribeFromPush() {
	const registration = await navigator.serviceWorker.ready;

	const subscription = await registration.pushManager.getSubscription();

	if (!subscription) {
		return;
	}

	await api.post('/push-subscriptions/unsubscribe', {
		endpoint: subscription.endpoint
	});

	await subscription.unsubscribe();
}