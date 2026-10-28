<script lang="ts">
	import { enhance } from '$app/forms';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import CheckIcon from '@lucide/svelte/icons/check';
	import LockIcon from '@lucide/svelte/icons/lock';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	type Masterclass = {
		id: string;
		title: string;
		description?: string | null;
		cover_image_url: string | null;
		price_cents?: number | null;
		currency: string;
		owned: boolean;
		item_count: number;
	};

	let {
		data,
		form
	}: {
		data: { masterclasses: Masterclass[] };
		form?: { error?: string } | null;
	} = $props();

	let subscribing = $state(false);
	let buyingId = $state<string | null>(null);

	const features = [
		'Accès illimité à toutes les masterclass',
		"Lives en avant-première, sans liste d'attente",
		'Téléchargement hors-ligne des vidéos',
		'Chat prioritaire pendant les lives',
		'Aucun engagement, résiliable à tout moment'
	];

	function formatPrice(cents: number | null | undefined, currency: string) {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency || 'eur',
			minimumFractionDigits: cents && cents % 100 === 0 ? 0 : 2
		}).format((cents ?? 0) / 100);
	}

	function redirectOnCheckout(onDone: () => void) {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			if (result.type === 'success' && result.data?.checkout_url) {
				window.location.href = result.data.checkout_url as string;
			} else {
				onDone();
				await update();
			}
		};
	}
</script>

