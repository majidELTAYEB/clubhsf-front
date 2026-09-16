<!-- <script lang="ts">
	import type { PageData } from './$types';
	import LiveCard from '$lib/components/live-card.svelte';

	let { data }: { data: PageData } = $props();
	let lives = $derived(data.lives);

	let liveLives = $derived(lives.filter((l) => l.status === 'active' || l.status === 'disconnected'));
	let upcomingLives = $derived(lives.filter((l) => l.status === 'scheduled'));

	let activeTab = $state<'live' | 'upcoming'>('live');
	let visibleLives = $derived(activeTab === 'live' ? liveLives : upcomingLives);
</script>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Lives</span>
		<span class="catalog-number">{lives.length} au total</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">{activeTab === 'live' ? 'En direct' : 'À venir'}</h1>

			<nav class="tabs">
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'live'}
					on:click={() => (activeTab = 'live')}
				>
					En direct
					<span class="tabs__count">{liveLives.length}</span>
				</button>
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'upcoming'}
					on:click={() => (activeTab = 'upcoming')}
				>
					À venir
					<span class="tabs__count">{upcomingLives.length}</span>
				</button>
			</nav>
		</header>

		{#if visibleLives.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">
					{activeTab === 'live' ? 'Aucun live en ce moment' : 'Aucun live à venir'}
				</p>
				<p class="empty-state__body">Reviens bientôt, du nouveau contenu arrive.</p>
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
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		min-height: 100%;
	}

	/* .masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	} */

	.masthead {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  padding-top: calc(1rem + env(safe-area-inset-top));
  border-bottom: 1px solid var(--border);
}

	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.catalog-number {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	.heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		padding-bottom: 0;
		border-bottom: 1px solid var(--border);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.9rem, 4.5vw, 2.75rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
		padding-bottom: 1.5rem;
	}

	/* Onglets — soulignement, pas de pilule */
	.tabs {
		display: flex;
		gap: 1.5rem;
	}

	.tabs__item {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding-bottom: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition: color 0.2s ease;
	}
	.tabs__item::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		background: var(--fg);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.25s ease;
	}
	.tabs__item:hover {
		color: var(--fg);
	}
	.tabs__item--active {
		color: var(--fg);
	}
	.tabs__item--active::after {
		transform: scaleX(1);
	}

	.tabs__count {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		color: var(--muted);
	}
	.tabs__item--active .tabs__count {
		color: var(--fg);
	}

	/* Empty state */
	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title {
		font-size: 0.9rem;
		font-weight: 500;
	}
	.empty-state__body {
		margin-top: 0.3rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	/* Grid */
	.live-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		margin-top: 2.5rem;
	}

	@media (min-width: 640px) {
		.live-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.live-grid { grid-template-columns: repeat(3, 1fr); }
	}
</style> -->


<script lang="ts">
	import type { PageData } from './$types';
	import LiveCard from '$lib/components/live-card.svelte';
	import NotificationPrompt from '$lib/components/NotificationPrompt.svelte';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';

	let { data }: { data: PageData } = $props();
	let lives = $derived(data.lives);

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
	let activeTab = $state<'live' | 'upcoming'>(
		liveLives.length === 0 && upcomingLives.length > 0 ? 'upcoming' : 'live'
	);
	let visibleLives = $derived(activeTab === 'live' ? liveLives : upcomingLives);

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

</script>

<div class="archive">
	<!-- <div class="masthead">
		<span class="masthead__eyebrow">Lives</span>
		<span class="catalog-number">{lives.length} au total</span>
	</div> -->
	<div class="masthead">
	<span class="masthead__eyebrow">Lives</span>
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
			<h1 class="title">{activeTab === 'live' ? 'En direct' : 'À venir'}</h1>

			<nav class="tabs">
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'live'}
					on:click={() => (activeTab = 'live')}
				>
					En direct
					<span class="tabs__count">{liveLives.length}</span>
				</button>
				<button
					type="button"
					class="tabs__item"
					class:tabs__item--active={activeTab === 'upcoming'}
					on:click={() => (activeTab = 'upcoming')}
				>
					À venir
					<span class="tabs__count">{upcomingLives.length}</span>
				</button>
			</nav>
		</header>

		{#if visibleLives.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">
					{activeTab === 'live' ? 'Aucun live en ce moment' : 'Aucun live à venir'}
				</p>
				<p class="empty-state__body">Reviens bientôt, du nouveau contenu arrive.</p>
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
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		min-height: 100%;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--border);
	}

	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.catalog-number {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	/* Card "Prochain live" */
	.next-live {
		border: 1px solid var(--fg);
		padding: 1.1rem 1.25rem;
		margin-bottom: 1rem;
	}
	.next-live__label {
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}
	.next-live__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.next-live__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.2rem;
	}
	.next-live__date {
		margin-top: 0.2rem;
		font-size: 0.8rem;
		color: var(--muted);
		text-transform: capitalize;
	}
	.next-live__countdown {
		flex-shrink: 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.4rem 0.75rem;
		background: #f7f5f0;
		border: 1px solid var(--border);
	}

	.archive__inner :global(.notif-banner) {
		margin-bottom: 1.5rem;
	}

	.heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		padding-bottom: 0;
		border-bottom: 1px solid var(--border);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.9rem, 4.5vw, 2.75rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
		padding-bottom: 1.5rem;
	}

	.tabs {
		display: flex;
		gap: 1.5rem;
	}

	.tabs__item {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding-bottom: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition: color 0.2s ease;
	}
	.tabs__item::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		background: var(--fg);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.25s ease;
	}
	.tabs__item:hover {
		color: var(--fg);
	}
	.tabs__item--active {
		color: var(--fg);
	}
	.tabs__item--active::after {
		transform: scaleX(1);
	}

	.tabs__count {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		color: var(--muted);
	}
	.tabs__item--active .tabs__count {
		color: var(--fg);
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title {
		font-size: 0.9rem;
		font-weight: 500;
	}
	.empty-state__body {
		margin-top: 0.3rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.live-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		margin-top: 2.5rem;
	}

	.masthead__right {
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 1rem;
}

	@media (min-width: 640px) {
		.live-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.live-grid { grid-template-columns: repeat(3, 1fr); }
	}
</style>