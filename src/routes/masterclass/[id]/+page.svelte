<!-- <script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import { formatDuration, formatTotalDuration } from '$lib/utils/masterclass';

	type Video = {
		ID: string;
		Title: string;
		Description: string | null;
		Position: number;
		DurationSeconds: number;
		ThumbnailURL: string;
	};

	type Collection = {
		id: string;
		title: string;
		slug: string;
		description: string;
		cover_image_url: string | null;
	};

	let { data }: { data: { collection: Collection; videos: Video[] } } = $props();

	let totalDuration = $derived(data.videos.reduce((sum, v) => sum + v.DurationSeconds, 0));

	// Numéro de catalogue — façon "N° 0142"
	let catalogNumber = $derived(
		String(data.collection?.id ?? 0)
			.replace(/\D/g, '')
			.slice(-4)
			.padStart(4, '0')
	);
</script>

<svelte:head>
	<title>{data.collection.title} — Masterclass</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeft size={13} strokeWidth={1.75} />
			<span>Toutes les masterclass</span>
		</a>
		<span class="masthead__category">Collection</span>
		<span class="catalog-number">N&deg; {catalogNumber}</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<div class="heading__text">
				<h1 class="title">{data.collection.title}</h1>
				{#if data.collection.description}
					<p class="description">{data.collection.description}</p>
				{/if}
			</div>
			<div class="byline">
				<span>{data.videos.length} vidéo{data.videos.length > 1 ? 's' : ''}</span>
				<span class="byline__dot">&middot;</span>
				<span>{formatTotalDuration(totalDuration)}</span>
			</div>
		</header>

		{#if data.videos.length === 0}
			<div class="empty-state">
				<p>Aucune vidéo disponible dans cette collection.</p>
			</div>
		{:else}
			<div class="video-grid">
				{#each data.videos as video (video.ID)}
					<a href={`/video/${video.ID}?collection=${data.collection.id}`} class="video-card">
						{#if video.ThumbnailURL}
							<img class="video-card__img" src={video.ThumbnailURL} alt={video.Title} loading="lazy" />
						{/if}

						<span class="video-card__index">{String(video.Position + 1).padStart(2, '0')}</span>
						<span class="video-card__duration">{formatDuration(video.DurationSeconds)}</span>

						<div class="video-card__scrim">
							<h3 class="video-card__title">{video.Title}</h3>
							<span class="video-card__watch">
								<Play size={11} strokeWidth={2} />
								Regarder
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

	/* Masthead */
	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--fg);
		text-decoration: none;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: opacity 0.2s ease;
	}
	.back-link:hover { opacity: 0.55; }

	.masthead__category {
		margin-left: auto;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		color: var(--fg);
	}

	.catalog-number {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
		padding-left: 1.25rem;
		border-left: 1px solid var(--border);
	}

	/* Contenu centré */
	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	/* Heading */
	.heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}

	.heading__text {
		max-width: 60ch;
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
	}

	.description {
		margin-top: 0.6rem;
		font-family: 'Fraunces', serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #2b2a26;
	}

	.byline {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--muted);
		white-space: nowrap;
	}
	.byline__dot { margin: 0 0.4rem; }

	/* Empty state */
	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state p {
		font-size: 0.85rem;
		color: var(--muted);
	}

	/* Grid */
	.video-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		/* background: var(--border); */
		margin-top: 2.5rem;
		/* border: 1px solid var(--border); */
	}

	@media (min-width: 640px) {
		.video-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.video-grid { grid-template-columns: repeat(3, 1fr); }
	}

	.video-card {
		position: relative;
		display: block;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: #100f0d;
		text-decoration: none;
		color: inherit;
	}

	.video-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05) brightness(0.92);
		transition: filter 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.video-card:hover .video-card__img {
		filter: grayscale(0) brightness(1);
		transform: scale(1.045);
	}

	/* Numéro fantôme, grand format, en filigrane sur l'image */
	.video-card__index {
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
	.video-card:hover .video-card__index {
		opacity: 0.3;
	}

	.video-card__duration {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.15rem 0.4rem;
		border: 1px solid rgba(255, 255, 255, 0.35);
		color: #fff;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.03em;
	}

	/* Scrim + titre — se révèle au survol, ancré en bas comme une affiche */
	.video-card__scrim {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 2.5rem 1rem 1rem;
		background: linear-gradient(to top, rgba(9, 9, 8, 0.92) 0%, rgba(9, 9, 8, 0.55) 55%, rgba(9, 9, 8, 0) 100%);
		transform: translateY(0.4rem);
		opacity: 0.92;
		transition: transform 0.35s ease, opacity 0.35s ease;
	}
	.video-card:hover .video-card__scrim {
		transform: translateY(0);
		opacity: 1;
	}

	.video-card__title {
		color: #fff;
		font-size: 0.92rem;
		font-weight: 500;
		line-height: 1.35;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.video-card__watch {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.6rem;
		color: rgba(255, 255, 255, 0.75);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0;
		transform: translateY(4px);
		transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s;
	}
	.video-card:hover .video-card__watch {
		opacity: 1;
		transform: translateY(0);
	}
</style> -->


<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import FileText from '@lucide/svelte/icons/file-text';
	import { formatDuration, formatTotalDuration } from '$lib/utils/masterclass';

	type Video = {
		ID: string;
		Title: string;
		Description: string | null;
		Position: number;
		DurationSeconds: number;
		ThumbnailURL: string;
	};

	type Article = {
		ID: string;
		Title: string;
		Slug: string;
		Excerpt: string | null;
		CoverImageURL: string | null;
		Position: number;
	};

	type Collection = {
		id: string;
		title: string;
		slug: string;
		description: string;
		cover_image_url: string | null;
	};

	let { data }: { data: { collection: Collection; videos: Video[]; articles: Article[] } } =
		$props();

	let totalDuration = $derived(data.videos.reduce((sum, v) => sum + v.DurationSeconds, 0));

	// Numéro de catalogue — façon "N° 0142"
	let catalogNumber = $derived(
		String(data.collection?.id ?? 0)
			.replace(/\D/g, '')
			.slice(-4)
			.padStart(4, '0')
	);
</script>

<svelte:head>
	<title>{data.collection.title} — Masterclass</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeft size={13} strokeWidth={1.75} />
			<span>Toutes les masterclass</span>
		</a>
		<span class="masthead__category">Collection</span>
		<span class="catalog-number">N&deg; {catalogNumber}</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<div class="heading__text">
				<h1 class="title">{data.collection.title}</h1>
				{#if data.collection.description}
					<p class="description">{data.collection.description}</p>
				{/if}
			</div>
			<div class="byline">
				<span>{data.videos.length} vidéo{data.videos.length > 1 ? 's' : ''}</span>
				<span class="byline__dot">&middot;</span>
				<span>{formatTotalDuration(totalDuration)}</span>
				{#if data.articles.length > 0}
					<span class="byline__dot">&middot;</span>
					<span>{data.articles.length} article{data.articles.length > 1 ? 's' : ''}</span>
				{/if}
			</div>
		</header>

		{#if data.videos.length === 0 && data.articles.length === 0}
			<div class="empty-state">
				<p>Aucun contenu disponible dans cette collection.</p>
			</div>
		{:else}
			{#if data.videos.length > 0}
				<div class="video-grid">
					{#each data.videos as video (video.ID)}
						<a href={`/video/${video.ID}?collection=${data.collection.id}`} class="video-card">
							{#if video.ThumbnailURL}
								<img
									class="video-card__img"
									src={video.ThumbnailURL}
									alt={video.Title}
									loading="lazy"
								/>
							{/if}

							<span class="video-card__index">{String(video.Position + 1).padStart(2, '0')}</span>
							<span class="video-card__duration">{formatDuration(video.DurationSeconds)}</span>

							<div class="video-card__scrim">
								<h3 class="video-card__title">{video.Title}</h3>
								{#if video.Description}
									<p class="article-card__excerpt">{video.Description}</p>
								{/if}
								<span class="video-card__watch">
									<Play size={11} strokeWidth={2} />
									Regarder
								</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}

			{#if data.articles.length > 0}
				<h2 class="section-heading">Articles</h2>
				<div class="video-grid">
					{#each data.articles as article (article.ID)}
						<a href={`/article/${article.Slug}?collection=${data.collection.id}`} class="video-card">
							{#if article.CoverImageURL}
								<img
									class="video-card__img"
									src={article.CoverImageURL}
									alt={article.Title}
									loading="lazy"
								/>
							{/if}

							<span class="video-card__index">
								{String(article.Position + 1).padStart(2, '0')}
							</span>

							<div class="video-card__scrim">
								<h3 class="video-card__title">{article.Title}</h3>
								{#if article.Excerpt}
									<p class="article-card__excerpt">{article.Excerpt}</p>
								{/if}
								<span class="video-card__watch">
									<FileText size={11} strokeWidth={2} />
									Lire
								</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
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

	/* Masthead */
	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--fg);
		text-decoration: none;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: opacity 0.2s ease;
	}
	.back-link:hover { opacity: 0.55; }

	.masthead__category {
		margin-left: auto;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		color: var(--fg);
	}

	.catalog-number {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
		padding-left: 1.25rem;
		border-left: 1px solid var(--border);
	}

	/* Contenu centré */
	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	/* Heading */
	.heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}

	.heading__text {
		max-width: 60ch;
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
	}

	.description {
		margin-top: 0.6rem;
		font-family: 'Fraunces', serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #2b2a26;
	}

	.byline {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--muted);
		white-space: nowrap;
	}
	.byline__dot { margin: 0 0.4rem; }

	/* Section heading, entre les deux grilles */
	.section-heading {
		margin: 3rem 0 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		font-weight: 500;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	/* Empty state */
	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state p {
		font-size: 0.85rem;
		color: var(--muted);
	}

	/* Grid — partagée videos + articles */
	.video-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		margin-top: 2.5rem;
	}

	@media (min-width: 640px) {
		.video-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.video-grid { grid-template-columns: repeat(3, 1fr); }
	}

	.video-card {
		position: relative;
		display: block;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: #100f0d;
		text-decoration: none;
		color: inherit;
	}

	.video-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05) brightness(0.92);
		transition: filter 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.video-card:hover .video-card__img {
		filter: grayscale(0) brightness(1);
		transform: scale(1.045);
	}

	/* Numéro fantôme, grand format, en filigrane sur l'image */
	.video-card__index {
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
	.video-card:hover .video-card__index {
		opacity: 0.3;
	}

	.video-card__duration {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.15rem 0.4rem;
		border: 1px solid rgba(255, 255, 255, 0.35);
		color: #fff;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.03em;
	}

	/* Scrim + titre — se révèle au survol, ancré en bas comme une affiche */
	.video-card__scrim {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 2.5rem 1rem 1rem;
		background: linear-gradient(to top, rgba(9, 9, 8, 0.92) 0%, rgba(9, 9, 8, 0.55) 55%, rgba(9, 9, 8, 0) 100%);
		transform: translateY(0.4rem);
		opacity: 0.92;
		transition: transform 0.35s ease, opacity 0.35s ease;
	}
	.video-card:hover .video-card__scrim {
		transform: translateY(0);
		opacity: 1;
	}

	.video-card__title {
		color: #fff;
		font-size: 0.92rem;
		font-weight: 500;
		line-height: 1.35;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.video-card__watch {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.6rem;
		color: rgba(255, 255, 255, 0.75);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0;
		transform: translateY(4px);
		transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s;
	}
	.video-card:hover .video-card__watch {
		opacity: 1;
		transform: translateY(0);
	}

	/* Extrait d'article, sous le titre dans le scrim */
	.article-card__excerpt {
		margin-top: 0.35rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.76rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>