<svelte:head>
	<title>Premium</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeftIcon size={16} strokeWidth={2} />
			<span>Retour</span>
		</a>
		<span class="masthead__label">Premium</span>
		<a href="/auth/logout" class="logout-link">
			<LogOutIcon size={14} strokeWidth={2} />
			<span>Déconnexion</span>
		</a>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">
				<span class="title__mask">
					<span class="title__in">Choisis ta façon d'apprendre</span>
				</span>
			</h1>
			<p class="subtitle">
				Tout le catalogue avec l'abonnement, ou une seule masterclass à l'unité, sans engagement.
			</p>
		</header>

		{#if form?.error}
			<p class="form-error form-error--banner">{form.error}</p>
		{/if}

		<!-- Abonnement -->
		<section class="section">
			<h2 class="section__title">Abonnement</h2>

			<div class="plan">
				<div class="plan__main">
					<span class="plan__badge">Le plus complet</span>
					<div class="price">
						<span class="price__amount">49 €</span>
						<span class="price__period">/ mois</span>
					</div>
					<p class="plan__tagline">Un seul abonnement, tout le catalogue.</p>

					<form
						method="POST"
						action="?/checkout"
						use:enhance={() => {
							subscribing = true;
							return redirectOnCheckout(() => (subscribing = false));
						}}
					>
						<button type="submit" class="btn btn--inverse" disabled={subscribing}>
							{subscribing ? 'Redirection…' : "S'abonner"}
						</button>
					</form>

					<p class="trust-line">
						<LockIcon size={13} strokeWidth={2} />
						Paiement sécurisé par Stripe
					</p>
				</div>

				<ul class="plan__features">
					{#each features as feature}
						<li class="plan__feature">
							<CheckIcon size={16} strokeWidth={2.25} />
							<span>{feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- Masterclass à l'unité -->
		<section class="section">
			<h2 class="section__title">Achète une masterclass</h2>
			<p class="section__text">
				Paiement unique, accès à vie à la masterclass. Aucun abonnement requis.
			</p>

			{#if data.masterclasses.length === 0}
				<div class="empty-state">
					<p>Aucune masterclass à l'unité pour le moment.</p>
				</div>
			{:else}
				<div class="grid">
					{#each data.masterclasses as mc (mc.id)}
						<article class="card">
							<a href="/masterclass/{mc.id}" class="card__media">
								{#if mc.cover_image_url}
									<img src={mc.cover_image_url} alt={mc.title} loading="lazy" />
								{/if}
								{#if mc.owned}
									<span class="card__tag">Acheté</span>
								{/if}
							</a>

							<div class="card__body">
								<h3 class="card__title">{mc.title}</h3>
								{#if mc.description}
									<p class="card__desc">{mc.description}</p>
								{/if}

								<div class="card__footer">
									{#if mc.owned}
										<a href="/masterclass/{mc.id}" class="btn btn--ghost">Regarder</a>
									{:else}
										<span class="card__price">{formatPrice(mc.price_cents, mc.currency)}</span>
										<form
											method="POST"
											action="?/buy"
											use:enhance={() => {
												buyingId = mc.id;
												return redirectOnCheckout(() => (buyingId = null));
											}}
										>
											<input type="hidden" name="collection_id" value={mc.id} />
											<button
												type="submit"
												class="btn btn--primary btn--small"
												disabled={buyingId !== null}
											>
												{buyingId === mc.id ? 'Redirection…' : 'Acheter'}
											</button>
										</form>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
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

	.masthead__label {
		margin-left: auto;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
	}

	.logout-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--fg);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.logout-link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.archive__inner {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	/* Titre : révélé une seule fois au chargement */
	.heading {
		padding-bottom: 2rem;
	}

	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(2.6rem, 8.5vw, 6rem);
		line-height: 0.92;
		letter-spacing: -0.045em;
		max-width: 14ch;
		text-wrap: balance;
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

	.subtitle {
		margin-top: 1.25rem;
		max-width: 50ch;
		font-size: 1.05rem;
		font-weight: 500;
		line-height: 1.45;
		letter-spacing: -0.01em;
		color: var(--muted);
	}

	/* Sections */
	.section {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--rule);
	}

	.section__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.9rem, 4.5vw, 3rem);
		line-height: 1;
		letter-spacing: -0.04em;
	}

	.section__text {
		margin-top: 0.75rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--muted);
	}

	/* Abonnement : bloc noir à gauche, liste à droite */
	.plan {
		display: grid;
		grid-template-columns: 1fr;
		margin-top: 1.5rem;
		border: 1px solid var(--rule);
	}
	@media (min-width: 760px) {
		.plan {
			grid-template-columns: 1fr 1fr;
		}
	}

	.plan__main {
		padding: 1.75rem;
		background: var(--fg);
		color: var(--bg);
	}

	.plan__badge {
		display: inline-block;
		padding: 0.3rem 0.65rem;
		background: #fff;
		color: #000;
		border: 1px solid #fff;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.price {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}
	.price__amount {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(3.5rem, 8vw, 5rem);
		line-height: 0.9;
		letter-spacing: -0.05em;
	}
	.price__period {
		font-size: 1rem;
		font-weight: 500;
		color: #d0d0d0;
	}

	.plan__tagline {
		margin: 0.75rem 0 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: #d0d0d0;
	}

	.trust-line {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 1rem;
		font-size: 0.82rem;
		font-weight: 500;
		color: #d0d0d0;
	}

	.plan__features {
		display: flex;
		flex-direction: column;
		justify-content: center;
		list-style: none;
		margin: 0;
		padding: 0.75rem 1.75rem;
	}
	@media (min-width: 760px) {
		.plan__features {
			border-left: 1px solid var(--rule);
		}
	}
	@media (max-width: 759px) {
		.plan__features {
			border-top: 1px solid var(--rule);
		}
	}

	.plan__feature {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--rule);
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1.4;
	}
	.plan__feature:last-child {
		border-bottom: none;
	}
	.plan__feature :global(svg) {
		flex-shrink: 0;
		margin-top: 0.15rem;
	}

	/* Boutons */
	.btn {
		display: inline-block;
		width: 100%;
		padding: 0.9rem 1rem;
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
	.btn--primary {
		background: var(--fg);
		color: var(--bg);
	}
	.btn--primary:hover:not(:disabled),
	.btn--ghost {
		background: var(--bg);
		color: var(--fg);
	}
	.btn--ghost:hover {
		background: var(--fg);
		color: var(--bg);
	}
	/* Variante pour le bloc noir : blanc plein, s'inverse au survol */
	.btn--inverse {
		background: #fff;
		color: #000;
		border-color: #fff;
	}
	.btn--inverse:hover:not(:disabled) {
		background: #000;
		color: #fff;
	}
	.btn--small {
		width: auto;
		padding: 0.55rem 1.1rem;
		font-size: 0.88rem;
	}
	.btn:disabled {
		background: #f2f2f2;
		color: var(--muted);
		border-color: var(--muted);
		cursor: not-allowed;
	}

	/* Erreur : encadrée et en gras, sans couleur d'accent */
	.form-error {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.form-error--banner {
		margin-top: 0.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--rule);
	}

	/* Grille de masterclass : quadrillage de filets noirs */
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		margin-top: 2rem;
		border-top: 1px solid var(--rule);
		border-left: 1px solid var(--rule);
	}
	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 960px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.card {
		display: flex;
		flex-direction: column;
		background: var(--bg);
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.card__media {
		position: relative;
		display: block;
		aspect-ratio: 4 / 3;
		background: #eee;
		border-bottom: 1px solid var(--rule);
		overflow: hidden;
	}
	.card__media img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transition: filter 0.5s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.card__media:hover img,
	.card__media:focus-visible img {
		filter: grayscale(0);
		transform: scale(1.04);
	}
	.card__media:focus-visible {
		outline-offset: -4px;
	}

	.card__tag {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.3rem 0.65rem;
		background: #fff;
		color: #000;
		border: 1px solid #000;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.card__body {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 1rem 1.1rem 1.25rem;
	}

	.card__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
	}

	.card__desc {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: auto;
		padding-top: 1.25rem;
	}

	.card__price {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: 1.6rem;
		letter-spacing: -0.04em;
		line-height: 1;
	}

	/* Empty state */
	.empty-state {
		margin-top: 2rem;
		padding: 3rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.empty-state p {
		font-size: 0.95rem;
		color: var(--muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.title__in {
			animation: none;
			transform: none;
		}
		.back-link,
		.btn,
		.card__media img {
			transition: none;
		}
		.card__media:hover img,
		.card__media:focus-visible img {
			transform: none;
		}
	}
</style>