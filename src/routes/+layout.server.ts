// import type { LayoutServerLoad } from './$types';

// export const load: LayoutServerLoad = async ({ locals }) => {
// 	return {
// 		user: locals.user,
// 		userProfile: locals.userProfile ?? null,
// 		sidebarOpen: locals.sidebarOpen ?? true,
// 		isMobileGuess: locals.isMobileGuess ?? false
// 	};
// };

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Même liste que PREMIUM_EXEMPT_PREFIXES dans hooks.server.ts (+ /access et /api, publics).
const PREMIUM_EXEMPT_PREFIXES = [
	'/premium',
	'/auth',
	'/access',
	'/api',
	'/billing/success',
	'/billing/cancel',
	'/masterclass',
	'/video',
	'/article'
];

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { pathname } = url;
	const isExempt =
		pathname === '/' || PREMIUM_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));

	// Garde premium aussi appliqué aux navigations côté client
	// (le handle ne tourne pas sur un goto() sans rechargement complet).
	if (!isExempt && locals.user && !locals.user.hasFullAccess) {
		throw redirect(302, '/premium');
	}

	return {
		user: locals.user,
		userProfile: locals.userProfile ?? null,
		sidebarOpen: locals.sidebarOpen ?? true,
		isMobileGuess: locals.isMobileGuess ?? false
	};
};