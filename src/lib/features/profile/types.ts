// src/lib/features/profile/types.ts

export type Goal = {
	id: string;
	slug: string;
	label: string;
};

export type SocialLink = {
	platform: string;
	url: string;
};

export type Profile = {
	user_id: string;
	username: string;
	bio?: string | null;
	location?: string | null;
	website_url?: string | null;
	avatar_url?: string | null;
	cover_image_url?: string | null;
	social_links: SocialLink[];
	goals: Goal[];
	created_at: string;
};

export type PresignResponse = {
	upload_url: string;
	public_url: string;
};

export type UpdateProfilePayload = {
	username?: string;
	bio?: string | null;
	location?: string | null;
	website_url?: string | null;
	avatar_url?: string | null;
	cover_image_url?: string | null;
};