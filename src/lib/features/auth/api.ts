import { api } from '$lib/services/api';
import type { AuthUser, ChatHistoryResponse } from './types';

export function getMe() {
  return api.get<AuthUser>('/me');
}

export function getHistoryChat(streamId: string) {
  return api.get<ChatHistoryResponse>(`/telemetry/${streamId}/chat`)
}