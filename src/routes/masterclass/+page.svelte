<script lang="ts">
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import CollectionCard from '$lib/features/vod/components/collection-card.svelte';

	type Collection = {
		id: string;
		title: string;
		slug: string;
		cover_image_url: string | null;
		is_public: boolean;
		created_at: string;
	};

	// Ta fonction `load` (+page.server.ts) doit déjà filtrer is_public = true
	// et trier par created_at desc avant d'envoyer les données ici.
	let { data }: { data: { collections: Collection[] } } = $props();
</script>

<svelte:head>
	<title>Masterclass</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Masterclass</span>
		<span class="catalog-number">{data.collections.length} collection{data.collections.length > 1 ? 's' : ''}</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Toutes les saisons</h1>
			<p class="subtitle">
				L'ensemble des masterclass disponibles, classées par ordre de publication.
			</p>
		</header>

		{#if data.collections.length === 0}
			<div class="empty-state">
				<GraduationCap size={22} strokeWidth={1.5} />
				<p class="empty-state__title">Aucune masterclass pour le moment</p>
				<p class="empty-state__body">Reviens bientôt, du nouveau contenu arrive.</p>
			</div>
		{:else}
			<div class="collection-grid">
				{#each data.collections as collection, i (collection.id)}
					<CollectionCard {collection} index={i} />
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

	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.catalog-number {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.archive__inner {
		max-width: 1180px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	.heading {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 3rem);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.subtitle {
		margin-top: 0.6rem;
		max-width: 46ch;
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--muted);
	}

	/* Empty state */
	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		border: 1px dashed var(--border);
		color: var(--muted);
	}
	.empty-state :global(svg) {
		margin-bottom: 1rem;
		color: var(--muted);
	}
	.empty-state__title {
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--fg);
	}
	.empty-state__body {
		margin-top: 0.3rem;
		font-size: 0.82rem;
	}

	/* Grid — même gouttière hairline que les autres pages */
	.collection-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		background: var(--border);
		margin-top: 2.5rem;
		border: 1px solid var(--border);
	}

	@media (min-width: 640px) {
		.collection-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.collection-grid { grid-template-columns: repeat(3, 1fr); }
	}
</style>