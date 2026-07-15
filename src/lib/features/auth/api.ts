import { api } from '$lib/services/api';
import type { AuthUser, ViewerCountResponse, ChatHistoryResponse } from './types';

export function getMe() {
  return api.get<AuthUser>('/me');
}

export function getViewerCount(streamId: string) {
  return api.get<ViewerCountResponse>(`/telemetry/${streamId}/viewers`);
}

export function getHistoryChat(streamId: string) {
  return api.get<ChatHistoryResponse>(`/telemetry/${streamId}/chat`)
}