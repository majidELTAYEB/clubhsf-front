import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

const handle: RequestHandler = async ({ request, params, locals, url }) => {
  if (!locals.accessToken) return new Response('Non authentifié', { status: 401 });

  // 🔒 Blocage premium sur les endpoints sensibles (adapte la liste des préfixes à ton besoin)
  const premiumOnlyPrefixes = ['videos', 'masterclass', 'lives', 'collections'];
  const isPremiumOnly = premiumOnlyPrefixes.some((p) => params.path?.startsWith(p));

  if (isPremiumOnly && !locals.user?.hasFullAccess) {
    error(403, 'Abonnement premium requis');
  }

  const target = `${BACKEND_URL}/${params.path}${url.search}`;
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${locals.accessToken}`);
  headers.delete('host');

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  const res = await fetch(target, { method: request.method, headers, body });

  return new Response(res.body, { status: res.status, headers: res.headers });
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;