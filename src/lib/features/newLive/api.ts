import { api } from '$lib/services/api';
import type { LiveRequest, LiveResponse } from './types';

export function newLive(body : LiveRequest) {
  return api.post<LiveResponse>('/livestreams', body);
}