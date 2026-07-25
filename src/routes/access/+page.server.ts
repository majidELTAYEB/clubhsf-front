import type { PageServerLoad } from './$types';
import { env as publicEnv } from '$env/dynamic/public';

export interface LiveAccessResponse {
	liveStreamId: string;
	muxPlaybackId: string;
	userEmail: string;
	title: string;
	description: string;
	status: string;
	scheduleAt: string | null;
}

export const load: PageServerLoad = async ({ url, fetch }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return { error: 'missing_token' as const, grant: null };
	}

	const res = await fetch(`${publicEnv.PUBLIC_API_BASE_URL}/live/access?token=${encodeURIComponent(token)}`);

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		return {
			error: (body?.code ?? 'unknown_error') as string,
			grant: null,
			token
		};
	}

	const grant: LiveAccessResponse = await res.json();
	return { error: null, grant, token };
};