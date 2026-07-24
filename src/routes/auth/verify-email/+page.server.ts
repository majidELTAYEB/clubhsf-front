// import { fail } from '@sveltejs/kit';
// import type { Actions, PageServerLoad } from './$types';
// import {
// 	AUTH0_DOMAIN,
// 	AUTH0_M2M_CLIENT_ID,
// 	AUTH0_M2M_CLIENT_SECRET,
// 	AUTH0_MANAGEMENT_AUDIENCE
// } from '$lib/config/auth0.config';

// export const load: PageServerLoad = async ({ cookies }) => {
// 	const rawProfile = cookies.get('user_profile');
// 	const profile = rawProfile ? JSON.parse(rawProfile) : null;

// 	return {
// 		email: profile?.email ?? null
// 	};
// };

// let cachedToken: { value: string; expiresAt: number } | null = null;

// async function getManagementToken(): Promise<string> {
// 	if (cachedToken && cachedToken.expiresAt > Date.now()) {
// 		return cachedToken.value;
// 	}

// 	const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify({
// 			grant_type: 'client_credentials',
// 			client_id: AUTH0_M2M_CLIENT_ID,
// 			client_secret: AUTH0_M2M_CLIENT_SECRET,
// 			audience: AUTH0_MANAGEMENT_AUDIENCE
// 		})
// 	});

// 	if (!res.ok) {
// 		throw new Error('Impossible de récupérer un jeton Management API Auth0');
// 	}

// 	const data = await res.json();
// 	cachedToken = {
// 		value: data.access_token,
// 		expiresAt: Date.now() + (data.expires_in - 60) * 1000
// 	};
// 	return cachedToken.value;
// }

// export const actions: Actions = {
// 	resend: async ({ cookies }) => {
// 		const rawProfile = cookies.get('user_profile');
// 		const profile = rawProfile ? JSON.parse(rawProfile) : null;

// 		if (!profile) {
// 			return fail(401, { error: 'Non authentifié.' });
// 		}

// 		// `auth_id` (ex: "auth0|...") renvoyé par le backend — distinct de `profile.id`,
// 		// qui est l'UUID interne et que la Management API n'accepte pas.
// 		const userId = profile.auth_id;

// 		if (!userId) {
// 			console.error('user_profile cookie sans auth_id, reconnecte-toi pour le régénérer.');
// 			return fail(500, { error: "Impossible d'identifier le compte. Reconnecte-toi et réessaie." });
// 		}

// 		try {
// 			const token = await getManagementToken();

// 			const res = await fetch(`https://${AUTH0_DOMAIN}/api/v2/jobs/verification-email`, {
// 				method: 'POST',
// 				headers: {
// 					Authorization: `Bearer ${token}`,
// 					'Content-Type': 'application/json'
// 				},
// 				body: JSON.stringify({ user_id: userId })
// 			});

// 			if (!res.ok) {
// 				if (res.status === 429) {
// 					return fail(429, { error: 'Trop de tentatives, réessaie dans quelques minutes.' });
// 				}
// 				const body = await res.text();
// 				console.error('Auth0 verification-email error:', res.status, body);
// 				return fail(500, { error: "Échec de l'envoi. Réessaie dans un instant." });
// 			}

// 			return { success: true };
// 		} catch (err) {
// 			console.error('Resend verification email failed:', err);
// 			return fail(500, { error: "Échec de l'envoi. Réessaie dans un instant." });
// 		}
// 	}
// };

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	AUTH0_DOMAIN,
	AUTH0_M2M_CLIENT_ID,
	AUTH0_M2M_CLIENT_SECRET,
	AUTH0_MANAGEMENT_AUDIENCE,
	AUTH0_TOKEN_URL,
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET
} from '$lib/config/auth0.config';
import type { TokenSet } from '$lib/features/auth/types';

function decodeJwtPayload(token: string): Record<string, unknown> {
	const payload = token.split('.')[1];
	return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

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
	},

	// Rafraîchit le token via le refresh_token pour obtenir un id_token à jour.
	// Un id_token émis avant la vérification contient email_verified: false figé
	// dans le JWT — ce n'est qu'en obtenant un nouveau token qu'on récupère la
	// valeur à jour, sans forcer l'utilisateur à se reconnecter entièrement.
	recheck: async ({ cookies, url }) => {
		const refreshToken = cookies.get('refresh_token');
		if (!refreshToken) {
			throw redirect(302, '/auth/login');
		}

		const res = await fetch(AUTH0_TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				grant_type: 'refresh_token',
				client_id: AUTH0_CLIENT_ID,
				client_secret: AUTH0_CLIENT_SECRET,
				refresh_token: refreshToken
			})
		});

		if (!res.ok) {
			return fail(500, { error: "Impossible de vérifier ton statut. Réessaie dans un instant." });
		}

		const tokens: TokenSet = await res.json();
		const isSecureContext = url.protocol === 'https:';
		const secureCookie = { path: '/', httpOnly: true, secure: isSecureContext, sameSite: 'lax' as const };

		cookies.set('access_token', tokens.access_token, { ...secureCookie, maxAge: tokens.expires_in });
		cookies.set('id_token', tokens.id_token, { ...secureCookie, maxAge: tokens.expires_in });
		if (tokens.refresh_token) {
			cookies.set('refresh_token', tokens.refresh_token, { ...secureCookie, maxAge: 60 * 60 * 24 * 30 });
		}

		const claims = decodeJwtPayload(tokens.id_token);

		if (claims.email_verified === true) {
			throw redirect(302, '/masterclass'); // ou la route post-vérification que tu utilises déjà ailleurs
		}

		// Toujours pas vérifié → on reste sur la page avec un message dédié
		return { stillUnverified: true };
	}
};