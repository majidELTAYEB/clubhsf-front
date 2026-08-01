import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type Article = {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	// Document JSON Tiptap (editor.getJSON()) — { type: 'doc', content: [...] }
	content: Record<string, unknown>;
	is_public: boolean;
	created_at: string;
	updated_at: string;
};

type ApiResponse = {
	success: boolean;
	data: Article;
};

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/articles/slug/${params.slug}`);

	if (res.status === 404) {
		throw error(404, 'Article introuvable');
	}
	if (!res.ok) {
		throw error(500, "Impossible de charger l'article");
	}

	const body: ApiResponse = await res.json();

	if (!body.success) {
		throw error(500, "Impossible de charger l'article");
	}

	return { article: body.data };
};