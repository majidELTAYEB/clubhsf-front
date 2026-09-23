// import { api } from '$lib/services/api';
// import type {
// 	ConversationPageResponse,
// 	ConversationResponse,
// 	CreateConversationRequest,
// 	MessagePageResponse
// } from './types';

// // Même enveloppe potentielle { success, data } que sur les autres features
// // (voir profile/api.ts) : on la gère de la même façon.
// type Envelope<T> = { success: boolean; data: T };

// function isEnvelope<T>(value: unknown): value is Envelope<T> {
// 	return typeof value === 'object' && value !== null && 'data' in value;
// }

// async function unwrap<T>(promise: Promise<unknown>): Promise<T | undefined> {
// 	const res = await promise;
// 	if (res === undefined || res === null) return undefined;
// 	if (isEnvelope<T>(res)) return res.data;
// 	return res as T;
// }

// export function listConversations(before?: string) {
// 	const params = new URLSearchParams();
// 	if (before) params.set('before', before);
// 	const qs = params.toString();
// 	return unwrap<ConversationPageResponse>(
// 		api.get(`/conversations${qs ? `?${qs}` : ''}`)
// 	) as Promise<ConversationPageResponse>;
// }

// export function createConversation(payload: CreateConversationRequest) {
// 	return unwrap<ConversationResponse>(api.post('/conversations', payload)) as Promise<ConversationResponse>;
// }

// export function getConversationHistory(conversationId: string, before?: string) {
// 	const params = new URLSearchParams();
// 	if (before) params.set('before', before);
// 	const qs = params.toString();
// 	return unwrap<MessagePageResponse>(
// 		api.get(`/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`)
// 	) as Promise<MessagePageResponse>;
// }

// export function markConversationAsRead(conversationId: string) {
// 	return unwrap<void>(api.post(`/conversations/${conversationId}/read`, {}));
// }

import { api } from '$lib/services/api';
import type {
	ConversationPageResponse,
	ConversationResponse,
	CreateConversationRequest,
	MessagePageResponse
} from './types';

type Envelope<T> = { success: boolean; data: T };

function isEnvelope<T>(value: unknown): value is Envelope<T> {
	return typeof value === 'object' && value !== null && 'data' in value;
}

async function unwrap<T>(promise: Promise<unknown>): Promise<T | undefined> {
	const res = await promise;
	if (res === undefined || res === null) return undefined;
	if (isEnvelope<T>(res)) return res.data;
	return res as T;
}

export function listConversations(before?: string) {
	const params = new URLSearchParams();
	if (before) params.set('before', before);
	const qs = params.toString();
	return unwrap<ConversationPageResponse>(
		api.get(`/conversations${qs ? `?${qs}` : ''}`)
	) as Promise<ConversationPageResponse>;
}

export function createConversation(payload: CreateConversationRequest) {
	return unwrap<ConversationResponse>(api.post('/conversations', payload)) as Promise<ConversationResponse>;
}

export function getConversationHistory(conversationId: string, before?: string) {
	const params = new URLSearchParams();
	if (before) params.set('before', before);
	const qs = params.toString();
	return unwrap<MessagePageResponse>(
		api.get(`/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`)
	) as Promise<MessagePageResponse>;
}

// Le endpoint renvoie 204 (pas de corps) : on ignore volontairement le
// retour plutôt que de risquer un parse JSON sur un body vide.
export async function markConversationAsRead(conversationId: string): Promise<void> {
	try {
		await api.post(`/conversations/${conversationId}/read`, {});
	} catch {
		// best-effort : un échec de "marquer lu" ne doit jamais bloquer l'UI
	}
}

// Évite de spammer l'endpoint si plusieurs messages arrivent en rafale
// (chaque message entrant déclenchait un appel réseau immédiat) : on
// regroupe les appels rapprochés en un seul, 400ms après le dernier trigger.
const readDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function markConversationAsReadDebounced(conversationId: string, delayMs = 400) {
	const existing = readDebounceTimers.get(conversationId);
	if (existing) clearTimeout(existing);

	const timer = setTimeout(() => {
		readDebounceTimers.delete(conversationId);
		markConversationAsRead(conversationId);
	}, delayMs);

	readDebounceTimers.set(conversationId, timer);
}