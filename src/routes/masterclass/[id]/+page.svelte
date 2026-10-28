<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Play from '@lucide/svelte/icons/play';
	import FileText from '@lucide/svelte/icons/file-text';
	import Lock from '@lucide/svelte/icons/lock';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
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
		access_type: 'included' | 'paid';
		price_cents: number | null;
		currency: string;
		accessible: boolean;
		owned: boolean;
		item_count: number;
	};

	let {
		data,
		form
	}: {
		data: { collection: Collection; videos: Video[]; articles: Article[] };
		form?: { error?: string } | null;
	} = $props();

	let totalDuration = $derived(data.videos.reduce((sum, v) => sum + v.DurationSeconds, 0));
	let locked = $derived(!data.collection.accessible);

	let price = $derived(
		new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: data.collection.currency || 'eur'
		}).format((data.collection.price_cents ?? 0) / 100)
	);

	let loading = $state(false);

	// Retour de Stripe : le webhook peut arriver après la redirection.
	// On recharge les données toutes les 2 s (10 essais max) jusqu'à accessible.
	let verifying = $derived(page.url.searchParams.get('checkout') === 'success' && locked);

	$effect(() => {
		if (!verifying) return;
		let tries = 0;
		const id = setInterval(() => {
			tries++;
			invalidateAll();
			if (tries >= 10) clearInterval(id);
		}, 2000);
		return () => clearInterval(id);
	});
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
		<span class="masthead__category">Collection</span>
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
				{#if locked}
					<span>
						{data.collection.item_count} contenu{data.collection.item_count > 1 ? 's' : ''}
					</span>
				{:else}
					<span>{data.videos.length} vidéo{data.videos.length > 1 ? 's' : ''}</span>
					<span class="byline__dot">&middot;</span>
					<span>{formatTotalDuration(totalDuration)}</span>
					{#if data.articles.length > 0}
						<span class="byline__dot">&middot;</span>
						<span>{data.articles.length} article{data.articles.length > 1 ? 's' : ''}</span>
					{/if}
				{/if}
			</div>
		</header>

		{#if locked}
			<div class="paywall">
				{#if data.collection.cover_image_url}
					<img
						class="paywall__cover"
						src={data.collection.cover_image_url}
						alt={data.collection.title}
					/>
				{/if}

				{#if data.collection.access_type === 'paid'}
					<div class="paywall__box">
						<span class="paywall__lock">
							<Lock size={14} strokeWidth={2} /> Accès à l'unité
						</span>
						<p class="paywall__price">{price}</p>
						<p class="paywall__text">Achète cette masterclass sans abonnement.</p>

						{#if verifying}
							<p class="paywall__text">Paiement en cours de validation…</p>
						{:else}
							<form
								method="POST"
								action="?/buy"
								use:enhance={() => {
									loading = true;
									return async ({ result, update }) => {
										if (result.type === 'success' && result.data?.checkout_url) {
											window.location.href = result.data.checkout_url as string;
										} else {
											loading = false;
											await update();
										}
									};
								}}
							>
								<input type="hidden" name="collection_id" value={data.collection.id} />
								<button type="submit" class="paywall__button" disabled={loading}>
									{loading ? 'Redirection…' : `Acheter pour ${price}`}
								</button>
							</form>
							{#if form?.error}
								<p class="paywall__error">{form.error}</p>
							{/if}
						{/if}

						<a href="/premium" class="paywall__link">
							Ou accède à tout le catalogue avec l'abonnement
						</a>
					</div>
				{:else}
					<div class="paywall__box">
						<p class="paywall__text">Cette masterclass est réservée aux abonnés.</p>
						<a href="/premium" class="paywall__button">Voir l'abonnement</a>
					</div>
				{/if}
			</div>
		{:else if data.videos.length === 0 && data.articles.length === 0}
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

	/* Débloque le scroll du document */
	:global(html),
	:global(body) {
		height: auto !important;
		min-height: 100% !important;
		overflow-y: auto !important;
		overflow-x: hidden !important;
	}

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		min-height: 100dvh;
		height: auto;
		overflow: visible;
	}

	.archive a:focus-visible,
	.archive button:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}

	/* Masthead */
	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
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
	.back-link:hover {
		opacity: 0.55;
	}

	.masthead__category {
		margin-left: auto;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
	}

	.masthead__right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Contenu centré */
	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	/* Heading : titre géant, révélé une seule fois au chargement */
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
		to {
			transform: translateY(0);
		}
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
	.byline__dot {
		margin: 0 0.5rem;
	}

	/* Titre de section, entre les deux grilles */
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

	/* Paywall */
	.paywall {
		margin-top: 2rem;
		display: grid;
		grid-template-columns: 1fr;
		border-top: 1px solid var(--rule);
		border-left: 1px solid var(--rule);
	}
	@media (min-width: 760px) {
		.paywall {
			grid-template-columns: 1fr 1fr;
		}
	}

	.paywall__cover {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.paywall__box {
		padding: 1.75rem;
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.paywall__lock {
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

	.paywall__price {
		margin-top: 1.25rem;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(2.8rem, 6vw, 4.5rem);
		line-height: 0.95;
		letter-spacing: -0.045em;
	}

	.paywall__text {
		margin: 0.75rem 0 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--muted);
	}

	.paywall__button {
		display: block;
		width: 100%;
		padding: 0.9rem 1rem;
		background: var(--fg);
		color: var(--bg);
		border: 1px solid var(--fg);
		border-radius: 0;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.paywall__button:hover:not(:disabled) {
		background: var(--bg);
		color: var(--fg);
	}
	.paywall__button:disabled {
		background: #f2f2f2;
		color: var(--muted);
		border-color: var(--muted);
		cursor: not-allowed;
	}

	/* Erreur : encadrée et en gras, sans couleur d'accent */
	.paywall__error {
		margin-top: 0.75rem;
		padding: 0.6rem 0.8rem;
		border: 1px solid var(--rule);
		font-size: 0.88rem;
		font-weight: 600;
	}

	.paywall__link {
		display: block;
		margin-top: 1rem;
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--muted);
		text-align: center;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.paywall__link:hover {
		color: var(--fg);
	}

	/* Grille : quadrillage de filets noirs, partagé vidéos + articles.
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
		.video-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.video-grid {
			grid-template-columns: repeat(3, 1fr);
		}
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
		.title__in {
			animation: none;
			transform: none;
		}
		.back-link,
		.paywall__button,
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