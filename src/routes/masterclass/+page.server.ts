import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/collections');

	if (!res.ok) {
		console.log(res);
		throw error(res.status, 'Impossible de charger les collections');
	}

	const collections = await res.json();

	// Filet de sécurité : même si l'API est censée déjà filtrer,
	// on ne montre jamais une collection privée côté abonnés.
	const publicCollections = collections.data
		.filter((c: { is_public: boolean }) => c.is_public)
		.sort(
			(a: { created_at: string }, b: { created_at: string }) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);

	return { collections: publicCollections };
};