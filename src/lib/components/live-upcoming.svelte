<!-- src/lib/components/live-upcoming.svelte -->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import ClockIcon from '@lucide/svelte/icons/clock';

	let {
		title,
		coverSrc,
		scheduleAt
	}: {
		title: string;
		coverSrc: string;
		scheduleAt: string;
	} = $props();

	function formattedDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function timeUntil(dateStr: string): string {
		const diffMs = new Date(dateStr).getTime() - Date.now();
		if (diffMs <= 0) return 'bientôt';

		const minutes = Math.floor(diffMs / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `dans ${days} j`;
		if (hours > 0) return `dans ${hours} h`;
		return `dans ${minutes} min`;
	}
</script>

<div class="space-y-4">
	<div class="border-border relative overflow-hidden rounded-xl border">
		<AspectRatio ratio={16 / 9}>
			<img src={coverSrc} alt="Cover du live {title}" class="h-full w-full object-cover grayscale" />
		</AspectRatio>

		<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
			<Badge variant="secondary" class="gap-1.5">
				<ClockIcon class="size-3.5" />
				{timeUntil(scheduleAt)}
			</Badge>
			<p class="text-lg font-medium text-white">{title}</p>
			<p class="text-sm text-white/80">{formattedDate(scheduleAt)}</p>
		</div>
	</div>

	<p class="text-muted-foreground text-center text-sm">
		Le live n'a pas encore commencé. La page se mettra à jour automatiquement au démarrage.
	</p>
</div>