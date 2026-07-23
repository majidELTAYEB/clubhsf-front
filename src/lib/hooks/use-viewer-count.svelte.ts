import { getViewerCount } from "$lib/features/live/api";


export function useViewerCount(streamId: string) {
	let count = $state(0);
	let interval: ReturnType<typeof setInterval>;


	async function start(intervalMs = 10000) {
		const data = await getViewerCount(streamId);
    	count = data.viewers ?? 0;

    // 2. Configuration de l'intervalle avec une fonction fléchée (arrow function)
    interval = setInterval(async () => {
        const newData = await getViewerCount(streamId);
        count = newData.viewers ?? 0;
    }, intervalMs);
	}

	function stop() {
		clearInterval(interval);
	}

	return {
		get count() {
			return count;
		},
		start,
		stop
	};
}