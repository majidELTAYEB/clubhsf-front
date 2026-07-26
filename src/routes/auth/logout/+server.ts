import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH0_LOGOUT_URL, AUTH0_CLIENT_ID, PUBLIC_APP_URL } from '$lib/config/auth0.config';

export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('id_token', { path: '/' });
  cookies.delete('refresh_token', { path: '/' });

  const params = new URLSearchParams({
    client_id: AUTH0_CLIENT_ID,
    returnTo: `${PUBLIC_APP_URL}/`
  });

  throw redirect(302, `${AUTH0_LOGOUT_URL}?${params.toString()}`);
};