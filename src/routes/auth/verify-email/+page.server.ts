import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	AUTH0_DOMAIN,
	AUTH0_M2M_CLIENT_ID,
	AUTH0_M2M_CLIENT_SECRET,
	AUTH0_MANAGEMENT_AUDIENCE
} from '$lib/config/auth0.config';

export const load: PageServerLoad = async ({ cookies }) => {
	const rawProfile = cookies.get('user_profile');
	const profile = rawProfile ? JSON.parse(rawProfile) : null;

	return {
		email: profile?.email ?? null
	};
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getManagementToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.value;
	}

	const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			grant_type: 'client_credentials',
			client_id: AUTH0_M2M_CLIENT_ID,
			client_secret: AUTH0_M2M_CLIENT_SECRET,
			audience: AUTH0_MANAGEMENT_AUDIENCE
		})
	});

	if (!res.ok) {
		throw new Error('Impossible de récupérer un jeton Management API Auth0');
	}

	const data = await res.json();
	cachedToken = {
		value: data.access_token,
		expiresAt: Date.now() + (data.expires_in - 60) * 1000
	};
	return cachedToken.value;
}

export const actions: Actions = {
	resend: async ({ cookies }) => {
		const rawProfile = cookies.get('user_profile');
		const profile = rawProfile ? JSON.parse(rawProfile) : null;

		if (!profile) {
			return fail(401, { error: 'Non authentifié.' });
		}

		// `auth_id` (ex: "auth0|...") renvoyé par le backend — distinct de `profile.id`,
		// qui est l'UUID interne et que la Management API n'accepte pas.
		const userId = profile.auth_id;

		if (!userId) {
			console.error('user_profile cookie sans auth_id, reconnecte-toi pour le régénérer.');
			return fail(500, { error: "Impossible d'identifier le compte. Reconnecte-toi et réessaie." });
		}

		try {
			const token = await getManagementToken();

			const res = await fetch(`https://${AUTH0_DOMAIN}/api/v2/jobs/verification-email`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id: userId })
			});

			if (!res.ok) {
				if (res.status === 429) {
					return fail(429, { error: 'Trop de tentatives, réessaie dans quelques minutes.' });
				}
				const body = await res.text();
				console.error('Auth0 verification-email error:', res.status, body);
				return fail(500, { error: "Échec de l'envoi. Réessaie dans un instant." });
			}

			return { success: true };
		} catch (err) {
			console.error('Resend verification email failed:', err);
			return fail(500, { error: "Échec de l'envoi. Réessaie dans un instant." });
		}
	}
};