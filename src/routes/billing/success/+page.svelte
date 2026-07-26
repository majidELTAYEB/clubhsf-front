<!-- src/routes/billing/success/+page.svelte -->
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import CheckIcon from "@lucide/svelte/icons/check";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import { onDestroy, onMount } from 'svelte';

	let { data }: { data: { isPremium?: boolean } } = $props();

	let retrying = $state(false);

	async function retry() {
		retrying = true;
		await invalidateAll();
		retrying = false;
	}

	let attempts = $state(0);
	const MAX_ATTEMPTS = 6;
	let timeoutId: ReturnType<typeof setTimeout>;

	async function poll() {
		if (data.isPremium || attempts >= MAX_ATTEMPTS) return;
		attempts++;
		await invalidateAll();
		if (!data.isPremium) {
			timeoutId = setTimeout(poll, 2000 * attempts); // backoff simple
		}
	}

	onMount(() => {
		if (!data.isPremium) poll();
	});

	onDestroy(() => clearTimeout(timeoutId));
</script>

<svelte:head>
	<title>Paiement confirmé</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Paiement</span>
	</div>

	<div class="archive__inner">
		<div class="card">
			{#if data.isPremium}
				<span class="card__icon card__icon--success">
					<CheckIcon size={16} strokeWidth={2} />
				</span>

				<h1 class="title">Bienvenue dans Premium</h1>
				<p class="body">Ton abonnement est actif. Tu as maintenant accès à tout le catalogue.</p>

				<div class="actions">
					<button type="button" class="btn btn--primary" onclick={() => goto('/masterclass')}>
						Accéder au contenu
					</button>
				</div>
			{:else}
				<span class="card__icon">
					<LoaderIcon size={16} strokeWidth={1.75} class="spin" />
				</span>

				<h1 class="title">Paiement reçu</h1>
				<p class="body">
					On finalise l'activation de ton compte — ça prend généralement quelques secondes.
				</p>

				<div class="actions">
					<button type="button" class="btn btn--primary" disabled={retrying} onclick={retry}>
						{retrying ? 'Vérification…' : 'Vérifier à nouveau'}
					</button>
				</div>
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
		--success: #3a6b3a;

		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
	}

	.masthead {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.archive__inner {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.card {
		width: 100%;
		max-width: 400px;
		padding: 2.25rem 1.75rem;
		border: 1px solid var(--border);
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
	.card__icon--success {
		border-color: var(--success);
		color: var(--success);
	}
	.card__icon :global(.spin) {
		animation: spin 1.2s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
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

	.actions {
		margin-top: 1.75rem;
	}

	.btn {
		width: 100%;
		padding: 0.75rem 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.btn--primary {
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
	}
	.btn--primary:hover:not(:disabled) {
		opacity: 0.85;
	}
	.btn--primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>