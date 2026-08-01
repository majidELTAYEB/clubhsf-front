import { error} from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ fetch }) => {
    const res = await fetch(`/api/livestreams`);

    if (res.status === 404) {
        throw error(404, "impossible de charger les lives");
    }
    if (!res.ok) {
        throw error(res.status, "Impossible de charger les lives");
    }

    const lives = await res.json();
    return { lives };
};
