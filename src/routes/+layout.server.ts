import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const ALLOWED_WITHOUT_PREMIUM = ['/premium', '/auth', '/billing/cancel', '/billing/success'];

function isAllowed(pathname: string): boolean {
	return ALLOWED_WITHOUT_PREMIUM.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`)
	);
}

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// `locals.user` est déjà peuplé par hooks.server.ts (décodage id_token +
	// fusion avec le cookie user_profile) — on ne relit plus le cookie ici
	// en double, une seule source de vérité.
	if (locals.user && !locals.user.isPremium && !isAllowed(url.pathname)) {
		throw redirect(303, '/premium');
	}

	return {
		user: locals.user,
		sidebarOpen: locals.sidebarOpen ?? true, // si tu as branché le fix du flash sidebar
		isMobileGuess: locals.isMobileGuess ?? false
	};
};