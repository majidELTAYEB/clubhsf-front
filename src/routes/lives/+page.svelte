

<script lang="ts">
	import type { PageData } from './$types';
	import LiveCard from '$lib/components/live-card.svelte';
	import NotificationPrompt from '$lib/components/NotificationPrompt.svelte';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';
	import PlayIcon from '@lucide/svelte/icons/play';

	let { data }: { data: PageData } = $props();
	let lives = $derived(data.lives);
	let replays = $derived(data.replays);

	let liveLives = $derived(lives.filter((l) => l.status === 'active' || l.status === 'disconnected'));
	let upcomingLives = $derived(
		lives
			.filter((l) => l.status === 'scheduled')
			.sort((a, b) => new Date(a.schedule_at).getTime() - new Date(b.schedule_at).getTime())
	);

	// Le prochain live à venir (le plus proche dans le temps)
	let nextLive = $derived(upcomingLives[0] ?? null);

	// Si aucun live n'est en cours mais qu'il y en a un à venir, on ouvre direct
	// l'onglet "À venir" plutôt que de montrer une impasse vide.
	let activeTab = $state<'live' | 'upcoming' | 'replays'>(
		liveLives.length === 0 && upcomingLives.length > 0 ? 'upcoming' : 'live'
	);
	let visibleLives = $derived(
		activeTab === 'live' ? liveLives : activeTab === 'upcoming' ? upcomingLives : replays
	);

	function formatCountdown(scheduleAt: string): string {
		const diffMs = new Date(scheduleAt).getTime() - Date.now();
		if (diffMs <= 0) return 'Bientôt';

		const diffMin = Math.round(diffMs / 60000);
		if (diffMin < 60) return `Dans ${diffMin} min`;

		const diffH = Math.round(diffMin / 60);
		if (diffH < 24) return `Dans ${diffH} h`;

		const diffDays = Math.round(diffH / 24);
		return `Dans ${diffDays} j`;
	}

	function formatFullDate(scheduleAt: string): string {
		return new Date(scheduleAt).toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Pas de miniature fournie par le backend pour les replays — dégradé
	// déterministe basé sur le titre, comme le fallback des cartes collection.
	function gradientFromString(str: string) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
		const hue = Math.abs(hash) % 360;
		return `linear-gradient(135deg, hsl(${hue}, 22%, 14%), hsl(${(hue + 40) % 360}, 18%, 22%))`;
	}

	function emptyStateTitle(tab: 'live' | 'upcoming' | 'replays'): string {
		if (tab === 'live') return 'Aucun live en ce moment';
		if (tab === 'upcoming') return 'Aucun live à venir';
		return 'Aucun replay pour le moment';
	}

	function emptyStateBody(tab: 'live' | 'upcoming' | 'replays'): string {
		if (tab === 'replays') return 'Les lives passés apparaîtront ici une fois enregistrés.';
		return 'Reviens bientôt, du nouveau contenu arrive.';
	}
</script>

