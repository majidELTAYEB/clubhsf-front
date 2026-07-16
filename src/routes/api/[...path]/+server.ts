import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8081';

const handle: RequestHandler = async ({ request, params, locals, url }) => {
  if (!locals.accessToken) return new Response('Non authentifié', { status: 401 });

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