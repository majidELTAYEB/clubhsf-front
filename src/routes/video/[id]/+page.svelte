<script lang="ts">
    import { onMount } from 'svelte';
    import videojs from 'video.js';
    import 'video.js/dist/video-js.css';

    // Imports d'icônes corrigés selon votre méthode
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    	import { goto } from '$app/navigation';

    let { data } = $props();
    let video = $derived(data.videos);

    // Données fictives pour la navigation
    const nextVideo = {
        title: "Lacrim - Interview Exclusive",
        slug: "lacrim-interview",
        thumbnail: "https://vz-5150d03d-416.b-cdn.net/2a3a28ad-1149-4506-87df-a561bbcd3a84/thumbnail.jpg"
    };

    let videoElement: HTMLVideoElement;
    let player: videojs.Player;
    let isReady = $state(false);

    onMount(() => {
        const hlsUrl = `https://vz-5150d03d-416.b-cdn.net/${video.BunnyVideoID}/playlist.m3u8`;

        player = videojs(videoElement, {
            controls: true,
            responsive: true,
            fluid: true,
            html5: { vhs: { overrideNative: true } },
            sources: [{ src: hlsUrl, type: 'application/x-mpegURL' }]
        });

        player.ready(() => isReady = true);
        return () => player?.dispose();
    });
</script>

<div class="container mx-auto w-full px-4 py-10">
    <!-- Navigation Retour -->
    <button
	type="button"
	on:click={() => history.back()}
	class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
>
	<ArrowLeftIcon size={16} />
	Retour
</button>

    <!-- Lecteur -->
    <div class="relative overflow-hidden border border-border bg-black transition-opacity duration-500"
         class:opacity-100={isReady} class:opacity-0={!isReady}>
        <video bind:this={videoElement} class="video-js vjs-big-play-centered" poster={video.ThumbnailURL} playsinline>
            <track kind="captions" />
        </video>
    </div>

    <!-- Info Vidéo -->
    <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2">
            <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{video.Title}</h1>

            <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div class="flex items-center gap-1.5">
                    <ClockIcon size={16} />
                    {video.DurationSeconds < 60
                        ? `${video.DurationSeconds} s`
                        : `${Math.floor(video.DurationSeconds / 60)} min`}
                </div>
                <div class="flex items-center gap-1.5">
                    <CalendarDaysIcon size={16} /> {new Date(video.CreatedAt).toLocaleDateString('fr-FR')}
                </div>
            </div>

            <div class="mt-6 border-t border-border pt-6">
                <span class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Description
                </span>
                <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {video.Description ?? "Lorem ipsum is the graphic and publishing industry's standard dummy text. It is a scrambled version of classical Latin text derived from Cicero's De Finibus Bonorum et Malorum, altered to serve as a nonsensical placeholder. Designers use it to visualize layouts and typography without the text's actual meaning distracting from the visual form."}
                </p>
            </div>
        </div>

        <!-- Vidéo suivante -->
        <aside class="lg:col-span-1">
            <div class="border border-border">
                <div class="border-b border-border px-4 py-3">
                    <span class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Ensuite
                    </span>
                </div>
                <a href="/videos/{nextVideo.slug}" class="group flex items-center gap-3 p-4 transition-colors hover:bg-muted/50">
                    <img src={nextVideo.thumbnail} alt="Next" class="h-16 w-28 shrink-0 object-cover" />
                    <div class="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span class="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{nextVideo.title}</span>
                        <div class="flex h-7 w-7 shrink-0 items-center justify-center border border-border text-foreground transition-colors group-hover:border-foreground/40">
                            <ChevronRightIcon size={16} />
                        </div>
                    </div>
                </a>
            </div>
        </aside>
    </div>
</div>

<style>
    :global(.vjs-play-progress) { background-color: #ef4444; }
</style>