import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/livestreams/${params.id}`);

	if (res.status === 404) {
		throw error(404, 'Ce live n\'existe pas.');
	}
	if (!res.ok) {
		throw error(res.status, 'Impossible de charger le live.');
	}

	const live = await res.json();

	const chatRes = await fetch(`/api/telemetry/${params.id}/chat`);
	const chatHistory = chatRes.ok ? (await chatRes.json()).messages : [];
	return { live, chatHistory };
};