import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const collectionId = url.searchParams.get('collection');

	const res = await fetch(`/api/articles/slug/${params.slug}`);

	if (res.status === 404) {
		throw error(404, 'Impossible de charger l\'article');
	}
	if (!res.ok) {
		throw error(res.status, 'Impossible de charger l\'article');
	}

    const body = await res.json();

	const article = body.data

	let nextArticle = null;
	if (collectionId) {
		const collectionRes = await fetch(`/api/collections/${collectionId}/items`);

        
		if (collectionRes.ok) {
			const { data } = await collectionRes.json();
			const items = [...data].sort((a, b) => a.position - b.position);
			const slugx = items.findIndex((a) => a.article.slug === params.slug);
			nextArticle = slugx !== -1 && slugx < items.length - 1 ? items[slugx + 1] : null;
		}
	}

    console.log(nextArticle)

	return { article, nextArticle, collectionId };
};
