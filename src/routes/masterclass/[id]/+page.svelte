
<!-- <script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import FileText from '@lucide/svelte/icons/file-text';
	import { formatDuration, formatTotalDuration } from '$lib/utils/masterclass';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';

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
			<div class="masthead__right">
		<NotificationCenter />

	</div>
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
  padding-top: calc(1rem + env(safe-area-inset-top));
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
</style> -->

<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import FileText from '@lucide/svelte/icons/file-text';
	import { formatDuration, formatTotalDuration } from '$lib/utils/masterclass';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';

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
</script>

<svelte:head>
	<title>{data.collection.title} — Masterclass</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeft size={16} strokeWidth={2} />
			<span>Toutes les masterclass</span>
		</a>
		<div class="masthead__right">
			<NotificationCenter />
		</div>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">
				<span class="title__mask"><span class="title__in">{data.collection.title}</span></span>
			</h1>

			{#if data.collection.description}
				<p class="description">{data.collection.description}</p>
			{/if}

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
							<div class="video-card__media">
								{#if video.ThumbnailURL}
									<img
										class="video-card__img"
										src={video.ThumbnailURL}
										alt={video.Title}
										loading="lazy"
									/>
								{:else}
									<Play class="video-card__placeholder" size={28} strokeWidth={1.5} />
								{/if}
							</div>

							<div class="video-card__caption">
								<div class="video-card__meta">
									<span>{String(video.Position + 1).padStart(2, '0')}</span>
									<span>{formatDuration(video.DurationSeconds)}</span>
								</div>
								<h3 class="video-card__title">{video.Title}</h3>
								{#if video.Description}
									<p class="card__excerpt">{video.Description}</p>
								{/if}
								<span class="video-card__action">
									<Play size={13} strokeWidth={2} />
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
							<div class="video-card__media">
								{#if article.CoverImageURL}
									<img
										class="video-card__img"
										src={article.CoverImageURL}
										alt={article.Title}
										loading="lazy"
									/>
								{:else}
									<FileText class="video-card__placeholder" size={28} strokeWidth={1.5} />
								{/if}
							</div>

							<div class="video-card__caption">
								<div class="video-card__meta">
									<span>{String(article.Position + 1).padStart(2, '0')}</span>
								</div>
								<h3 class="video-card__title">{article.Title}</h3>
								{#if article.Excerpt}
									<p class="card__excerpt">{article.Excerpt}</p>
								{/if}
								<span class="video-card__action">
									<FileText size={13} strokeWidth={2} />
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

	.archive a:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}

	/* Masthead */
	.masthead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
	}

	.masthead__right {
		display: flex;
		align-items: center;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--fg);
		text-decoration: none;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
		transition: opacity 0.2s ease;
	}
	.back-link:hover { opacity: 0.55; }

	/* Contenu centré */
	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	/* Heading — titre géant, révélé une seule fois au chargement */
	.heading {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--rule);
	}

	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(2.8rem, 9vw, 7rem);
		line-height: 0.92;
		letter-spacing: -0.045em;
		word-break: break-word;
	}
	.title__mask {
		display: block;
		overflow: hidden;
		padding-bottom: 0.06em;
	}
	.title__in {
		display: block;
		transform: translateY(105%);
		animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}
	@keyframes rise {
		to { transform: translateY(0); }
	}
	@media (prefers-reduced-motion: reduce) {
		.title__in { animation: none; transform: none; }
	}

	.description {
		margin-top: 1.25rem;
		max-width: 60ch;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		font-weight: 500;
		line-height: 1.45;
		letter-spacing: -0.01em;
		color: #222;
	}

	.byline {
		margin-top: 1.25rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
	}
	.byline__dot { margin: 0 0.5rem; }

	/* Section heading, entre les deux grilles */
	.section-heading {
		margin: 3.5rem 0 0;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.9rem, 4.5vw, 3rem);
		line-height: 1;
		letter-spacing: -0.04em;
	}

	/* Empty state */
	.empty-state {
		margin-top: 2rem;
		padding: 4rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.empty-state p {
		font-size: 0.95rem;
		color: var(--muted);
	}

	/* Grille — quadrillage de filets noirs, partagé vidéos + articles.
	   Les cartes portent leurs bordures droite/basse pour que la dernière
	   ligne incomplète reste propre. */
	.video-grid {
		display: grid;
		grid-template-columns: 1fr;
		margin-top: 2rem;
		border-top: 1px solid var(--rule);
		border-left: 1px solid var(--rule);
	}

	@media (min-width: 640px) {
		.video-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.video-grid { grid-template-columns: repeat(3, 1fr); }
	}

	.video-card {
		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--fg);
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
		text-decoration: none;
		transition: background-color 0.25s ease, color 0.25s ease;
	}
	.video-card:focus-visible {
		outline-offset: -4px;
	}

	.video-card__media {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: #eee;
		border-bottom: 1px solid var(--rule);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.video-card__media :global(.video-card__placeholder) {
		color: var(--muted);
	}

	/* Noir et blanc au repos, la couleur revient au survol */
	.video-card__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transition: filter 0.5s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.video-card:hover .video-card__img,
	.video-card:focus-visible .video-card__img {
		filter: grayscale(0);
		transform: scale(1.04);
	}

	.video-card__caption {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		flex: 1;
		padding: 1rem 1.1rem 1.25rem;
	}

	.video-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--muted);
		transition: color 0.25s ease;
	}

	.video-card__title {
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

	.card__excerpt {
		font-size: 0.88rem;
		line-height: 1.5;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		transition: color 0.25s ease;
	}

	.video-card__action {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: auto;
		padding-top: 0.4rem;
		font-size: 0.85rem;
		font-weight: 600;
	}

	/* La carte s'inverse en noir au survol */
	.video-card:hover,
	.video-card:focus-visible {
		background: var(--fg);
		color: var(--bg);
	}
	.video-card:hover .video-card__meta,
	.video-card:hover .card__excerpt,
	.video-card:focus-visible .video-card__meta,
	.video-card:focus-visible .card__excerpt {
		color: #d0d0d0;
	}

	@media (prefers-reduced-motion: reduce) {
		.video-card,
		.video-card__img {
			transition: none;
		}
		.video-card:hover .video-card__img,
		.video-card:focus-visible .video-card__img {
			transform: none;
		}
	}
</style>