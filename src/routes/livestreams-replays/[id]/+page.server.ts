import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ params, locals, fetch }) => {

    const res = await fetch(`/api/livestreams/replays/${params.id}`);

	if (res.status === 404) {
		throw error(404, 'Replay introuvable');
	}
	if (!res.ok) {
		throw error(500, 'Impossible de charger ce replay');
	}

	const live = await res.json();
	return { live };
};