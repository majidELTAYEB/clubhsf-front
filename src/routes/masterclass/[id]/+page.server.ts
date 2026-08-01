// import { error } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';

// type CollectionDetails = {
// 	id: string;
// 	title: string;
// 	slug: string;
// 	description: string;
// 	cover_image_url: string | null;
// 	is_public: boolean;
// 	items: { video_id: string; position: number }[];
// 	created_at: string;
// };

// type VideoListItem = {
// 	video_id: string;
// 	position: number;
// 	added_at: string;
// 	title: string;
// 	description?: string;
// 	status: string;
// 	duration_seconds?: number;
// 	thumbnail_url?: string;
// };

// export const load: PageServerLoad = async ({ fetch, params }) => {
// 	const [collectionRes, videosRes] = await Promise.all([
// 		fetch(`/api/collections/${params.id}`),
// 		fetch(`/api/collections/${params.id}/videos`)
// 	]);

// 	if (collectionRes.status === 404) {
// 		throw error(404, 'Impossible de charger la collection');
// 	}
// 	if (!collectionRes.ok) {
// 		console.log(collectionRes);
// 		throw error(collectionRes.status, 'Impossible de charger la collection');
// 	}
// 	if (!videosRes.ok) {
// 		console.log(videosRes);
// 		throw error(videosRes.status, 'Impossible de charger les vidéos');
// 	}

// 	const collectionJson = await collectionRes.json();
// 	const videosJson = await videosRes.json();

// 	const collection: CollectionDetails = collectionJson.data;
// 	const rawVideos: VideoListItem[] = videosJson.data ?? [];

// 	// Une collection privée ne doit jamais être accessible ici,
// 	// même en devinant l'URL -> on la traite comme inexistante.
// 	if (!collection?.is_public) {
// 		throw error(404, 'Impossible de charger la collection');
// 	}

// 	// On ne garde que les vidéos prêtes, triées par leur position dans la collection.
// 	const readyVideos = rawVideos
// 		.filter((v) => v.status === 'ready')
// 		.sort((a, b) => a.position - b.position)
// 		.map((v) => ({
// 			ID: v.video_id,
// 			Title: v.title,
// 			Description: v.description ?? null,
// 			Position: v.position,
// 			DurationSeconds: v.duration_seconds ?? 0,
// 			ThumbnailURL: v.thumbnail_url ?? ''
// 		}));

// 	return {
// 		collection: {
// 			id: collection.id,
// 			title: collection.title,
// 			slug: collection.slug,
// 			description: collection.description,
// 			cover_image_url: collection.cover_image_url
// 		},
// 		videos: readyVideos
// 	};
// };

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type CollectionDetails = {
	id: string;
	title: string;
	slug: string;
	description: string;
	cover_image_url: string | null;
	is_public: boolean;
	items: { item_type: string; item_id: string; position: number }[];
	created_at: string;
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
	const [collectionRes, itemsRes] = await Promise.all([
		fetch(`/api/collections/${params.id}`),
		fetch(`/api/collections/${params.id}/items`)
	]);

	if (collectionRes.status === 404) {
		throw error(404, 'Impossible de charger la collection');
	}
	if (!collectionRes.ok) {
		throw error(collectionRes.status, 'Impossible de charger la collection');
	}
	if (!itemsRes.ok) {
		throw error(itemsRes.status, 'Impossible de charger les items');
	}

	const collectionJson = await collectionRes.json();
	const itemsJson = await itemsRes.json();

	const collection: CollectionDetails = collectionJson.data;
	const rawItems: CollectionItemDetail[] = itemsJson.data ?? [];

	// Une collection privée ne doit jamais être accessible ici,
	// même en devinant l'URL -> on la traite comme inexistante.
	if (!collection?.is_public) {
		throw error(404, 'Impossible de charger la collection');
	}

	// On ne garde que les vidéos prêtes, triées par leur position dans la collection.
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

	// Articles publics de la collection, même logique de tri par position.
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


	return {
		collection: {
			id: collection.id,
			title: collection.title,
			slug: collection.slug,
			description: collection.description,
			cover_image_url: collection.cover_image_url
		},
		videos: readyVideos,
		articles
	};
};