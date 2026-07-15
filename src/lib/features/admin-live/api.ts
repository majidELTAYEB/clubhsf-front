import { api } from '$lib/services/api';
import type { LiveResponse } from './types';

export function getLiveAdmin(id : string) {
  return api.get<LiveResponse>(`/livestreams/${id}`);
}