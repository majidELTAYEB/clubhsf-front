import { error} from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/collections/${params.slug}`);

	if (res.status === 404) {
		console.log(res)
		throw error(404, "impossible de charger les videos collections");
	}
	if (!res.ok) {
		console.log(res)
		throw error(res.status, "Impossible de charger les collections");
	}

	const collections = await res.json();
	return { collections };
};
