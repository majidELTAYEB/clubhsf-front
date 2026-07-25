<script lang="ts">
	import type { PageData } from './$types';

	import LivePlayer from '$lib/components/live-player.svelte';
	import LiveUpcoming from '$lib/components/live-upcoming.svelte';
	import LiveError from '$lib/components/live-error.svelte';

	let { data }: { data: PageData } = $props();

	let grant = $derived(data.grant);
	let error = $derived(data.error);

	let isLive = $derived(grant?.status === 'active' || grant?.status === 'disconnected');
	let isScheduled = $derived(grant?.status === 'scheduled');
	let isInactive = $derived(grant?.status === 'ended' || grant?.status === 'canceled');

	function formattedDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function statusLabel(status: string): string {
		if (status === 'active') return 'En direct';
		if (status === 'disconnected') return 'Reconnexion…';
		if (status === 'scheduled') return 'Programmé';
		if (status === 'canceled') return 'Annulé';
		return 'Terminé';
	}

	function errorMessage(code: string | null): string {
		if (code === 'missing_token') return "Ce lien d'accès est incomplet.";
		if (code === 'ACCESS_TOKEN_EXPIRED') return 'Ce lien a expiré. Contacte-nous pour en recevoir un nouveau.';
		if (code === 'ACCESS_TOKEN_INVALID') return "Ce lien d'accès est invalide.";
		if (code === 'ACCESS_PURCHASE_NOT_PAID') return "Cet achat n'est plus valide.";
		return "Impossible de vérifier ton accès à ce live.";
	}
</script>

<div class="archive">
	<div class="masthead">
		<span class="masthead__brand">Accès unique</span>
		{#if grant}
			<span class="masthead__status" class:masthead__status--live={isLive}>
				{#if isLive}
					<span class="pulse"><span class="pulse__ring"></span><span class="pulse__dot"></span></span>
				{/if}
				{statusLabel(grant.status)}
			</span>
			<span class="catalog-number">{grant.userEmail}</span>
		{/if}
	</div>

	<div class="archive__inner">
		{#if error || !grant}
			<LiveError title="Accès impossible" message={errorMessage(error)} />
		{:else}
			<div class="stage">
				<div class="stage__player">
					{#if isLive}
						<div class="player-frame">
							<LivePlayer playbackId={grant.muxPlaybackId} title={grant.title} />
						</div>
					{:else if isScheduled}
						<LiveUpcoming title={grant.title} scheduleAt={grant.scheduleAt ?? ''} />
					{:else if isInactive}
						<LiveError title="Live indisponible" message="Ce live est terminé ou a été annulé." />
					{/if}
				</div>
			</div>

			<div class="heading">
				<h1 class="title">{grant.title}</h1>
				{#if grant.scheduleAt}
					<span class="byline">{formattedDate(grant.scheduleAt)}</span>
				{/if}
			</div>

			{#if grant.description}
				<div class="description-panel">
					<span class="eyebrow">Description</span>
					<p class="description">{grant.description}</p>
				</div>
			{/if}
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

	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.masthead__brand {
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.masthead__status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.masthead__status--live {
		color: var(--accent);
		font-weight: 500;
	}

	.pulse {
		position: relative;
		display: inline-flex;
		width: 0.4rem;
		height: 0.4rem;
	}
	.pulse__ring {
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		background: var(--accent);
		opacity: 0.6;
		animation: pulse-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	.pulse__dot {
		position: relative;
		display: block;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: var(--accent);
	}
	@keyframes pulse-ping {
		75%, 100% { transform: scale(2.2); opacity: 0; }
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse__ring { animation: none; }
	}

	.catalog-number {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.archive__inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	.stage {
		display: flex;
		flex-direction: column;
	}

	.stage__player {
		min-width: 0;
	}

	.player-frame {
		overflow: hidden;
	}

	.heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.5rem, 3.2vw, 2.1rem);
		line-height: 1.25;
		letter-spacing: -0.01em;
		max-width: 36ch;
	}

	.byline {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--muted);
		white-space: nowrap;
	}

	.eyebrow {
		display: block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.description-panel {
		margin-top: 1.5rem;
		padding: 1.1rem 1.25rem;
		border: 1px solid var(--border);
	}
	.description {
		margin-top: 0.6rem;
		font-family: 'Fraunces', serif;
		font-size: 0.95rem;
		line-height: 1.65;
		color: #2b2a26;
		white-space: pre-line;
	}
</style>