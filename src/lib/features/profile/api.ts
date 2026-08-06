// src/lib/features/profile/api.ts
import { api } from '$lib/services/api';
import type { Profile, Goal, PresignResponse, UpdateProfilePayload } from './types';

// Certains endpoints du domaine profil enveloppent leur réponse dans
// { success, data }, d'autres renvoient un corps vide (204) ou l'objet brut.
// `unwrap` gère les trois cas sans jamais planter, plutôt que de supposer
// une seule forme et devoir corriger endpoint par endpoint à chaque surprise.
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

export function getProfile() {
	return unwrap<Profile>(api.get('/profiles/me'));
}

export function getGoalsCatalog() {
	return unwrap<Goal[]>(api.get('/profiles/goals'));
}

export function updateProfile(payload: UpdateProfilePayload) {
	return unwrap<Profile>(api.patch('/profiles/me', payload));
}

export function updateGoals(goalIds: string[]) {
	return unwrap<Profile>(api.put('/profiles/me/goals', { goal_ids: goalIds }));
}

export function addSocialLink(platform: string, url: string) {
	return unwrap<Profile>(api.put('/profiles/me/social-links', { platform, url }));
}

export function removeSocialLink(platform: string) {
	return unwrap<void>(api.del(`/profiles/me/social-links/${platform}`));
}

export function presignImageUpload(kind: 'avatar' | 'cover', filename: string, contentType: string) {
	return unwrap<PresignResponse>(
		api.post(`/profiles/me/${kind}/presign`, {
			filename,
			content_type: contentType
		})
	) as Promise<PresignResponse>;
}