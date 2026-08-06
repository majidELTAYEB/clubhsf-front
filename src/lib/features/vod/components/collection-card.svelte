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
</style>