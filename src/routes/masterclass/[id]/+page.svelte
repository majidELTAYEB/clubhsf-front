<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Clock from '@lucide/svelte/icons/clock';
	import Play from '@lucide/svelte/icons/play';
	import { formatDuration, formatTotalDuration } from '$lib/utils/masterclass';

	type Video = {
		ID: string;
		Title: string;
		Description: string | null;
		Position: number;
		DurationSeconds: number;
		ThumbnailURL: string;
	};

	type Collection = {
		id: string;
		title: string;
		slug: string;
		description: string;
		cover_image_url: string | null;
	};

	let { data }: { data: { collection: Collection; videos: Video[] } } = $props();

	let totalDuration = $derived(data.videos.reduce((sum, v) => sum + v.DurationSeconds, 0));
</script>

<svelte:head>
	<title>{data.collection.title} — Masterclass</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<a
		href="/masterclass"
		class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		Toutes les masterclass
	</a>

	<header class="mb-8 border-b border-border pb-6">
		<h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
			{data.collection.title}
		</h1>
		{#if data.collection.description}
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">{data.collection.description}</p>
		{/if}
		<div class="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
			<span>{data.videos.length} vidéo{data.videos.length > 1 ? 's' : ''}</span>
			<span class="flex items-center gap-1">
				<Clock class="h-3.5 w-3.5" />
				{formatTotalDuration(totalDuration)}
			</span>
		</div>
	</header>

	{#if data.videos.length === 0}
		<div class="border border-dashed border-border py-24 text-center">
			<p class="text-sm text-muted-foreground">Aucune vidéo disponible dans cette collection.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.videos as video (video.ID)}
				<a
					href={`/video/${video.ID}`}
					class="group block border border-border bg-card transition-colors hover:border-foreground/30"
				>
					<div class="relative aspect-video w-full overflow-hidden bg-muted">
						{#if video.ThumbnailURL}
							<img
								src={video.ThumbnailURL}
								alt={video.Title}
								loading="lazy"
								class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
							/>
						{/if}

						<div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
							<div
								class="flex h-11 w-11 items-center justify-center border border-white/40 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
							>
								<Play class="h-4 w-4 fill-white text-white" />
							</div>
						</div>

						<span
							class="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white"
						>
							{formatDuration(video.DurationSeconds)}
						</span>
					</div>

					<div class="p-3">
						<span class="text-xs font-medium text-muted-foreground">
							{String(video.Position + 1).padStart(2, '0')}
						</span>
						<h3 class="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
							{video.Title}
						</h3>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>