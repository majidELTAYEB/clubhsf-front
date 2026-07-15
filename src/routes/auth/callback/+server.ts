import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH0_TOKEN_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_CALLBACK_URL } from '$lib/config/auth0.config';
import type { TokenSet } from '$lib/features/auth/types';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('auth0_state');
  const verifier = cookies.get('auth0_verifier');
  const redirectTo = cookies.get('auth0_redirect') ?? '/auth';

  cookies.delete('auth0_state', { path: '/' });
  cookies.delete('auth0_verifier', { path: '/' });
  cookies.delete('auth0_redirect', { path: '/' });

  if (!code || !state || state !== storedState || !verifier) {
    throw error(400, "Requête d'authentification invalide");
  }

  const res = await fetch(AUTH0_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: AUTH0_CALLBACK_URL,
      code_verifier: verifier
    })
  });

  if (!res.ok) throw error(401, "Échec de l'échange du code");

  const tokens: TokenSet = await res.json();

  const secureCookie = { path: '/', httpOnly: true, secure: true, sameSite: 'lax' as const };
  cookies.set('access_token', tokens.access_token, { ...secureCookie, maxAge: tokens.expires_in });
  cookies.set('id_token', tokens.id_token, { ...secureCookie, maxAge: tokens.expires_in });
  if (tokens.refresh_token) {
    cookies.set('refresh_token', tokens.refresh_token, { ...secureCookie, maxAge: 60 * 60 * 24 * 30 });
  }

  throw redirect(302, redirectTo);
};