import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		userProfile: locals.userProfile ?? null,
		sidebarOpen: locals.sidebarOpen ?? true,
		isMobileGuess: locals.isMobileGuess ?? false
	};
};