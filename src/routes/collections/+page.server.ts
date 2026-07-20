import { error} from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`/api/collections`);

	if (res.status === 404) {
		console.log(res)
		throw error(404, "impossible de charger les collections");
	}
	if (!res.ok) {
		console.log(res)
		throw error(res.status, "Impossible de charger les collections");
	}

	const collections = await res.json();
	return { collections };
};
