import { api } from '$lib/services/api';
import type { ViewerCountResponse } from "./types";

export function getViewerCount(streamId: string) {
  return api.get<ViewerCountResponse>(`/telemetry/${streamId}/viewers`);
}