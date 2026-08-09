// src/lib/features/posts/api.ts
import { api } from '$lib/services/api';
import type {
	Post,
	Comment,
	FeedResponse,
	CommentsResponse,
	CreatePostPayload,
	CreateCommentPayload,
	PresignResponse
} from './types';

// Même enveloppe { success, data } que le domaine profil, avec les mêmes
// cas limites (corps vide sur les 204) — même fonction tolérante.
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

const BASE = '/posts';

export function getFeed(cursor?: string) {
	const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
	return unwrap<FeedResponse>(api.get(`${BASE}${query}`)) as Promise<FeedResponse>;
}

export function createPost(payload: CreatePostPayload) {
	return unwrap<Post>(api.post(BASE, payload)) as Promise<Post>;
}

export function getPost(id: string) {
	return unwrap<Post>(api.get(`${BASE}/${id}`)) as Promise<Post>;
}

export function updatePost(id: string, payload: CreatePostPayload) {
	return unwrap<Post>(api.patch(`${BASE}/${id}`, payload)) as Promise<Post>;
}

export function deletePost(id: string) {
	return unwrap<void>(api.del(`${BASE}/${id}`));
}

export function likePost(id: string) {
	return unwrap<void>(api.post(`${BASE}/${id}/like`, {}));
}

export function unlikePost(id: string) {
	return unwrap<void>(api.del(`${BASE}/${id}/like`));
}

export function getComments(postId: string, cursor?: string) {
	const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
	return unwrap<CommentsResponse>(api.get(`${BASE}/${postId}/comments${query}`)) as Promise<CommentsResponse>;
}

export function createComment(postId: string, payload: CreateCommentPayload) {
	return unwrap<Comment>(api.post(`${BASE}/${postId}/comments`, payload)) as Promise<Comment>;
}

export function updateComment(postId: string, commentId: string, content: string) {
	return unwrap<Comment>(api.patch(`${BASE}/${postId}/comments/${commentId}`, { content })) as Promise<Comment>;
}

export function deleteComment(postId: string, commentId: string) {
	return unwrap<void>(api.del(`${BASE}/${postId}/comments/${commentId}`));
}

export function presignPostImage(filename: string, contentType: string) {
	return unwrap<PresignResponse>(
		api.post(`${BASE}/images/presign`, { filename, content_type: contentType })
	) as Promise<PresignResponse>;
}