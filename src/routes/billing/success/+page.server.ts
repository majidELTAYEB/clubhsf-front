import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';
const secureCookie = { path: '/', httpOnly: true, secure: true, sameSite: 'lax' as const };

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (!locals.accessToken) {
		redirect(302, '/auth/login');
	}

	const res = await fetch(`${BACKEND_URL}/billing/status`, {
		headers: { Authorization: `Bearer ${locals.accessToken}` }
	});

	if (res.ok) {
		const { is_premium } = await res.json();
		const existing = cookies.get('user_profile');
		const profile = existing ? JSON.parse(existing) : {};
		cookies.set('user_profile', JSON.stringify({ ...profile, is_premium }), {
			...secureCookie,
			maxAge: 60 * 60 * 24 * 30
		});
	}

	redirect(302, '/home');
};