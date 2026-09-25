import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [res, resReplays] = await Promise.all([
		fetch('/api/livestreams'),
		fetch('/api/livestreams/replays')
	]);

	if (!res.ok) {
		throw error(res.status, 'Impossible de charger les lives');
	}
	if (!resReplays.ok) {
		throw error(resReplays.status, 'Impossible de charger les replays');
	}

	const [lives, replays] = await Promise.all([res.json(), resReplays.json()]);

	return { lives, replays };
};