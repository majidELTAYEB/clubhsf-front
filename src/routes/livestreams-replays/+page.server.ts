import type { PageServerLoad } from './$types';

type Live = {
	id: string;
	title: string;
	schedule_at: string;
	status: string;
	stream_key: string;
	rtmp_url: string;
	playback_id: string;
};

export const load: PageServerLoad = async ({ locals, fetch }) => {

    const res = await fetch(`/api/livestreams/replays`);

	if (!res.ok) {
		return { replays: [] as Live[] };
	}

	const lives: Live[] = await res.json();
	const replays = lives.filter((l) => l.status === 'ended');

	return { replays };
};