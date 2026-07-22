import type { Handle } from '@sveltejs/kit';
import { AUTH0_TOKEN_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } from '$lib/config/auth0.config';
import type { AuthUser, TokenSet, UserProfile } from '$lib/features/auth/types';

function decodeJwt<T>(token: string): T {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

async function refreshAccessToken(refreshToken: string): Promise<TokenSet | null> {
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
  return res.json();
}

const secureCookie = { path: '/', httpOnly: true, secure: true, sameSite: 'lax' as const };

export const handle: Handle = async ({ event, resolve }) => {
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

  // Routes accessibles sans être connecté
  const publicRoutes = ['/', '/auth/login', '/auth/callback', '/auth/logout', '/auth'];
  const isPublicRoute = publicRoutes.includes(event.url.pathname) || event.url.pathname.startsWith('/api/');

  if (!isPublicRoute && !event.locals.user) {
    return new Response(null, {
      status: 302,
      headers: { location: `/auth/login?redirectTo=${event.url.pathname}` }
    });
  }

  // 🔒 Routes accessibles même sans premium (page de paiement + tout ce qui doit rester visible)
  // 👉 AJUSTE "/premium" ci-dessous avec ta vraie route de paiement
  const premiumExemptRoutes = ['/premium'];
  const isPremiumExempt = isPublicRoute || premiumExemptRoutes.includes(event.url.pathname);
  const isAdmin = event.locals.user?.role === 'admin';

  if (!isPremiumExempt && event.locals.user && !event.locals.user.isPremium && !isAdmin) {
    return new Response(null, {
      status: 302,
      headers: { location: '/premium' }
    });
  }

  return resolve(event);
};