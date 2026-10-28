<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import videojs from 'video.js';
	import 'video.js/dist/video-js.css';
	import { onDestroy } from 'svelte';

	let { data } = $props();
	let video = $derived(data.video);
	let nextVideo = $derived(data.nextVideo);

	let videoEl: HTMLVideoElement | undefined = $state();
	let player: ReturnType<typeof videojs> | undefined;

	let pullZoneHost = $derived(video?.ThumbnailURL ? new URL(video.ThumbnailURL).hostname : '');

	let hlsUrl = $derived(
		video?.PlaybackURL ||
			(pullZoneHost && video?.BunnyVideoID
				? `https://${pullZoneHost}/${video.BunnyVideoID}/playlist.m3u8`
				: '')
	);

	// Un seul point d'entrée : crée le player au premier passage,
	// puis change juste la source quand on navigue vers la vidéo suivante.
	$effect(() => {
		if (!hlsUrl || !videoEl) return;

		if (player) {
			player.poster(video.ThumbnailURL);
			player.src({ src: hlsUrl, type: 'application/x-mpegURL' });
		} else {
			player = videojs(videoEl, {
				controls: true,
				fluid: false,
				responsive: true,
				preload: 'metadata',
				poster: video.ThumbnailURL,
				sources: [{ src: hlsUrl, type: 'application/x-mpegURL' }]
			});
		}
	});

	onDestroy(() => {
		player?.dispose();
	});

	function formatDuration(seconds: number) {
		if (seconds < 60) return `${seconds}″`;
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return s > 0 ? `${m}′${String(s).padStart(2, '0')}″` : `${m} min`;
	}
</script>

<div class="archive">
	<div class="masthead">
		<button type="button" onclick={() => history.back()} class="back-link">
			<ArrowLeftIcon size={16} strokeWidth={2} />
			<span>Retour</span>
		</button>
		<span class="masthead__category">{video.Category ?? 'Film'}</span>
	</div>

	<div class="archive__inner">
		<!-- Lecteur, ou simple miniature s'il n'y a pas de source -->
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
				<span>
					{new Date(video.CreatedAt).toLocaleDateString('fr-FR', {
						day: '2-digit',
						month: 'short',
						year: 'numeric'
					})}
				</span>
			</div>
		</div>

		<div class="archive__body">
			<div class="archive__main">
				<h2 class="section-label">Synopsis</h2>
				<p class="description">
					{video.Description}
				</p>
			</div>

			{#if nextVideo}
				<aside class="archive__aside">
					<h2 class="section-label">Ensuite</h2>
					<a
						href="/video/{nextVideo.video.video_id}?collection={data.collectionId}"
						class="next-entry"
					>
						<div class="next-entry__thumb">
							<img src={nextVideo.video.thumbnail_url} alt={nextVideo.video.title} />
						</div>
						<div class="next-entry__text">
							<span class="next-entry__title">{nextVideo.video.title}</span>
							<span class="next-entry__cta">
								Regarder <ArrowRightIcon size={14} strokeWidth={2} />
							</span>
						</div>
					</a>
				</aside>
			{/if}
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Débloque le scroll du document (une seule fois) */
	:global(html),
	:global(body) {
		height: auto !important;
		min-height: 100% !important;
		overflow-y: auto !important;
		overflow-x: hidden !important;
	}

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		min-height: 100dvh;
		height: auto;
		overflow: visible;
	}

	.archive a:focus-visible,
	.archive button:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}

	/* Masthead */
	.masthead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--fg);
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
		transition: opacity 0.2s ease;
	}
	.back-link:hover {
		opacity: 0.55;
	}

	.masthead__category {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
	}

	/* Contenu centré */
	.archive__inner {
		max-width: 980px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	/* Lecteur */
	.player-frame {
		position: relative;
		overflow: hidden;
		background: #000;
		border: 1px solid var(--rule);
		aspect-ratio: 16 / 9;
	}

	.cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.player-frame :global(.video-js) {
		width: 100%;
		height: 100%;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}

	/* Habillage video.js : carré, noir et blanc, sans arrondis */
	.player-frame :global(.video-js .vjs-big-play-button) {
		border-radius: 0;
		border: 1px solid #fff;
		background-color: #000;
	}
	.player-frame :global(.video-js:hover .vjs-big-play-button),
	.player-frame :global(.video-js .vjs-big-play-button:focus) {
		background-color: #fff;
		color: #000;
		border-color: #fff;
	}
	.player-frame :global(.video-js .vjs-control-bar) {
		background-color: #000;
	}

	/* Heading */
	.heading {
		margin-top: 2rem;
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--rule);
	}

	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(2.2rem, 6.5vw, 4.5rem);
		line-height: 0.95;
		letter-spacing: -0.04em;
		max-width: 22ch;
		word-break: break-word;
	}

	.byline {
		margin-top: 1rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
	}
	.byline__dot {
		margin: 0 0.5rem;
	}

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
			gap: 3rem;
		}
	}

	.section-label {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.5rem, 3vw, 2rem);
		line-height: 1;
		letter-spacing: -0.035em;
		margin-bottom: 1rem;
	}

	.description {
		font-size: 1.05rem;
		line-height: 1.7;
		color: #222;
		max-width: 58ch;
	}

	/* Entrée suivante : la carte s'inverse en noir au survol */
	.next-entry {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--rule);
		text-decoration: none;
		color: inherit;
		background: var(--bg);
		transition: background-color 0.25s ease, color 0.25s ease;
	}
	.next-entry:hover,
	.next-entry:focus-visible {
		background: var(--fg);
		color: var(--bg);
	}

	.next-entry__thumb {
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-bottom: 1px solid var(--rule);
		background: #eee;
	}
	.next-entry__thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(1) contrast(1.05);
		transition: filter 0.4s ease;
	}
	.next-entry:hover .next-entry__thumb img,
	.next-entry:focus-visible .next-entry__thumb img {
		filter: grayscale(0);
	}

	.next-entry__text {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1rem 1.1rem 1.25rem;
	}
	.next-entry__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.3rem;
		line-height: 1.08;
		letter-spacing: -0.03em;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.next-entry__cta {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.88rem;
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		.back-link,
		.next-entry,
		.next-entry__thumb img {
			transition: none;
		}
	}
</style>