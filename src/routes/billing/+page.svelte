<!-- src/routes/billing/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";

	let { form }: { form?: { error?: string; portal_url?: string } } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Facturation</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeftIcon size={13} strokeWidth={1.75} />
			<span>Retour</span>
		</a>
		<span class="masthead__eyebrow">Facturation</span>
	</div>

	<div class="archive__inner">
		<div class="card">
			<span class="card__icon">
				<CreditCardIcon size={16} strokeWidth={1.75} />
			</span>

			<h1 class="title">Gérer ton abonnement</h1>
			<p class="body">
				Modifie ton moyen de paiement, consulte tes factures, ou résilie ton abonnement
				directement depuis le portail sécurisé Stripe.
			</p>

			<form
				method="POST"
				action="?/managePortal"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.portal_url) {
							window.location.href = result.data.portal_url as string;
						} else {
							loading = false;
							await update();
						}
					};
				}}
			>
				<button type="submit" class="portal-button" disabled={loading}>
					{loading ? 'Ouverture…' : 'Gérer mon abonnement'}
				</button>
			</form>

			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

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
		max-width: 480px;
		margin: 0 auto;
		padding: 4rem 1.5rem 6rem;
	}

	.card {
		border: 1px solid var(--border);
		padding: 2.25rem 1.75rem;
		text-align: center;
	}

	.card__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		margin-bottom: 1.25rem;
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.5rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.body {
		margin-top: 0.6rem;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.portal-button {
		width: 100%;
		margin-top: 1.75rem;
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
	.portal-button:hover:not(:disabled) {
		opacity: 0.85;
	}
	.portal-button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.form-error {
		margin-top: 0.9rem;
		font-size: 0.78rem;
		color: var(--accent);
	}
</style>