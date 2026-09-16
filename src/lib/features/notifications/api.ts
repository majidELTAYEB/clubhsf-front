import { api } from '$lib/services/api';
import type { ListNotificationsResponse } from './types';

// Le backend enveloppe toutes les réponses dans { success, data } (voir
// shared/response/response.go), et ton `request<T>()` ne déballe pas ça
// automatiquement — donc on type l'enveloppe ici et on retourne juste `.data`.
type ApiEnvelope<T> = {
	success: boolean;
	data: T;
};

// Les routes notifications sont montées sous /api/v1 côté Go
// (r.Mount("/notifications", ...) dans le groupe r.Route("/api/v1", ...)).
// À vérifier contre routes/api/[...path]/+server.ts si ça 404.
const BASE = '/notifications';

export async function listNotifications(
	cursor?: string,
	limit = 20
): Promise<ListNotificationsResponse> {
	const params = new URLSearchParams();
	if (cursor) params.set('cursor', cursor);
	params.set('limit', String(limit));

	const res = await api.get<ApiEnvelope<ListNotificationsResponse>>(`${BASE}?${params}`);
	return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
	await api.post<ApiEnvelope<null>>(`${BASE}/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
	await api.post<ApiEnvelope<null>>(`${BASE}/read-all`, {});
}