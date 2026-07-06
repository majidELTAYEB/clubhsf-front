import { api } from '$lib/services/api';
import type { AuthUser } from './types';

export function getMe() {
  return api.get<AuthUser>('/me');
}