<!-- <script lang="ts">
	import { enhance } from '$app/forms';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import CheckIcon from "@lucide/svelte/icons/check";
	import LockIcon from "@lucide/svelte/icons/lock";
	import LogOutIcon from "@lucide/svelte/icons/log-out";

	let { form }: { form?: { error?: string } } = $props();

	let loading = $state(false);

	const features = [
		"Accès illimité à toutes les masterclass",
		"Lives en avant-première, sans liste d'attente",
		"Téléchargement hors-ligne des vidéos",
		"Chat prioritaire pendant les lives",
		'Aucun engagement, résiliable à tout moment'
	];
</script>

<svelte:head>
	<title>Premium</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeftIcon size={13} strokeWidth={1.75} />
			<span>Retour</span>
		</a>
		<span class="masthead__eyebrow">Premium</span>
		<a href="/auth/logout" class="logout-link">
			<LogOutIcon size={13} strokeWidth={1.75} />
			<span>Déconnexion</span>
		</a>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Débloque l'accès complet</h1>
			<p class="subtitle">
				Un seul abonnement, tout le catalogue. Résiliable à tout moment, sans engagement.
			</p>
		</header>

		<div class="layout">
			<div class="price-card">
				<div class="price">
					<span class="price__amount">49 €</span>
					<span class="price__period">/ mois</span>
				</div>

				<form
					method="POST"
					action="?/checkout"
					class="checkout-form"
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
					<button type="submit" class="checkout-button" disabled={loading}>
						{loading ? 'Redirection…' : "S'abonner"}
					</button>
				</form>

				{#if form?.error}
					<p class="form-error">{form.error}</p>
				{/if}

				<p class="trust-line">
					<LockIcon size={12} strokeWidth={1.75} />
					Paiement sécurisé par Stripe
				</p>
			</div>

			<div class="features">
				<span class="eyebrow">Inclus dans l'abonnement</span>
				<ul class="features__list">
					{#each features as feature}
						<li class="features__item">
							<CheckIcon size={14} strokeWidth={2} />
							<span>{feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
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

	.back-link,
	.logout-link {
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
	.back-link:hover,
	.logout-link:hover { opacity: 0.55; }

	.logout-link {
		color: var(--muted);
	}

	.masthead__eyebrow {
		margin-left: auto;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.archive__inner {
		max-width: 860px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
	}

	.heading {
		max-width: 46ch;
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 2.9rem);
		line-height: 1.12;
		letter-spacing: -0.01em;
	}

	.subtitle {
		margin-top: 0.85rem;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--muted);
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		margin-top: 3rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--border);
	}

	@media (min-width: 760px) {
		.layout {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}

	.price-card {
		border: 1px solid var(--border);
		padding: 1.75rem;
	}

	.price {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}
	.price__amount {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 2.6rem;
		line-height: 1;
	}
	.price__period {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.checkout-form {
		margin-top: 1.5rem;
	}

	.checkout-button {
		width: 100%;
		padding: 0.85rem 1rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}
	.checkout-button:hover:not(:disabled) {
		opacity: 0.85;
	}
	.checkout-button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.form-error {
		margin-top: 0.75rem;
		font-size: 0.78rem;
		color: var(--accent);
	}

	.trust-line {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 1rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.03em;
		color: var(--muted);
	}

	.eyebrow {
		display: block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 1.1rem;
	}

	.features__list {
		display: flex;
		flex-direction: column;
	}

	.features__item {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
		line-height: 1.4;
	}
	.features__item:first-child {
		padding-top: 0;
	}
	.features__item :global(svg) {
		flex-shrink: 0;
		margin-top: 0.2rem;
		color: var(--accent);
	}
</style> -->


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
			<ArrowLeftIcon size={13} strokeWidth={1.75} />
			<span>Retour</span>
		</a>
		<span class="masthead__eyebrow">Premium</span>
		<a href="/auth/logout" class="logout-link">
			<LogOutIcon size={13} strokeWidth={1.75} />
			<span>Déconnexion</span>
		</a>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Choisis ta façon d'apprendre</h1>
			<p class="subtitle">
				Tout le catalogue avec l'abonnement, ou une seule masterclass à l'unité, sans engagement.
			</p>
		</header>

		{#if form?.error}
			<p class="form-error form-error--banner">{form.error}</p>
		{/if}

		<!-- Abonnement -->
		<section class="section">
			<span class="eyebrow">Abonnement</span>

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
						<button type="submit" class="btn btn--primary" disabled={subscribing}>
							{subscribing ? 'Redirection…' : "S'abonner"}
						</button>
					</form>

					<p class="trust-line">
						<LockIcon size={12} strokeWidth={1.75} />
						Paiement sécurisé par Stripe
					</p>
				</div>

				<ul class="plan__features">
					{#each features as feature}
						<li class="plan__feature">
							<CheckIcon size={14} strokeWidth={2} />
							<span>{feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- Masterclass à l'unité -->
		<section class="section">
			<span class="eyebrow">Ou à l'unité</span>
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
								<p class="card__meta">
									{mc.item_count} contenu{mc.item_count > 1 ? 's' : ''}
								</p>

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
	.back-link,
	.logout-link {
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
	.back-link:hover,
	.logout-link:hover {
		opacity: 0.55;
	}
	.logout-link {
		color: var(--muted);
	}
	.masthead__eyebrow {
		margin-left: auto;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.archive__inner {
		max-width: 1000px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
	}

	.heading {
		max-width: 52ch;
	}
	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 2.9rem);
		line-height: 1.12;
		letter-spacing: -0.01em;
	}
	.subtitle {
		margin-top: 0.85rem;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--muted);
	}

	.section {
		margin-top: 3rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--border);
	}
	.eyebrow {
		display: block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 1.1rem;
	}
	.section__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.7rem;
		line-height: 1.2;
	}
	.section__text {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: var(--muted);
	}

	/* Abonnement */
	.plan {
		display: grid;
		grid-template-columns: 1fr;
		border: 1px solid var(--fg);
	}
	@media (min-width: 760px) {
		.plan {
			grid-template-columns: 1fr 1fr;
		}
	}
	.plan__main {
		padding: 1.75rem;
		background: #faf9f6;
	}
	.plan__badge {
		display: inline-block;
		padding: 0.2rem 0.55rem;
		background: var(--fg);
		color: #fff;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.price {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin-top: 1rem;
	}
	.price__amount {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 2.8rem;
		line-height: 1;
	}
	.price__period {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.plan__tagline {
		margin: 0.6rem 0 1.5rem;
		font-size: 0.88rem;
		color: var(--muted);
	}
	.plan__features {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 1.75rem;
	}
	.plan__feature {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
		line-height: 1.4;
	}
	.plan__feature:last-child {
		border-bottom: none;
	}
	.plan__feature :global(svg) {
		flex-shrink: 0;
		margin-top: 0.2rem;
		color: var(--accent);
	}

	.trust-line {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 1rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.03em;
		color: var(--muted);
	}

	/* Boutons */
	.btn {
		display: inline-block;
		width: 100%;
		padding: 0.85rem 1rem;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		font-weight: 500;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}
	.btn--primary {
		background: var(--fg);
		color: #fff;
	}
	.btn--ghost {
		background: transparent;
		color: var(--fg);
	}
	.btn--small {
		width: auto;
		padding: 0.55rem 1.1rem;
	}
	.btn:hover:not(:disabled) {
		opacity: 0.85;
	}
	.btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.form-error {
		font-size: 0.78rem;
		color: var(--accent);
	}
	.form-error--banner {
		margin-top: 1.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--accent);
	}

	/* Masterclass */
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		margin-top: 2rem;
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
		border: 1px solid var(--border);
	}
	.card__media {
		position: relative;
		display: block;
		aspect-ratio: 4 / 3;
		background: #100f0d;
		overflow: hidden;
	}
	.card__media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}
	.card__media:hover img {
		transform: scale(1.04);
	}
	.card__tag {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		padding: 0.2rem 0.55rem;
		background: rgba(255, 255, 255, 0.92);
		font-size: 0.68rem;
		font-weight: 500;
	}
	.card__body {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 1rem;
	}
	.card__title {
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1.35;
	}
	.card__desc {
		margin-top: 0.4rem;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.card__meta {
		margin-top: 0.6rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		color: var(--muted);
	}
	.card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: auto;
		padding-top: 1rem;
	}
	.card__price {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.4rem;
	}

	.empty-state {
		margin-top: 2rem;
		padding: 3rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state p {
		font-size: 0.85rem;
		color: var(--muted);
	}

	:global(html),
:global(body) {
	height: auto !important;
	min-height: 100% !important;
	overflow-y: auto !important;
	overflow-x: hidden !important;
}

.archive {
	min-height: 100dvh;
	height: auto;
	overflow: visible;
}
</style>