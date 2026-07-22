import type { Handle } from '@sveltejs/kit';
import { AUTH0_TOKEN_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } from '$lib/config/auth0.config';
import type { AuthUser, TokenSet, UserProfile } from '$lib/features/auth/types';

function decodeJwt<T>(token: string): T {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

// Dédoublonne les rafraîchissements simultanés : si plusieurs requêtes arrivent
// en même temps avec un access_token expiré, une seule vraie requête part vers
// Auth0, les autres attendent son résultat. Évite l'échec en cascade si Auth0
// fait tourner les refresh tokens (le 2e appel simultané invaliderait le 1er).
const refreshInFlight = new Map<string, Promise<TokenSet | null>>();

async function refreshAccessToken(refreshToken: string): Promise<TokenSet | null> {
  const existing = refreshInFlight.get(refreshToken);
  if (existing) return existing;

  const promise = (async () => {
    try {
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
      if (!res.ok) return null;
      return (await res.json()) as TokenSet;
    } catch (err) {
      console.error('Auth0 token refresh failed:', err);
      return null;
    } finally {
      refreshInFlight.delete(refreshToken);
    }
  })();

  refreshInFlight.set(refreshToken, promise);
  return promise;
}

// Préfixes qu'on laisse passer sans toucher aux cookies/tokens — évite de décoder
// du JWT et potentiellement d'appeler Auth0 à chaque chargement de fichier statique.
const BYPASS_PREFIXES = ['/_app/', '/favicon', '/robots.txt', '/sitemap.xml'];

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return resolve(event);
  }

  const isSecureContext = event.url.protocol === 'https:';
  const secureCookie = { path: '/', httpOnly: true, secure: isSecureContext, sameSite: 'lax' as const };

  let accessToken = event.cookies.get('access_token');
  const refreshToken = event.cookies.get('refresh_token');
  let user: AuthUser | null = null;

  if (!accessToken && refreshToken) {
    const tokens = await refreshAccessToken(refreshToken);

    if (tokens) {
      accessToken = tokens.access_token;
      event.cookies.set('access_token', tokens.access_token, { ...secureCookie, maxAge: tokens.expires_in });

      if (tokens.id_token) {
        event.cookies.set('id_token', tokens.id_token, { ...secureCookie, maxAge: tokens.expires_in });
      }

      if (tokens.refresh_token) {
        event.cookies.set('refresh_token', tokens.refresh_token, { ...secureCookie, maxAge: 60 * 60 * 24 * 30 });
      }
    } else {
      event.cookies.delete('access_token', { path: '/' });
      event.cookies.delete('id_token', { path: '/' });
      event.cookies.delete('refresh_token', { path: '/' });
    }
  }

  const currentIdToken = event.cookies.get('id_token');
  if (currentIdToken) {
    try {
      user = decodeJwt<AuthUser>(currentIdToken);
    } catch {
      user = null;
    }
  }

  const profileCookie = event.cookies.get('user_profile');
  if (user && profileCookie) {
    try {
      const profile: UserProfile = JSON.parse(profileCookie);
      user = {
        ...user,
        role: profile.role,
        isPremium: profile.is_premium
      };
    } catch {
      // cookie corrompu, on ignore silencieusement
    }
  }

  event.locals.user = user;
  event.locals.accessToken = accessToken ?? null;

  const publicRoutePrefixes = ['/', '/auth'];
  const isPublicRoute =
    publicRoutePrefixes.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p))) ||
    pathname.startsWith('/api/');

  if (!isPublicRoute && !event.locals.user) {
    const redirectTarget = encodeURIComponent(pathname + event.url.search);
    return new Response(null, {
      status: 302,
      headers: { location: `/auth/login?redirectTo=${redirectTarget}` }
    });
  }

  const premiumExemptPrefixes = ['/premium', '/auth', '/billing/success', '/billing/cancel'];
  const isPremiumExempt = isPublicRoute || premiumExemptPrefixes.some((p) => pathname.startsWith(p));
  const isAdmin = event.locals.user?.role === 'admin';

  if (!isPremiumExempt && event.locals.user && !event.locals.user.isPremium && !isAdmin) {
    return new Response(null, {
      status: 302,
      headers: { location: '/premium' }
    });
  }

  return resolve(event);
};