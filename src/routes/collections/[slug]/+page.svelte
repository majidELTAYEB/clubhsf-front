<script lang="ts">
	import type { PageData } from './$types';
	import CollectionCard from '$lib/components/collection-card.svelte';
	import TabsComp from '$lib/components/tabs-comp.svelte';

	let { data }: { data: PageData } = $props();
	let collections = $derived(data.collections);




</script>

<div class="mx-auto w-full space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold tracking-tight">Collections</h1>
		
	</div>

	{#if collections.data.length === 0}
		<p class="text-muted-foreground text-sm">Aucune collection pour le moment.</p>
	{:else}
		<div
			class="grid gap-x-[60px] gap-y-[60px]"
			style="grid-template-columns: repeat(auto-fill, minmax(280px, 350px));"
		>
			{#each collections.data as collection (collection.id)}
				<CollectionCard
                    data={collection}
				/>
			{/each}
		</div>
	{/if}

	<!-- {#if pastLives.length > 0}
		<div class="space-y-4 border-t pt-6">
			<h2 class="text-muted-foreground text-sm font-medium">Terminés / annulés</h2>
			<div
				class="grid gap-x-[60px] gap-y-[60px]"
				style="grid-template-columns: repeat(auto-fill, minmax(280px, 350px));"
			>
				{#each pastLives as live (live.id)}
					<LiveCard
						id={live.id}
						title={live.title}
						coverSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYgL_GL13WTqfNUPVSCoPss4QMTCdJxR8hPotmPpg_m_yeHiM4mGaVJ6s&s=10"
						status={live.status}
						scheduleAt={live.schedule_at}
					/>
				{/each}
			</div>
		</div>
	{/if} -->
</div>