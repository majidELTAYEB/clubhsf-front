<!-- <script lang="ts">
	import { gradientFromString, formatRelativeDate } from '$lib/utils/masterclass';

	type Collection = {
		id: string;
		title: string;
		slug: string;
		cover_image_url: string | null;
		created_at: string;
		updated_at: string;
	};

	let { collection, index = 0 }: { collection: Collection; index?: number } = $props();

	let hasCover = $derived(!!collection.cover_image_url);
</script>

<a href={`/masterclass/${collection.id}`} class="collection-card">
	{#if hasCover}
		<img class="collection-card__img" src={collection.cover_image_url} alt={collection.title} loading="lazy" />
	{:else}
		<div class="collection-card__img collection-card__img--fallback" style={`background: ${gradientFromString(collection.title)}`}></div>
	{/if}

	<span class="collection-card__index">{String(index + 1).padStart(2, '0')}</span>

	<div class="collection-card__scrim">
		<span class="collection-card__eyebrow">Masterclass</span>
		<h3 class="collection-card__title">{collection.title}</h3>
		<span class="collection-card__date">{formatRelativeDate(collection.updated_at)}</span>
	</div>
</a>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.collection-card {
		--fg: #121210;
		--muted: #77746c;

		position: relative;
		display: block;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: #100f0d;
		text-decoration: none;
		color: inherit;
		font-family: 'Inter', sans-serif;
	}

	.collection-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05) brightness(0.9);
		transition: filter 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.collection-card__img--fallback {
		filter: saturate(0.35) contrast(1.05) brightness(0.85);
	}
	.collection-card:hover .collection-card__img {
		filter: grayscale(0) brightness(1);
		transform: scale(1.045);
	}
	.collection-card:hover .collection-card__img--fallback {
		filter: saturate(1) brightness(1);
	}

	.collection-card__index {
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
	.collection-card:hover .collection-card__index {
		opacity: 0.3;
	}

	.collection-card__scrim {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 3rem 1rem 1.1rem;
		background: linear-gradient(to top, rgba(9, 9, 8, 0.92) 0%, rgba(9, 9, 8, 0.55) 55%, rgba(9, 9, 8, 0) 100%);
	}

	.collection-card__eyebrow {
		display: block;
		margin-bottom: 0.3rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.55);
	}

	.collection-card__title {
		color: #fff;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.15rem;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.collection-card__date {
		display: block;
		margin-top: 0.4rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.03em;
		color: rgba(255, 255, 255, 0.55);
	}
</style> -->

<script lang="ts">
	import { gradientFromString, formatRelativeDate } from '$lib/utils/masterclass';

	type Collection = {
		id: string;
		title: string;
		slug: string;
		cover_image_url: string | null;
		created_at: string;
		updated_at: string;
	};

	let { collection, index = 0 }: { collection: Collection; index?: number } = $props();

	let hasCover = $derived(!!collection.cover_image_url);
</script>

<a href={`/masterclass/${collection.id}`} class="collection-card">
	<div class="collection-card__media">
		{#if hasCover}
			<img class="collection-card__img" src={collection.cover_image_url} alt={collection.title} loading="lazy" />
		{:else}
			<div class="collection-card__img collection-card__img--fallback" style={`background: ${gradientFromString(collection.title)}`}></div>
		{/if}
	</div>

	<div class="collection-card__caption">
		<div class="collection-card__meta">
			<span>{String(index + 1).padStart(2, '0')}</span>
			<span>{formatRelativeDate(collection.updated_at)}</span>
		</div>
		<h3 class="collection-card__title">{collection.title}</h3>
	</div>
</a>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Le visuel en haut, la légende en dessous : la carte s'inverse en noir au survol */
	.collection-card {
		--fg: #000000;
		--bg: #ffffff;
		--muted: #6a6a6a;

		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--fg);
		border-right: 1px solid var(--fg);
		border-bottom: 1px solid var(--fg);
		text-decoration: none;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		transition: background-color 0.25s ease, color 0.25s ease;
	}
	.collection-card:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: -4px;
	}

	.collection-card__media {
		position: relative;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: #eee;
		border-bottom: 1px solid var(--fg);
	}

	/* Noir et blanc au repos, la couleur revient au survol */
	.collection-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transition: filter 0.5s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.collection-card__img--fallback {
		filter: grayscale(1) contrast(1.05);
	}
	.collection-card:hover .collection-card__img,
	.collection-card:focus-visible .collection-card__img {
		filter: grayscale(0);
		transform: scale(1.04);
	}

	.collection-card__caption {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		flex: 1;
		padding: 1rem 1.1rem 1.25rem;
	}

	.collection-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--muted);
		transition: color 0.25s ease;
	}

	.collection-card__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: clamp(1.35rem, 2.2vw, 1.6rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.collection-card:hover,
	.collection-card:focus-visible {
		background: var(--fg);
		color: var(--bg);
	}
	.collection-card:hover .collection-card__meta,
	.collection-card:focus-visible .collection-card__meta {
		color: #bdbdbd;
	}
	.collection-card:hover .collection-card__media,
	.collection-card:focus-visible .collection-card__media {
		border-bottom-color: var(--fg);
	}

	@media (prefers-reduced-motion: reduce) {
		.collection-card,
		.collection-card__img {
			transition: none;
		}
		.collection-card:hover .collection-card__img,
		.collection-card:focus-visible .collection-card__img {
			transform: none;
		}
	}
</style>