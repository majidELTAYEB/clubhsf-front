import { redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import {
  AUTH0_AUTHORIZE_URL,
  AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE,
  AUTH0_CALLBACK_PATH
} from '$lib/config/auth0.config';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '$lib/features/auth/pkce';

type ScreenHint = 'login' | 'signup';

export function startAuth0Flow(
  url: URL,
  cookies: Cookies,
  screenHint: ScreenHint
) {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateState();
  const redirectTo = url.searchParams.get('redirectTo') ?? '/masterclass';

  // Calculé depuis la requête entrante : localhost sur PC, IP réseau sur téléphone,
  // vrai domaine en prod — plus jamais figé.
  const redirectUri = `${url.origin}${AUTH0_CALLBACK_PATH}`;

  // Secure est ignoré par le navigateur en HTTP (ex: http://192.168.x.x depuis un téléphone) —
  // on ne le force que si on est réellement en HTTPS.
  const isSecureContext = url.protocol === 'https:';
  const cookieOpts = {
    path: '/',
    httpOnly: true,
    secure: isSecureContext,
    maxAge: 600,
    sameSite: 'lax' as const
  };

  cookies.set('auth0_verifier', verifier, cookieOpts);
  cookies.set('auth0_state', state, cookieOpts);
  cookies.set('auth0_redirect', redirectTo, cookieOpts);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'openid profile email offline_access',
    audience: AUTH0_AUDIENCE,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    screen_hint: screenHint
  });

  // Pour le login, on force explicitement l'écran de connexion
  // (évite qu'Auth0 propose "signup" par défaut si aucune session n'existe)
  if (screenHint === 'login') {
    params.set('prompt', 'login');
  }

  throw redirect(302, `${AUTH0_AUTHORIZE_URL}?${params.toString()}`);
}