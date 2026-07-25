// src/routes/billing/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

export const actions: Actions = {
	managePortal: async ({ locals }) => {
		if (!locals.accessToken) {
			return fail(401, { error: 'Non authentifié' });
		}

		const res = await fetch(`${BACKEND_URL}/billing/portal-session`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${locals.accessToken}` }
		});

		if (!res.ok) {
			return fail(500, { error: "Impossible d'ouvrir le portail de facturation." });
		}

		const { portal_url } = await res.json();
		return { portal_url };
	}
};