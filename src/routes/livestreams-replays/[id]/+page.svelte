<!-- src/routes/[id]/+page.svelte -->
<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import LivePlayer from '$lib/components/live-player.svelte';

	type Live = {
		id: string;
		title: string;
        description?: string;
		schedule_at: string;
		status: string;
		playback_id: string;
	};

	let { data }: { data: { live: Live } } = $props();
	let live = $derived(data.live);

	// "ended" = replay jouable via le même playback_id Mux que le live en direct.
	// "canceled" (ou tout autre statut) = rien à lire.
	let isReplayable = $derived(live.status === 'ended' && !!live.playback_id);
</script>

<svelte:head>
	<title>{live.title} — Replay</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/livestreams-replays" class="back-link">
			<ArrowLeftIcon size={13} strokeWidth={1.75} />
			<span>Replays</span>
		</a>
		<span class="masthead__category">Replay</span>
	</div>

	<div class="archive__inner">
		{#if isReplayable}
			<div class="player-frame">
				<LivePlayer playbackId={live.playback_id} title={live.title} streamType="on-demand" />
			</div>
		{:else}
			<div class="unavailable">
				<p>Ce replay n'est pas disponible.</p>
			</div>
		{/if}

		<div class="heading">
			<h1 class="title">{live.title}</h1>
			<span class="byline">
				{new Date(live.schedule_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
			</span>
            
		</div>
        {#if live.description}
            <p class="description">{live.description}</p>
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
        .description {
        margin-top: 1.25rem;
        max-width: 62ch;
        font-size: 0.95rem;
        line-height: 1.65;
        color: var(--muted);
    }

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
		color: var(--fg);
		text-decoration: none;
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

	.archive__inner {
		max-width: 980px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	.player-frame {
		position: relative;
		overflow: hidden;
		background: #000;
		aspect-ratio: 16 / 9;
	}

	.unavailable {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 9;
		background: #100f0d;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.85rem;
	}

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
</style>