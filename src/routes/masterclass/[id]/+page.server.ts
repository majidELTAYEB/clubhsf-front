

// import { error } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';

// type CollectionDetails = {
// 	id: string;
// 	title: string;
// 	slug: string;
// 	description: string;
// 	cover_image_url: string | null;
// 	is_public: boolean;
// 	items: { item_type: string; item_id: string; position: number }[];
// 	created_at: string;
// };

// type CollectionItemVideo = {
// 	video_id: string;
// 	title: string;
// 	description?: string;
// 	status: string;
// 	duration_seconds?: number;
// 	thumbnail_url?: string;
// };

// type CollectionItemArticle = {
// 	article_id: string;
// 	title: string;
// 	slug: string;
// 	excerpt?: string;
// 	cover_image_url?: string;
// };

// type CollectionItemDetail = {
// 	item_type: 'video' | 'article';
// 	position: number;
// 	added_at: string;
// 	video?: CollectionItemVideo;
// 	article?: CollectionItemArticle;
// };

// export const load: PageServerLoad = async ({ fetch, params }) => {
// 	const [collectionRes, itemsRes] = await Promise.all([
// 		fetch(`/api/collections/${params.id}`),
// 		fetch(`/api/collections/${params.id}/items`)
// 	]);

// 	if (collectionRes.status === 404) {
// 		throw error(404, 'Impossible de charger la collection');
// 	}
// 	if (!collectionRes.ok) {
// 		throw error(collectionRes.status, 'Impossible de charger la collection');
// 	}
// 	if (!itemsRes.ok) {
// 		throw error(itemsRes.status, 'Impossible de charger les items');
// 	}

// 	const collectionJson = await collectionRes.json();
// 	const itemsJson = await itemsRes.json();

// 	const collection: CollectionDetails = collectionJson.data;
// 	const rawItems: CollectionItemDetail[] = itemsJson.data ?? [];

// 	// Une collection privée ne doit jamais être accessible ici,
// 	// même en devinant l'URL -> on la traite comme inexistante.
// 	if (!collection?.is_public) {
// 		throw error(404, 'Impossible de charger la collection');
// 	}

// 	// On ne garde que les vidéos prêtes, triées par leur position dans la collection.
// 	const readyVideos = rawItems
// 		.filter((item) => item.item_type === 'video' && item.video?.status === 'ready')
// 		.sort((a, b) => a.position - b.position)
// 		.map((item) => ({
// 			ID: item.video!.video_id,
// 			Title: item.video!.title,
// 			Description: item.video!.description ?? null,
// 			Position: item.position,
// 			DurationSeconds: item.video!.duration_seconds ?? 0,
// 			ThumbnailURL: item.video!.thumbnail_url ?? ''
// 		}));

// 	// Articles publics de la collection, même logique de tri par position.
// 	const articles = rawItems
// 		.filter((item) => item.item_type === 'article')
// 		.sort((a, b) => a.position - b.position)
// 		.map((item) => ({
// 			ID: item.article!.article_id,
// 			Title: item.article!.title,
// 			Slug: item.article!.slug,
// 			Excerpt: item.article!.excerpt ?? null,
// 			CoverImageURL: item.article!.cover_image_url ?? null,
// 			Position: item.position
// 		}));


// 	return {
// 		collection: {
// 			id: collection.id,
// 			title: collection.title,
// 			slug: collection.slug,
// 			description: collection.description,
// 			cover_image_url: collection.cover_image_url
// 		},
// 		videos: readyVideos,
// 		articles
// 	};
// };

import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8080';

type CollectionDetails = {
	id: string;
	title: string;
	slug: string;
	description: string;
	cover_image_url: string | null;
	is_public: boolean;
	access_type: 'included' | 'paid';
	price_cents?: number | null;
	currency: string;
	accessible: boolean;
	owned: boolean;
	item_count: number;
};

type CollectionItemVideo = {
	video_id: string;
	title: string;
	description?: string;
	status: string;
	duration_seconds?: number;
	thumbnail_url?: string;
};

type CollectionItemArticle = {
	article_id: string;
	title: string;
	slug: string;
	excerpt?: string;
	cover_image_url?: string;
};

type CollectionItemDetail = {
	item_type: 'video' | 'article';
	position: number;
	added_at: string;
	video?: CollectionItemVideo;
	article?: CollectionItemArticle;
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const collectionRes = await fetch(`/api/collections/${params.id}`);

	if (collectionRes.status === 404) throw error(404, 'Impossible de charger la collection');
	if (!collectionRes.ok) throw error(collectionRes.status, 'Impossible de charger la collection');

	const collection: CollectionDetails = (await collectionRes.json()).data;

	if (!collection?.is_public) throw error(404, 'Impossible de charger la collection');

	const header = {
		id: collection.id,
		title: collection.title,
		slug: collection.slug,
		description: collection.description,
		cover_image_url: collection.cover_image_url,
		access_type: collection.access_type,
		price_cents: collection.price_cents ?? null,
		currency: collection.currency,
		accessible: collection.accessible,
		owned: collection.owned,
		item_count: collection.item_count
	};

	// Collection verrouillée : pas d'appel à /items (403 COLLECTION_LOCKED)
	if (!collection.accessible) {
		return { collection: header, videos: [], articles: [] };
	}

	const itemsRes = await fetch(`/api/collections/${params.id}/items`);
	if (!itemsRes.ok) throw error(itemsRes.status, 'Impossible de charger les items');

	const rawItems: CollectionItemDetail[] = (await itemsRes.json()).data ?? [];

	const readyVideos = rawItems
		.filter((item) => item.item_type === 'video' && item.video?.status === 'ready')
		.sort((a, b) => a.position - b.position)
		.map((item) => ({
			ID: item.video!.video_id,
			Title: item.video!.title,
			Description: item.video!.description ?? null,
			Position: item.position,
			DurationSeconds: item.video!.duration_seconds ?? 0,
			ThumbnailURL: item.video!.thumbnail_url ?? ''
		}));

	const articles = rawItems
		.filter((item) => item.item_type === 'article')
		.sort((a, b) => a.position - b.position)
		.map((item) => ({
			ID: item.article!.article_id,
			Title: item.article!.title,
			Slug: item.article!.slug,
			Excerpt: item.article!.excerpt ?? null,
			CoverImageURL: item.article!.cover_image_url ?? null,
			Position: item.position
		}));

	return { collection: header, videos: readyVideos, articles };
};

export const actions: Actions = {
	buy: async ({ locals, request, fetch }) => {
		if (!locals.accessToken) return fail(401, { error: 'Non authentifié' });

		const form = await request.formData();
		const collectionId = form.get('collection_id');
		if (typeof collectionId !== 'string' || !collectionId) {
			return fail(400, { error: 'Collection invalide' });
		}

		const res = await fetch(`${BACKEND_URL}/purchases/collections/${collectionId}/checkout`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${locals.accessToken}` }
		});

		if (!res.ok) {
			const body = await res.json().catch(() => null);
			const code = body?.error?.code;
			if (code === 'ALREADY_PURCHASED')
				return fail(409, { error: 'Tu as déjà acheté cette masterclass.' });
			if (code === 'ALREADY_INCLUDED')
				return fail(409, { error: 'Cette masterclass est incluse dans ton abonnement.' });
			return fail(500, { error: 'Impossible de créer la session de paiement' });
		}

		const body = await res.json();
		const url = body?.data?.url ?? body?.url ?? null;
		return url ? { checkout_url: url as string } : fail(500, { error: 'Réponse invalide' });
	}
};