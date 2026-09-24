import { api } from '$lib/services/api';

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

export interface WsTokenResponse {
	token: string;
}

export function getWsToken() {
	return unwrap<WsTokenResponse>(api.get('/ws-token')) as Promise<WsTokenResponse>;
}