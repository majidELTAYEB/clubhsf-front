src/routes/lives/[id]/+page.svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	import LivePlayer from '$lib/components/live-player.svelte';
	import LiveUpcoming from '$lib/components/live-upcoming.svelte';
	import LiveError from '$lib/components/live-error.svelte';
	import LiveChat from '$lib/components/live-chat.svelte';
	import { useLiveChat } from '$lib/hooks/use-live-chat.svelte';
	import { useViewerCount } from '$lib/hooks/use-viewer-count.svelte';

	let { data }: { data: PageData } = $props();
	let live = $derived(data.live);

	let isLive = $derived(live?.status === 'active' || live?.status === 'disconnected');
	let isScheduled = $derived(live?.status === 'scheduled');
	let isInactive = $derived(live?.status === 'ended' || live?.status === 'canceled');

	let copiedField = $state<string | null>(null);

	async function copy(value: string, field: string) {
		await navigator.clipboard.writeText(value);
		copiedField = field;
		setTimeout(() => (copiedField = null), 1500);
	}

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

	const chat = useLiveChat(live.id, data.wsToken ?? '');
	chat.setHistory(data.chatHistory);

	const viewerCount = useViewerCount(live.id);

	onMount(() => {
		chat.connect();
		viewerCount.start();

		return () => {
			chat.disconnect();
			viewerCount.stop();
		};
	});
</script>

{#snippet credentialField(label: string, value: string, field: string)}
	<div class="credential">
		<span class="credential__label">{label}</span>
		<div class="credential__row">
			<code class="credential__value">{value}</code>
			<button type="button" class="credential__copy" onclick={() => copy(value, field)} aria-label="Copier">
				{#if copiedField === field}
					<CheckIcon size={14} strokeWidth={2} />
				{:else}
					<CopyIcon size={14} strokeWidth={1.75} />
				{/if}
			</button>
		</div>
	</div>
{/snippet}

<div class="archive">
	<div class="masthead">
		<a href="/lives" class="back-link">
			<ArrowLeft size={13} strokeWidth={1.75} />
			<span>Lives</span>
		</a>
		{#if live}
			<span class="masthead__status" class:masthead__status--live={isLive}>
				{#if isLive}
					<span class="pulse"><span class="pulse__ring"></span><span class="pulse__dot"></span></span>
				{/if}
				{statusLabel(live.status)}
			</span>
			<span class="catalog-number">{viewerCount.count} spectateur{viewerCount.count > 1 ? 's' : ''}</span>
		{/if}
	</div>

	<div class="archive__inner">
		{#if !live}
			<LiveError message="Ce live n'existe pas ou a été supprimé." onRetry={() => location.reload()} />
		{:else}
			<div class="stage">
				<div class="stage__player">
					{#if isLive}
						<div class="player-frame">
							<LivePlayer playbackId={live.playback_id} title={live.title} />
						</div>
					{:else if isScheduled}
						<LiveUpcoming title={live.title} coverSrc={live.cover_url} scheduleAt={live.schedule_at} />
					{:else if isInactive}
						<LiveError title="Live indisponible" message="Ce live est terminé ou a été annulé." />
					{/if}
				</div>

				<div class="stage__chat">
					<LiveChat
						messages={chat.messages}
						onSend={(content) => chat.send(content)}
						disabled={!chat.connected}
						viewerCount={viewerCount.count}
					/>
				</div>
			</div>

			<div class="heading">
				<h1 class="title">{live.title}</h1>
				{#if live.schedule_at}
					<span class="byline">{formattedDate(live.schedule_at)}</span>
				{/if}
			</div>

			{#if live.description}
				<div class="description-panel">
					<span class="eyebrow">Description</span>
					<p class="description">{live.description}</p>
				</div>
			{/if}

			{#if live.stream_key && live.rtmp_url}
				<div class="obs-panel">
					<div class="obs-panel__head">
						<span class="eyebrow">Configuration OBS</span>
						<p class="obs-panel__hint">Utilise ces informations pour démarrer ton stream.</p>
					</div>
					<div class="obs-panel__fields">
						{@render credentialField('URL du serveur (RTMP)', live.rtmp_url, 'rtmp')}
						{@render credentialField('Clé de stream', live.stream_key, 'key')}
					</div>
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
		max-width: 1180px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	/* Player + chat */
	.stage {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	@media (min-width: 1024px) {
		.stage {
			flex-direction: row;
			align-items: stretch;
		}
	}

	.stage__player {
		min-width: 0;
		flex: 1;
	}
	.stage__chat {
		display: flex;
		width: 100%;
		flex-shrink: 0;
	}
	@media (min-width: 1024px) {
		.stage__chat { width: 340px; }
	}

	.player-frame {
		height: 100%;
		overflow: hidden;
		border: 1px solid var(--border);
	}

	/* Heading */
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

	/* Description */
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

	/* OBS panel */
	.obs-panel {
		margin-top: 1.5rem;
		border: 1px solid var(--border);
	}
	.obs-panel__head {
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--border);
	}
	.obs-panel__hint {
		margin-top: 0.4rem;
		font-size: 0.82rem;
		color: var(--muted);
	}
	.obs-panel__fields {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		padding: 1.25rem;
	}

	.credential {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.credential__label {
		font-size: 0.78rem;
		color: var(--muted);
	}
	.credential__row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.credential__value {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0.55rem 0.8rem;
		border: 1px solid var(--border);
		background: #f8f7f3;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
	}
	.credential__copy {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.2rem;
		height: 2.2rem;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--fg);
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	.credential__copy:hover {
		border-color: var(--fg);
	}
</style>