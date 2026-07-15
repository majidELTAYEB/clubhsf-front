import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  AUTH0_AUTHORIZE_URL,
  AUTH0_CLIENT_ID,
  AUTH0_CALLBACK_URL,
  AUTH0_AUDIENCE
} from '$lib/config/auth0.config';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '$lib/features/auth/pkce';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateState();
  const redirectTo = url.searchParams.get('redirectTo') ?? '/home';

  const cookieOpts = { path: '/', httpOnly: true, secure: true, maxAge: 600, sameSite: 'lax' as const };
  cookies.set('auth0_verifier', verifier, cookieOpts);
  cookies.set('auth0_state', state, cookieOpts);
  cookies.set('auth0_redirect', redirectTo, cookieOpts);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: AUTH0_CALLBACK_URL,
    scope: 'openid profile email offline_access',
    audience: AUTH0_AUDIENCE,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });

  throw redirect(302, `${AUTH0_AUTHORIZE_URL}?${params.toString()}`);
};