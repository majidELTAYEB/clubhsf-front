<script lang="ts">
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
    import videojs from 'video.js';
    import 'video.js/dist/video-js.css';
    import { onMount, onDestroy } from 'svelte';

    let { data } = $props();
    let video = $derived(data.video);
    let nextVideo = $derived(data.nextVideo);

    let videoEl: HTMLVideoElement;
    let player: ReturnType<typeof videojs>;

    // Dérive le domaine de la pull zone à partir de ThumbnailURL
    let pullZoneHost = $derived(
        video?.ThumbnailURL ? new URL(video.ThumbnailURL).hostname : ''
    );

    let hlsUrl = $derived(
        pullZoneHost && video?.BunnyVideoID
            ? `https://${pullZoneHost}/${video.BunnyVideoID}/playlist.m3u8`
            : ''
    );

    onMount(() => {
        if (hlsUrl) {
            player = videojs(videoEl, {
                controls: true,
                fluid: false,
                responsive: true,
                preload: 'metadata',
                poster: video.ThumbnailURL,
                sources: [{
                    src: hlsUrl,
                    type: 'application/x-mpegURL'
                }]
            });
        }
    });

    onDestroy(() => {
        player?.dispose();
    });

    // Numéro de catalogue — dérivé de l'ID, façon "N° 0142"
    let catalogNumber = $derived(
        String(video?.ID ?? video?.BunnyVideoID ?? 0)
            .replace(/\D/g, '')
            .slice(-4)
            .padStart(4, '0')
    );

    function formatDuration(seconds: number) {
        if (seconds < 60) return `${seconds}″`;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return s > 0 ? `${m}′${String(s).padStart(2, '0')}″` : `${m} MIN`;
    }
</script>

<div class="archive">
    <!-- Masthead : bleed sur toute la largeur, comme une une de magazine -->
    <div class="masthead">
        <button type="button" on:click={() => history.back()} class="back-link">
            <ArrowLeftIcon size={13} strokeWidth={1.75} />
            <span>Retour</span>
        </button>
        <span class="masthead__category">{(video.Category ?? 'Film').toUpperCase()}</span>
        <span class="catalog-number">N&deg; {catalogNumber}</span>
    </div>

    <div class="archive__inner">
        <!-- Photo — pas de lecteur, juste la miniature -->
        <div class="player-frame">
    {#if hlsUrl}
        <video bind:this={videoEl} class="video-js vjs-big-play-centered"></video>
    {:else}
        <img class="cover-img" src={video.ThumbnailURL} alt={video.Title} />
    {/if}
</div>

        <!-- Titre + byline -->
        <div class="heading">
            <h1 class="title">{video.Title}</h1>
            <div class="byline">
                <span>{formatDuration(video.DurationSeconds)}</span>
                <span class="byline__dot">&middot;</span>
                <span>{new Date(video.CreatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
        </div>

        <div class="archive__body">
            <div class="archive__main">
                <span class="eyebrow">Synopsis</span>
                <p class="description">
                    {video.Description ?? "Lorem ipsum is the graphic and publishing industry's standard dummy text. It is a scrambled version of classical Latin text derived from Cicero's De Finibus Bonorum et Malorum, altered to serve as a nonsensical placeholder."}
                </p>
            </div>

            <!-- <aside class="archive__aside">
                <span class="eyebrow">Ensuite</span>
                <a href="/videos/{nextVideo.slug}" class="next-entry">
                    <div class="next-entry__thumb">
                        <img src={nextVideo.thumbnail} alt={nextVideo.title} />
                    </div>
                    <div class="next-entry__text">
                        <span class="next-entry__category">{nextVideo.category}</span>
                        <span class="next-entry__title">{nextVideo.title}</span>
                        <span class="next-entry__cta">Regarder <ArrowRightIcon size={12} strokeWidth={1.75} /></span>
                    </div>
                </a>
            </aside> -->

            {#if nextVideo}
<aside class="archive__aside">
    <span class="eyebrow">Ensuite</span>
    <a href="/video/{nextVideo.video_id}?collection={data.collectionId}" class="next-entry">
        <div class="next-entry__thumb">
            <img src={nextVideo.thumbnail_url} alt={nextVideo.title} />
        </div>
        <div class="next-entry__text">
            <span class="next-entry__title">{nextVideo.title}</span>
            <span class="next-entry__cta">Regarder <ArrowRightIcon size={12} strokeWidth={1.75} /></span>
        </div>
    </a>
</aside>
{/if}
        </div>
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

    /* Masthead — bleed pleine largeur */
    .masthead {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border);
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--fg);
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        transition: opacity 0.2s ease;
    }
    .back-link:hover { opacity: 0.55; }

    .masthead__category {
        margin-left: auto;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        color: var(--fg);
    }

    .catalog-number {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.68rem;
        letter-spacing: 0.04em;
        color: var(--muted);
        padding-left: 1.25rem;
        border-left: 1px solid var(--border);
    }

    /* Contenu centré */
    .archive__inner {
        max-width: 980px;
        margin: 0 auto;
        padding: 2rem 1.5rem 6rem;
    }

    /* Photo */
    .player-frame {
        position: relative;
        overflow: hidden;
        background: #000;
        aspect-ratio: 16 / 9;
    }

    .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    /* Heading */
    .heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.75rem 1.5rem;
        margin-top: 2rem;
        padding-bottom: 1.75rem;
        border-bottom: 1px solid var(--border);
    }

    .title {
        font-family: 'Fraunces', serif;
        font-style: italic;
        font-weight: 500;
        font-size: clamp(1.6rem, 3.4vw, 2.35rem);
        line-height: 1.2;
        letter-spacing: -0.01em;
        max-width: 34ch;
    }

    .byline {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
        letter-spacing: 0.03em;
        color: var(--muted);
        white-space: nowrap;
    }
    .byline__dot { margin: 0 0.4rem; }

    /* Body grid */
    .archive__body {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2.5rem;
        margin-top: 2.5rem;
    }

    @media (min-width: 860px) {
        .archive__body {
            grid-template-columns: 2fr 1fr;
        }
    }

    .eyebrow {
        display: block;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 1rem;
    }

    .description {
        font-family: 'Fraunces', serif;
        font-size: 1.05rem;
        line-height: 1.7;
        color: #2b2a26;
        max-width: 58ch;
    }

    /* Next entry */
    .next-entry {
        display: block;
        text-decoration: none;
        color: inherit;
    }

    .next-entry__thumb {
        width: 100%;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        margin-bottom: 0.9rem;
    }
    .next-entry__thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: grayscale(1) contrast(1.05);
        transition: filter 0.4s ease;
    }
    .next-entry:hover .next-entry__thumb img {
        filter: grayscale(0);
    }

    .next-entry__text {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }
    .next-entry__category {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--muted);
    }
    .next-entry__title {
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .next-entry__cta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 0.3rem;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
    }

    .player-frame :global(.video-js) {
    width: 100%;
    height: 100%;
}
</style>