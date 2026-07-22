import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

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
	}
};