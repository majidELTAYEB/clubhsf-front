<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import { gradientFromString, formatRelativeDate } from '$lib/utils/masterclass';

	type Collection = {
		id: string;
		title: string;
		slug: string;
		cover_image_url: string | null;
		created_at: string;
	};

	let { collection }: { collection: Collection } = $props();

	let hasCover = $derived(!!collection.cover_image_url);
</script>

<a
	href={`/masterclass/${collection.id}`}
	class="group relative block overflow-hidden border border-border bg-card transition-colors hover:border-foreground/30"
>
	<div class="relative aspect-video w-full overflow-hidden">
		{#if hasCover}
			<img
				src={collection.cover_image_url}
				alt={collection.title}
				loading="lazy"
				class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
			/>
		{:else}
			<div
				class="h-full w-full"
				style={`background: ${gradientFromString(collection.title)}`}
			></div>
		{/if}

		<!-- Scrim -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
		></div>

		<!-- Play affordance au hover -->
		<!-- <div
			class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		>
			<div class="flex h-12 w-12 items-center justify-center border border-white/40 bg-black/40 backdrop-blur-sm">
				<Play class="h-5 w-5 fill-white text-white" />
			</div>
		</div> -->

		<!-- Titre -->
		<div class="absolute inset-x-0 bottom-0 p-4">
			<h3 class="line-clamp-2 text-base font-semibold leading-snug text-white">
				{collection.title}
			</h3>
			<p class="mt-1 text-xs text-white/60">
				{formatRelativeDate(collection.created_at)}
			</p>
		</div>
	</div>
</a>