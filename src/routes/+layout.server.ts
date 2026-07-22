import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Routes accessibles même sans être premium — la page de paiement elle-même,
// sa page de retour Stripe, et tout le flow d'auth (sinon on bloquerait le login).
const ALLOWED_WITHOUT_PREMIUM = ['/premium', '/auth', '/billing/cancel', '/billing/success'];

function isAllowed(pathname: string): boolean {
	return ALLOWED_WITHOUT_PREMIUM.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`)
	);
}

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const rawProfile = cookies.get('user_profile');
	const profile = rawProfile ? JSON.parse(rawProfile) : null;

	// Pas connecté : le layout auth existant s'en occupe déjà, on ne touche à rien ici.
	if (profile && !profile.is_premium && !isAllowed(url.pathname)) {
		throw redirect(303, '/premium');
	}

	return { user: profile };
};