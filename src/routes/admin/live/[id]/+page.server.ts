import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const res = await fetch(`/api/livestreams/${params.id}`);

	if (res.status === 404) {
		throw error(404, 'Live introuvable');
	}
	if (!res.ok) {
		throw error(res.status, "Impossible de charger le live");
	}

	const live = await res.json();
	return { live, wsToken: locals.accessToken };
};