<!-- src/routes/billing/cancel/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import XIcon from "@lucide/svelte/icons/x";
</script>

<svelte:head>
	<title>Paiement annulé</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Paiement</span>
	</div>

	<div class="archive__inner">
		<div class="card">
			<span class="card__icon">
				<XIcon size={16} strokeWidth={1.75} />
			</span>

			<h1 class="title">Paiement annulé</h1>
			<p class="body">Aucun montant n'a été débité. Tu peux réessayer quand tu veux.</p>

			<div class="actions">
				<button type="button" class="btn btn--primary" onclick={() => goto('/premium')}>
					Réessayer
				</button>
			</div>
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
		max-width: 380px;
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
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 1.75rem;
	}

	.btn {
		padding: 0.75rem 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: opacity 0.2s ease, border-color 0.2s ease;
	}

	.btn--primary {
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
	}
	.btn--primary:hover {
		opacity: 0.85;
	}

	.btn--secondary {
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--border);
	}
	.btn--secondary:hover {
		border-color: var(--fg);
	}
</style>