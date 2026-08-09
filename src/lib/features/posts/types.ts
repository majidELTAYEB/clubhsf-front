// src/lib/features/posts/types.ts

export type Author = {
	id: string;
	username: string;
	avatar_url?: string;
};

export type Post = {
	id: string;
	author: Author;
	title: string;
	content: string;
	cover_image_url?: string;
	likes_count: number;
	comments_count: number;
	liked_by_me: boolean;
	can_edit: boolean;
	created_at: string;
	updated_at: string;
};

export type Comment = {
	id: string;
	author: Author;
	content: string;
	depth: number;
	can_edit: boolean;
	created_at: string;
	updated_at: string;
	replies: Comment[];
};

export type FeedResponse = {
	posts: Post[];
	next_cursor?: string;
};

export type CommentsResponse = {
	comments: Comment[];
	next_cursor?: string;
};

export type CreatePostPayload = {
	title: string;
	content: string;
	cover_image_url?: string | null;
};

export type CreateCommentPayload = {
	content: string;
	parent_id?: string;
};

export type PresignResponse = {
	upload_url: string;
	public_url: string;
};

// Codes d'erreur documentés, utile pour matcher côté UI plutôt que de
// parser le message texte (qui peut changer sans prévenir).
export type ApiErrorCode =
	| 'POST_NOT_FOUND'
	| 'POST_INVALID_INPUT'
	| 'POST_CONTENT_HTML_NOT_ALLOWED'
	| 'POST_RATE_LIMITED'
	| 'POST_FORBIDDEN'
	| 'POST_ALREADY_LIKED'
	| 'POST_NOT_LIKED'
	| 'COMMENT_TOO_DEEP'
	| 'COMMENT_NOT_FOUND'
	| 'PREMIUM_REQUIRED';