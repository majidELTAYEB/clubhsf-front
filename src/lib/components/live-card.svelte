<!-- src/lib/components/live-tile.svelte
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';

	let {
		id,
		title,
		coverSrc,
		status,
		scheduleAt
	}: {
		id: string;
		title: string;
		coverSrc: string;
		status: string;
		scheduleAt?: string | null;
	} = $props();

	function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
		if (status === 'active') return 'default';
		if (status === 'scheduled') return 'secondary';
		return 'outline';
	}

	function timeUntil(dateStr: string): string {
		const diffMs = new Date(dateStr).getTime() - Date.now();
		if (diffMs <= 0) return 'bientôt';

		const minutes = Math.floor(diffMs / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `dans ${days} j`;
		if (hours > 0) return `dans ${hours} h`;
		return `dans ${minutes} min`;
	}

	let isScheduled = $derived(status === 'scheduled');
	let isActive = $derived(status === 'active');
	let isInactive = $derived(status === 'ended' || status === 'canceled');
	let countdown = $derived(scheduleAt ? timeUntil(scheduleAt) : null);
</script>

<svelte:element
	this={isInactive ? 'div' : 'a'}
	class="group flex flex-col gap-2"
	class:opacity-50={isScheduled || isInactive}
	class:cursor-not-allowed={isInactive}
	href={isInactive ? undefined : `/lives/${id}`}
	aria-disabled={isInactive}
>
	<div class="border-border relative overflow-hidden rounded-xl border">
		<AspectRatio ratio={1}>
			<img
				src={coverSrc}
				alt="Cover du live {title}"
				class="h-full w-full object-cover transition-transform duration-300 ease-out"
				class:grayscale={isScheduled || isInactive}
				class:group-hover:scale-105={!isInactive}
				loading="lazy"
			/>
		</AspectRatio>

		<Badge variant={statusVariant(status)} class="absolute top-3 left-3 gap-1.5">
			{#if isActive}
				<span class="relative flex size-1.5">
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
					<span class="relative inline-flex size-1.5 rounded-full bg-red-500"></span>
				</span>
				Live
			{:else if isScheduled}
				{countdown ?? 'Programmé'}
			{:else}
				{status}
			{/if}
		</Badge>
	</div>
	<div class="space-y-1">
		<p class="text-sm leading-none font-medium">{title}</p>
		<p class="text-muted-foreground text-sm">
	{scheduleAt
		? new Date(scheduleAt).toLocaleString('fr-FR', {
				day: 'numeric',
				month: 'long',
				hour: '2-digit',
				minute: '2-digit'
			})
		: ''}
</p>
	</div>
</svelte:element> -->

<!-- src/lib/components/live-tile.svelte -->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';

	let {
		id,
		title,
		coverSrc,
		status,
		scheduleAt
	}: {
		id: string;
		title: string;
		coverSrc: string;
		status: string;
		scheduleAt?: string | null;
	} = $props();

	function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
		if (status === 'active') return 'default';
		if (status === 'scheduled') return 'secondary';
		return 'outline';
	}

	function timeUntil(dateStr: string): string {
		const diffMs = new Date(dateStr).getTime() - Date.now();
		if (diffMs <= 0) return 'bientôt';

		const minutes = Math.floor(diffMs / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `dans ${days} j`;
		if (hours > 0) return `dans ${hours} h`;
		return `dans ${minutes} min`;
	}

	let isScheduled = $derived(status === 'scheduled');
	let isActive = $derived(status === 'active');
	let isInactive = $derived(status === 'ended' || status === 'canceled');
	let countdown = $derived(scheduleAt ? timeUntil(scheduleAt) : null);
</script>

<svelte:element
	this={isInactive ? 'div' : 'a'}
	class={`group block border border-border bg-card transition-colors ${
		isScheduled || isInactive ? 'opacity-50' : ''
	} ${isInactive ? 'cursor-not-allowed' : 'hover:border-foreground/30'}`}
	href={isInactive ? undefined : `/lives/${id}`}
	aria-disabled={isInactive}
>
	<div class="relative overflow-hidden">
		<AspectRatio ratio={1}>
			<img
				src={coverSrc}
				alt="Cover du live {title}"
				class="h-full w-full object-cover transition-transform duration-300 ease-out"
				class:grayscale={isScheduled || isInactive}
				class:group-hover:scale-105={!isInactive}
				loading="lazy"
			/>

			<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>

			<Badge variant={statusVariant(status)} class="absolute top-3 left-3 gap-1.5">
				{#if isActive}
					<span class="relative flex size-1.5">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
						<span class="relative inline-flex size-1.5 rounded-full bg-red-500"></span>
					</span>
					Live
				{:else if isScheduled}
					{countdown ?? 'Programmé'}
				{:else}
					{status}
				{/if}
			</Badge>

			<div class="absolute inset-x-0 bottom-0 p-4">
				<p class="line-clamp-2 text-sm font-semibold leading-snug text-white">{title}</p>
				{#if scheduleAt}
					<p class="mt-1 text-xs text-white/60">
						{new Date(scheduleAt).toLocaleString('fr-FR', {
							day: 'numeric',
							month: 'long',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				{/if}
			</div>
		</AspectRatio>
	</div>
</svelte:element>