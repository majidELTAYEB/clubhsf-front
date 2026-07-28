<script lang="ts">
	import PlayIcon from "@lucide/svelte/icons/play";

	type Live = {
		id: string;
		title: string;
		schedule_at: string;
		status: string;
		stream_key: string;
		rtmp_url: string;
		playback_id: string;
	};

	let { data }: { data: { replays: Live[] } } = $props();

	// Pas de miniature fournie par le backend pour l'instant — dégradé déterministe
	// basé sur le titre, comme le fallback déjà utilisé sur les cartes collection.
	function gradientFromString(str: string) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
		const hue = Math.abs(hash) % 360;
		return `linear-gradient(135deg, hsl(${hue}, 22%, 14%), hsl(${(hue + 40) % 360}, 18%, 22%))`;
	}
</script>

<svelte:head>
	<title>Replays</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Replays</span>
		<span class="catalog-number">{data.replays.length} live{data.replays.length > 1 ? 's' : ''} enregistré{data.replays.length > 1 ? 's' : ''}</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Revoir les lives</h1>
			<p class="subtitle">
				Tous les lives passés, disponibles à la demande.
			</p>
		</header>

		{#if data.replays.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucun replay pour le moment</p>
				<p class="empty-state__body">Les lives passés apparaîtront ici une fois enregistrés.</p>
			</div>
		{:else}
			<div class="replay-grid">
				{#each data.replays as replay, i (replay.id)}
					<a href={`/livestreams-replays/${replay.id}`} class="replay-card">
						<div class="replay-card__img" style={`background: ${gradientFromString(replay.title)}`}></div>

						<span class="replay-card__index">{String(i + 1).padStart(2, '0')}</span>

						<div class="replay-card__overlay">
							<span class="replay-card__play">
								<PlayIcon size={16} strokeWidth={1.75} />
							</span>
						</div>

						<div class="replay-card__scrim">
							<span class="replay-card__tag">Replay</span>
							<h3 class="replay-card__title">{replay.title}</h3>
							<span class="replay-card__date">
								{new Date(replay.schedule_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
							</span>
						</div>
					</a>
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
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 3rem);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.subtitle {
		margin-top: 0.6rem;
		max-width: 46ch;
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--muted);
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

	.replay-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		background: var(--border);
		margin-top: 2.5rem;
		border: 1px solid var(--border);
	}

	@media (min-width: 640px) {
		.replay-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.replay-grid { grid-template-columns: repeat(3, 1fr); }
	}

	.replay-card {
		position: relative;
		display: block;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
	}

	.replay-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease;
		filter: saturate(0.7) brightness(0.85);
	}
	.replay-card:hover .replay-card__img {
		transform: scale(1.045);
		filter: saturate(1) brightness(1);
	}

	.replay-card__index {
		position: absolute;
		top: 0.6rem;
		left: 0.75rem;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 2.6rem;
		line-height: 1;
		color: rgba(255, 255, 255, 0.55);
		mix-blend-mode: overlay;
		pointer-events: none;
		transition: opacity 0.4s ease;
	}
	.replay-card:hover .replay-card__index {
		opacity: 0.3;
	}

	.replay-card__overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(9, 9, 8, 0);
		transition: background 0.25s ease;
	}
	.replay-card:hover .replay-card__overlay {
		background: rgba(9, 9, 8, 0.15);
	}

	.replay-card__play {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.4rem;
		height: 2.4rem;
		border: 1px solid rgba(255, 255, 255, 0.7);
		color: #fff;
		opacity: 0;
		transform: scale(0.9);
		transition: opacity 0.25s ease, transform 0.25s ease;
	}
	.replay-card:hover .replay-card__play {
		opacity: 1;
		transform: scale(1);
	}

	.replay-card__scrim {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 2.5rem 1rem 1rem;
		background: linear-gradient(to top, rgba(9, 9, 8, 0.92) 0%, rgba(9, 9, 8, 0.55) 55%, rgba(9, 9, 8, 0) 100%);
	}

	.replay-card__tag {
		display: block;
		margin-bottom: 0.3rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.55);
	}

	.replay-card__title {
		color: #fff;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1rem;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.replay-card__date {
		display: block;
		margin-top: 0.4rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.03em;
		color: rgba(255, 255, 255, 0.6);
	}
</style>