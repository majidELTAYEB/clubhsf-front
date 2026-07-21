<script lang="ts">
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
    import CollectionCard from '$lib/features/vod/components/collection-card.svelte'

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

<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<header class="mb-10 border-b border-border pb-6">
		<span class="text-xs font-medium uppercase tracking-widest text-muted-foreground">
			Masterclass
		</span>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			Toutes les saisons
		</h1>
		<p class="mt-2 max-w-xl text-sm text-muted-foreground">
			{data.collections.length} collection{data.collections.length > 1 ? 's' : ''} disponible{data
				.collections.length > 1
				? 's'
				: ''}.
		</p>
	</header>

	{#if data.collections.length === 0}
		<div class="flex flex-col items-center justify-center border border-dashed border-border py-24 text-center">
			<GraduationCap class="mb-4 h-8 w-8 text-muted-foreground" />
			<p class="text-sm font-medium text-foreground">Aucune masterclass pour le moment</p>
			<p class="mt-1 text-sm text-muted-foreground">Reviens bientôt, du nouveau contenu arrive.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.collections as collection (collection.id)}
				<CollectionCard {collection} />
			{/each}
		</div>
	{/if}
</div>