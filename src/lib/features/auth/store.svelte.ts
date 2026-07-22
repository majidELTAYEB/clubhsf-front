// src/lib/features/auth/store.svelte.ts
import type { AuthUser } from './types';

let user = $state<AuthUser | null>(null);

export const authState = {
	get isAuthenticated() {
		return user !== null;
	},
	get user() {
		return user;
	}
};

export function setUser(u: AuthUser | null) {
	user = u;
}