import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
	if (!locals.accessToken) {
		redirect(302, '/auth/login');
	}

	const res = await fetch(`${BACKEND_URL}/billing/status`, {
		headers: { Authorization: `Bearer ${locals.accessToken}` }
	});


	let isPremium = false;


	if (res.ok) {
		const body = await res.json();
		isPremium = body.is_premium;


		const existing = cookies.get('user_profile');
		const profile = existing ? JSON.parse(existing) : {};
		const isSecureContext = url.protocol === 'https:';

		cookies.set('user_profile', JSON.stringify({ ...profile, is_premium: isPremium }), {
			path: '/',
			httpOnly: true,
			secure: isSecureContext,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
	}

	if (isPremium) {
		redirect(302, '/masterclass');
	}

	return { isPremium };
};