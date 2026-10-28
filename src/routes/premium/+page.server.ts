// import { fail } from '@sveltejs/kit';
// import type { Actions } from './$types';
// import { env } from '$env/dynamic/private';

// const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

// export const actions: Actions = {
// 	checkout: async ({ locals }) => {
// 		if (!locals.accessToken) {
// 			return fail(401, { error: 'Non authentifié' });
// 		}

// 		const res = await fetch(`${BACKEND_URL}/billing/checkout-session`, {
// 			method: 'POST',
// 			headers: { Authorization: `Bearer ${locals.accessToken}` }
// 		});

// 		if (!res.ok) {
// 			return fail(500, { error: 'Impossible de créer la session de paiement' });
// 		}

// 		const { checkout_url } = await res.json();
// 		return { checkout_url };
// 	}
// };


import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

type PaidCollection = {
	id: string;
	title: string;
	description?: string | null;
	cover_image_url: string | null;
	access_type: 'included' | 'paid';
	price_cents?: number | null;
	currency: string;
	owned: boolean;
	accessible: boolean;
	item_count: number;
	is_public: boolean;
};

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/collections');
		if (!res.ok) return { masterclasses: [] as PaidCollection[] };

		const list: PaidCollection[] = (await res.json()).data ?? [];
		// Seules les collections payantes sont proposées à l'unité
		const masterclasses = list.filter((c) => c.is_public && c.access_type === 'paid');
		return { masterclasses };
	} catch {
		// La page d'abonnement doit rester utilisable même si la liste échoue
		return { masterclasses: [] as PaidCollection[] };
	}
};

export const actions: Actions = {
	checkout: async ({ locals }) => {
		if (!locals.accessToken) {
			return fail(401, { error: 'Non authentifié' });
		}

		const res = await fetch(`${BACKEND_URL}/billing/checkout-session`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${locals.accessToken}` }
		});

		if (!res.ok) {
			return fail(500, { error: 'Impossible de créer la session de paiement' });
		}

		const { checkout_url } = await res.json();
		return { checkout_url };
	},

	buy: async ({ locals, request }) => {
		if (!locals.accessToken) return fail(401, { error: 'Non authentifié' });

		const form = await request.formData();
		const collectionId = form.get('collection_id');
		if (typeof collectionId !== 'string' || !collectionId) {
			return fail(400, { error: 'Masterclass invalide' });
		}

		const res = await fetch(`${BACKEND_URL}/purchases/collections/${collectionId}/checkout`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${locals.accessToken}` }
		});

		if (!res.ok) {
			const body = await res.json().catch(() => null);
			const code = body?.error?.code;
			if (code === 'ALREADY_PURCHASED')
				return fail(409, { error: 'Tu as déjà acheté cette masterclass.' });
			if (code === 'ALREADY_INCLUDED')
				return fail(409, { error: 'Cette masterclass est incluse dans ton abonnement.' });
			return fail(500, { error: 'Impossible de créer la session de paiement' });
		}

		const body = await res.json();
		const url = body?.data?.url ?? body?.url ?? null;
		return url ? { checkout_url: url as string } : fail(500, { error: 'Réponse invalide' });
	}
};