import { error} from '@sveltejs/kit';
import type { PageServerLoad } from '../../collections/$types';


export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/videos/${params.id}`);

	if (res.status === 404) {
		console.log(res)
		throw error(404, "impossible de charger la video");
	}
	if (!res.ok) {
		console.log(res)
		throw error(res.status, "Impossible de charger la video");
	}

	const videos = await res.json();
	return { videos };
};
