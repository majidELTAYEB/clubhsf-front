import type { RequestHandler } from './$types';
import { startAuth0Flow } from '$lib/features/auth/startAuth0Flow';

export const GET: RequestHandler = async ({ cookies, url }) => {
  return startAuth0Flow(url, cookies, 'signup');
};