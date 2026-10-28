<!-- src/lib/components/live-upcoming.svelte
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
</div> -->


<!-- src/lib/components/live-upcoming.svelte -->
<script lang="ts">
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

<div class="upcoming">
	<div class="upcoming__media">
		<img class="upcoming__img" src={coverSrc} alt="Cover du live {title}" />

		<div class="upcoming__overlay">
			<span class="upcoming__badge">
				<ClockIcon size={14} strokeWidth={2} />
				{timeUntil(scheduleAt)}
			</span>
			<p class="upcoming__title">{title}</p>
			<p class="upcoming__date">{formattedDate(scheduleAt)}</p>
		</div>
	</div>

	<p class="upcoming__note">
		Le live n'a pas encore commencé. La page se mettra à jour automatiquement au démarrage.
	</p>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Pas de bordure extérieure : le cadre est porté par .stage de la page */
	.upcoming {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		display: flex;
		flex-direction: column;
		height: 100%;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}

	.upcoming__media {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: #100f0d;
		border-bottom: 1px solid var(--rule);
	}

	.upcoming__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.03) brightness(0.75);
	}

	.upcoming__overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		text-align: center;
	}

	/* Badge carré blanc à bordure noire, comme sur les cartes */
	.upcoming__badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0.65rem;
		background: #fff;
		color: #000;
		border: 1px solid #000;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.upcoming__title {
		max-width: 22ch;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.5rem, 4vw, 2.75rem);
		line-height: 1;
		letter-spacing: -0.04em;
		text-wrap: balance;
	}

	.upcoming__date {
		font-size: 0.95rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		text-transform: capitalize;
	}

	.upcoming__note {
		padding: 1rem 1.25rem;
		background: var(--bg);
		color: var(--muted);
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.5;
	}
</style>