<div class="archive">
	<div class="masthead">
		<span class="masthead__brand">Lives</span>
		<div class="masthead__right">
			<NotificationCenter />
		</div>
	</div>

	<div class="archive__inner">
		{#if nextLive}
			<div class="next-live">
				<div class="next-live__label">Prochain live</div>
				<div class="next-live__row">
					<div class="next-live__info">
						<p class="next-live__title">{nextLive.title}</p>
						<p class="next-live__date">{formatFullDate(nextLive.schedule_at)}</p>
					</div>
					<span class="next-live__countdown">{formatCountdown(nextLive.schedule_at)}</span>
				</div>
			</div>

			<NotificationPrompt
				variant="banner"
				title="Sois prévenu dès que le live commence"
				text={`Active les notifications pour ne pas rater "${nextLive.title}".`}
			/>
		{/if}

		<header class="heading">
			<h1 class="title">
				<span class="title__mask">
					<span class="title__in">
						{activeTab === 'live' ? 'En direct' : activeTab === 'upcoming' ? 'À venir' : 'Replays'}
					</span>
				</span>
			</h1>

			<nav class="tabs" aria-label="Type de lives">
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'live'}
					aria-pressed={activeTab === 'live'}
					onclick={() => (activeTab = 'live')}
				>
					En direct
					<span class="tabs__count">{liveLives.length}</span>
				</button>
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'upcoming'}
					aria-pressed={activeTab === 'upcoming'}
					onclick={() => (activeTab = 'upcoming')}
				>
					À venir
					<span class="tabs__count">{upcomingLives.length}</span>
				</button>
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'replays'}
					aria-pressed={activeTab === 'replays'}
					onclick={() => (activeTab = 'replays')}
				>
					Replays
					<span class="tabs__count">{replays.length}</span>
				</button>
			</nav>
		</header>

		{#if visibleLives.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">{emptyStateTitle(activeTab)}</p>
				<p class="empty-state__body">{emptyStateBody(activeTab)}</p>
			</div>
		{:else if activeTab === 'replays'}
			<div class="replay-grid">
				{#each visibleLives as replay, i (replay.id)}
					<a href={`/livestreams-replays/${replay.id}`} class="replay-card">
						<div class="replay-card__media">
							<div class="replay-card__img" style={`background: ${gradientFromString(replay.title)}`}></div>
							<span class="replay-card__play">
								<PlayIcon size={18} strokeWidth={2} />
							</span>
						</div>

						<div class="replay-card__caption">
							<div class="replay-card__meta">
								<span>{String(i + 1).padStart(2, '0')}</span>
								<span>
									{new Date(replay.schedule_at).toLocaleDateString('fr-FR', {
										day: '2-digit',
										month: 'short',
										year: 'numeric'
									})}
								</span>
							</div>
							<h3 class="replay-card__title">{replay.title}</h3>
							<span class="replay-card__action">
								<PlayIcon size={13} strokeWidth={2} />
								Regarder
							</span>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="live-grid">
				{#each visibleLives as live (live.id)}
					<LiveCard
						id={live.id}
						title={live.title}
						coverSrc="https://club.hackersonfutur.fr/3-opt.jpeg"
						status={live.status}
						scheduleAt={live.schedule_at}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		min-height: 100%;
	}

	.archive a:focus-visible,
	.archive button:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}

	/* La hauteur et le padding du masthead viennent de la règle globale du layout */
	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		border-bottom: 1px solid var(--rule);
	}

	.masthead__brand {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}

	.masthead__right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	/* Bloc "Prochain live" — encadré noir, compte à rebours en noir plein */
	.next-live {
		border: 1px solid var(--rule);
		padding: 1.25rem 1.5rem;
		margin-bottom: 1rem;
	}
	.next-live__label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--muted);
		margin-bottom: 0.6rem;
	}
	.next-live__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.next-live__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: clamp(1.4rem, 3vw, 1.9rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
	}
	.next-live__date {
		margin-top: 0.35rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
		text-transform: capitalize;
	}
	.next-live__countdown {
		flex-shrink: 0;
		padding: 0.5rem 0.9rem;
		background: var(--fg);
		color: #fff;
		font-size: 0.88rem;
		font-weight: 600;
	}

	.archive__inner :global(.notif-banner) {
		margin-bottom: 1.5rem;
	}

	/* Titre géant, révélé une seule fois au chargement ; il change avec l'onglet */
	.heading {
		padding-top: 1rem;
	}

	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(3.5rem, 13vw, 9rem);
		line-height: 0.88;
		letter-spacing: -0.045em;
		padding-bottom: 1.5rem;
	}
	.title__mask {
		display: block;
		overflow: hidden;
		padding-bottom: 0.06em;
	}
	.title__in {
		display: inline-block;
		transform: translateY(105%);
		animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}
	@keyframes rise {
		to { transform: translateY(0); }
	}

	/* Onglets : trois cellules séparées par des filets noirs, l'active s'inverse */
	.tabs {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.tabs__item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.9rem 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		font-family: 'Hanken Grotesk', sans-serif;
		font-size: 0.92rem;
		font-weight: 600;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.tabs__item + .tabs__item {
		border-left: 1px solid var(--rule);
	}
	.tabs__item:hover {
		color: var(--fg);
	}
	.tabs__item--active,
	.tabs__item--active:hover {
		background: var(--fg);
		color: #fff;
	}

	.tabs__count {
		font-size: 0.82rem;
		font-weight: 500;
		opacity: 0.7;
	}

	.empty-state {
		margin-top: 2rem;
		padding: 4rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.empty-state__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.4rem;
		letter-spacing: -0.02em;
	}
	.empty-state__body {
		margin-top: 0.4rem;
		font-size: 0.92rem;
		color: var(--muted);
	}

	/* Grilles — quadrillage de filets noirs ; les cartes portent leurs bordures
	   droite/basse pour que la dernière ligne incomplète reste propre */
	.live-grid,
	.replay-grid {
		display: grid;
		grid-template-columns: 1fr;
		margin-top: 2rem;
		border-top: 1px solid var(--rule);
		border-left: 1px solid var(--rule);
	}

	@media (min-width: 640px) {
		.live-grid,
		.replay-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.live-grid,
		.replay-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Cartes replay — même modèle que les cartes de collection */
	.replay-card {
		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--fg);
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
		text-decoration: none;
		transition: background-color 0.25s ease, color 0.25s ease;
	}
	.replay-card:focus-visible {
		outline-offset: -4px;
	}

	.replay-card__media {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: #eee;
		border-bottom: 1px solid var(--rule);
	}

	.replay-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		filter: grayscale(1) contrast(1.05);
		transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease;
	}
	.replay-card:hover .replay-card__img,
	.replay-card:focus-visible .replay-card__img {
		transform: scale(1.04);
		filter: grayscale(0);
	}

	.replay-card__play {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		background: #fff;
		color: #000;
		border: 1px solid #000;
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.9);
		transition: opacity 0.25s ease, transform 0.25s ease;
	}
	.replay-card:hover .replay-card__play,
	.replay-card:focus-visible .replay-card__play {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}

	.replay-card__caption {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		flex: 1;
		padding: 1rem 1.1rem 1.25rem;
	}

	.replay-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--muted);
		transition: color 0.25s ease;
	}

	.replay-card__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.replay-card__action {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: auto;
		padding-top: 0.4rem;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.replay-card:hover,
	.replay-card:focus-visible {
		background: var(--fg);
		color: var(--bg);
	}
	.replay-card:hover .replay-card__meta,
	.replay-card:focus-visible .replay-card__meta {
		color: #d0d0d0;
	}

	@media (prefers-reduced-motion: reduce) {
		.title__in { animation: none; transform: none; }
		.tabs__item,
		.replay-card,
		.replay-card__img,
		.replay-card__play {
			transition: none;
		}
		.replay-card:hover .replay-card__img,
		.replay-card:focus-visible .replay-card__img {
			transform: none;
		}
	}
</style>