<script lang="ts">
	import { enhance } from '$app/forms';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import CheckIcon from "@lucide/svelte/icons/check";
	import LockIcon from "@lucide/svelte/icons/lock";

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
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Débloque l'accès complet</h1>
			<p class="subtitle">
				Un seul abonnement, tout le catalogue. Résiliable à tout moment, sans engagement.
			</p>
		</header>

		<div class="layout">
			<!-- Carte de prix -->
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

			<!-- Ce qui est inclus -->
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

	/* Carte de prix */
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

	/* Liste des features */
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
</style>