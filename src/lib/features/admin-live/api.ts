import { api } from '$lib/services/api';
import type { LiveResponse, ViewerCountResponse, ChatHistoryResponse } from './types';

export function getLiveAdmin(id : string) {
  return api.get<LiveResponse>(`/livestreams/${id}`);
}

export function getViewerCount(streamId: string) {
  return api.get<ViewerCountResponse>(`/telemetry/${streamId}/viewers`);
}

export function getHistoryChat(streamId: string) {
  return api.get<ChatHistoryResponse>(`/telemetry/${streamId}/chat`)
}