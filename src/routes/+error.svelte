<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CompassIcon from "@lucide/svelte/icons/compass";

	let status = $derived(page.status);
	let message = $derived(
		page.status === 404
			? "Cette page n'existe pas ou a été déplacée."
			: (page.error?.message ?? "Une erreur inattendue est survenue.")
	);
</script>

<svelte:head>
	<title>{status} — Erreur</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Erreur</span>
	</div>

	<div class="archive__inner">
		<div class="card">
			<span class="card__code">{status}</span>

			<h1 class="title">
				{status === 404 ? "Page introuvable" : "Quelque chose a mal tourné"}
			</h1>
			<p class="body">{message}</p>

			<div class="actions">
				<button type="button" class="btn btn--primary" onclick={() => goto('/masterclass')}>
					Retour à l'accueil
				</button>
				<button type="button" class="btn btn--secondary" onclick={() => history.back()}>
					Page précédente
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
		max-width: 420px;
		padding: 2.5rem 1.75rem;
		border: 1px solid var(--border);
		text-align: center;
	}

	.card__code {
		display: block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		color: var(--accent);
		margin-bottom: 1rem;
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.75rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.body {
		margin-top: 0.65rem;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 2rem;
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