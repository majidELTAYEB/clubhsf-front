<!-- <script lang="ts">
	import type { PageData } from './$types';
	import LiveCard from '$lib/components/live-card.svelte';
	import TabsComp from '$lib/components/tabs-comp.svelte';

	let { data }: { data: PageData } = $props();
	let lives = $derived(data.lives);

	let liveLives = $derived(lives.filter((l) => l.status === 'active' || l.status === 'disconnected' ));
	let upcomingLives = $derived(lives.filter((l) => l.status === 'scheduled'));
	let pastLives = $derived(lives.filter((l) => l.status === 'ended' || l.status === 'canceled'));

	let tabs = $derived([
		{ value: 'live', label: 'En direct', count: liveLives.length },
		{ value: 'upcoming', label: 'À venir', count: upcomingLives.length }
	]);

	let activeTab = $state('live');

	let visibleLives = $derived(activeTab === 'live' ? liveLives : upcomingLives);
</script>

<div class="mx-auto w-full space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold tracking-tight">Lives</h1>
		
	</div>
	<div class="flex justify-center items-center">
		<TabsComp {tabs} bind:value={activeTab} />
	</div>

	{#if visibleLives.length === 0}
		<p class="text-muted-foreground text-sm">Aucun live pour le moment.</p>
	{:else}
		<div
			class="grid gap-x-[60px] gap-y-[60px]"
			style="grid-template-columns: repeat(auto-fill, minmax(280px, 350px));"
		>
			{#each visibleLives as live (live.id)}
				<LiveCard
					id={live.id}
					title={live.title}
					coverSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYgL_GL13WTqfNUPVSCoPss4QMTCdJxR8hPotmPpg_m_yeHiM4mGaVJ6s&s=10"
					status={live.status}
					scheduleAt={live.schedule_at}
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
<!-- </div> --> 


<script lang="ts">
	import type { PageData } from './$types';
	import LiveCard from '$lib/components/live-card.svelte';
	import TabsComp from '$lib/components/tabs-comp.svelte';

	let { data }: { data: PageData } = $props();
	let lives = $derived(data.lives);

	let liveLives = $derived(lives.filter((l) => l.status === 'active' || l.status === 'disconnected' ));
	let upcomingLives = $derived(lives.filter((l) => l.status === 'scheduled'));
	let pastLives = $derived(lives.filter((l) => l.status === 'ended' || l.status === 'canceled'));

	let tabs = $derived([
		{ value: 'live', label: 'En direct', count: liveLives.length },
		{ value: 'upcoming', label: 'À venir', count: upcomingLives.length }
	]);

	let activeTab = $state('live');

	let visibleLives = $derived(activeTab === 'live' ? liveLives : upcomingLives);
</script>

<div class="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
	<header class="border-b border-border pb-6">
		<span class="text-xs font-medium uppercase tracking-widest text-muted-foreground">
			Lives
		</span>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			{activeTab === 'live' ? 'En direct' : 'À venir'}
		</h1>
	</header>

	<div class="flex justify-center">
		<TabsComp {tabs} bind:value={activeTab} />
	</div>

	{#if visibleLives.length === 0}
		<div class="flex flex-col items-center justify-center border border-dashed border-border py-24 text-center">
			<p class="text-sm font-medium text-foreground">
				{activeTab === 'live' ? 'Aucun live en ce moment' : 'Aucun live à venir'}
			</p>
			<p class="mt-1 text-sm text-muted-foreground">Reviens bientôt, du nouveau contenu arrive.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each visibleLives as live (live.id)}
				<LiveCard
					id={live.id}
					title={live.title}
					coverSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYgL_GL13WTqfNUPVSCoPss4QMTCdJxR8hPotmPpg_m_yeHiM4mGaVJ6s&s=10"
					status={live.status}
					scheduleAt={live.schedule_at}
				/>
			{/each}
		</div>
	{/if}
</div>