import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	AUTH0_TOKEN_URL,
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET,
	AUTH0_CALLBACK_PATH
} from '$lib/config/auth0.config';
import type { TokenSet } from '$lib/features/auth/types';
import { env } from '$env/dynamic/private';

type UserProfile = {
	id: string;
	email: string;
	full_name: string;
	role: string;
	is_premium: boolean;
	created_at: string;
	auth_id: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> {
	const payload = token.split('.')[1];
	const json = Buffer.from(payload, 'base64url').toString('utf-8');
	return JSON.parse(json);
}

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('auth0_state');
	const verifier = cookies.get('auth0_verifier');
	const redirectTo = cookies.get('auth0_redirect') ?? '/';

	const authError = url.searchParams.get('error');
	const authErrorDescription = url.searchParams.get('error_description');

	if (authError) {
		cookies.delete('auth0_state', { path: '/' });
		cookies.delete('auth0_verifier', { path: '/' });
		cookies.delete('auth0_redirect', { path: '/' });

		const message = authErrorDescription ?? authError;
		throw redirect(302, `/auth/error?message=${encodeURIComponent(message)}`);
	}

	cookies.delete('auth0_state', { path: '/' });
	cookies.delete('auth0_verifier', { path: '/' });
	cookies.delete('auth0_redirect', { path: '/' });

	if (!code || !state || state !== storedState || !verifier) {
		throw error(400, "Requête d'authentification invalide");
	}

	const redirectUri = `${url.origin}${AUTH0_CALLBACK_PATH}`;

	const res = await fetch(AUTH0_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			grant_type: 'authorization_code',
			client_id: AUTH0_CLIENT_ID,
			client_secret: AUTH0_CLIENT_SECRET,
			code,
			redirect_uri: redirectUri,
			code_verifier: verifier
		})
	});

	if (!res.ok) throw error(401, "Échec de l'échange du code");

	const tokens: TokenSet = await res.json();

	const meRes = await fetch(`${env.BACKEND_URL}/me`, {
	headers: { Authorization: `Bearer ${tokens.access_token}` }
});

	if (!meRes.ok) {
		throw error(401, 'Impossible de récupérer le profil utilisateur');
	}

	const me: UserProfile = await meRes.json();

	const isSecureContext = url.protocol === 'https:';
	const secureCookie = {
		path: '/',
		httpOnly: true,
		secure: isSecureContext,
		sameSite: 'lax' as const
	};

	cookies.set('access_token', tokens.access_token, { ...secureCookie, maxAge: tokens.expires_in });
	cookies.set('id_token', tokens.id_token, { ...secureCookie, maxAge: tokens.expires_in });
	if (tokens.refresh_token) {
		cookies.set('refresh_token', tokens.refresh_token, { ...secureCookie, maxAge: 60 * 60 * 24 * 30 });
	}
	cookies.set('user_profile', JSON.stringify(me), { ...secureCookie, maxAge: tokens.expires_in });

	// email_verified vient toujours de l'ID token, pas du backend.
	const idTokenClaims = decodeJwtPayload(tokens.id_token);
	if (idTokenClaims.email_verified === false) {
		throw redirect(302, '/auth/verify-email');
	}

	throw redirect(302, redirectTo);
};