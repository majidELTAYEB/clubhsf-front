import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type CollectionDetails = {
	id: string;
	title: string;
	slug: string;
	description: string;
	cover_image_url: string | null;
	is_public: boolean;
	items: { video_id: string; position: number }[];
	created_at: string;
};

type VideoListItem = {
	video_id: string;
	position: number;
	added_at: string;
	title: string;
	description?: string;
	status: string;
	duration_seconds?: number;
	thumbnail_url?: string;
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const [collectionRes, videosRes] = await Promise.all([
		fetch(`/api/collections/${params.id}`),
		fetch(`/api/collections/${params.id}/videos`)
	]);

	if (collectionRes.status === 404) {
		throw error(404, 'Impossible de charger la collection');
	}
	if (!collectionRes.ok) {
		console.log(collectionRes);
		throw error(collectionRes.status, 'Impossible de charger la collection');
	}
	if (!videosRes.ok) {
		console.log(videosRes);
		throw error(videosRes.status, 'Impossible de charger les vidéos');
	}

	const collectionJson = await collectionRes.json();
	const videosJson = await videosRes.json();

	const collection: CollectionDetails = collectionJson.data;
	const rawVideos: VideoListItem[] = videosJson.data ?? [];

	// Une collection privée ne doit jamais être accessible ici,
	// même en devinant l'URL -> on la traite comme inexistante.
	if (!collection?.is_public) {
		throw error(404, 'Impossible de charger la collection');
	}

	// On ne garde que les vidéos prêtes, triées par leur position dans la collection.
	const readyVideos = rawVideos
		.filter((v) => v.status === 'ready')
		.sort((a, b) => a.position - b.position)
		.map((v) => ({
			ID: v.video_id,
			Title: v.title,
			Description: v.description ?? null,
			Position: v.position,
			DurationSeconds: v.duration_seconds ?? 0,
			ThumbnailURL: v.thumbnail_url ?? ''
		}));

	return {
		collection: {
			id: collection.id,
			title: collection.title,
			slug: collection.slug,
			description: collection.description,
			cover_image_url: collection.cover_image_url
		},
		videos: readyVideos
	};
};