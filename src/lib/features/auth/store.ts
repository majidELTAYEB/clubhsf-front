import { writable, derived } from 'svelte/store';
import type { AuthUser } from './types';

export const user = writable<AuthUser | null>(null);

export const authState = derived(user, ($user) => ({
  isAuthenticated: $user !== null,
  user: $user
}));

export function setUser(u: AuthUser | null) {
  user.set(u);
}