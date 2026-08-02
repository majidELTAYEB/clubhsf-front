import { error} from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const collectionId = url.searchParams.get('collection');

	const res = await fetch(`/api/videos/${params.id}`);

	if (res.status === 404) {
		throw error(404, "impossible de charger la video");
	}
	if (!res.ok) {
		throw error(res.status, "Impossible de charger la video");
	}

	const video = await res.json();


	let nextVideo = null;
	if (collectionId) {
		const collectionRes = await fetch(`/api/collections/${collectionId}/items`);
		if (collectionRes.ok) {
    const { data } = await collectionRes.json();
    const items = [...data]
        .filter((item) => item.item_type === 'video')
        .sort((a, b) => a.position - b.position);
    const idx = items.findIndex((v) => v.video.video_id === params.id);
    nextVideo = idx !== -1 && idx < items.length - 1 ? items[idx + 1] : null;
}

	}


	return { video, nextVideo, collectionId };
};
