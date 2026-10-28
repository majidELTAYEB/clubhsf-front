<!-- <script lang="ts">
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
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';
	import { getWsToken } from '$lib/assets/api/ws-token';


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

const chat = useLiveChat(live.id, async () => (await getWsToken()).token);
	chat.setHistory(data.chatHistory);

	const viewerCount = useViewerCount(live.id);

	$effect(() => {
	if (isLive) {
		chat.connect();
		viewerCount.start();
	}
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
			<div class="masthead__right">
		<NotificationCenter />

	</div>
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
  padding-top: calc(1rem + env(safe-area-inset-top));
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
		max-width: 1480px;
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
			height: 100%;
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
		.stage__chat { width: 340px; height: 100%; }
	}

	.player-frame {
		height: 100%;
		overflow: hidden;
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
</style> -->


<!-- src/routes/lives/[id]/+page.svelte -->
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
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';
	import { getWsToken } from '$lib/assets/api/ws-token';

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

	const chat = useLiveChat(live.id, async () => (await getWsToken()).token);
	chat.setHistory(data.chatHistory);

	const viewerCount = useViewerCount(live.id);

	$effect(() => {
		if (isLive) {
			chat.connect();
			viewerCount.start();
		}
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
			<button
				type="button"
				class="credential__copy"
				onclick={() => copy(value, field)}
				aria-label="Copier"
			>
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
			<ArrowLeft size={16} strokeWidth={2} />
			<span>Lives</span>
		</a>

		{#if live}
			<span class="badge" class:badge--live={isLive}>
				{#if isLive}
					<span class="pulse"><span class="pulse__ring"></span><span class="pulse__dot"></span></span>
				{/if}
				{statusLabel(live.status)}
			</span>
			<span class="viewers">
				{viewerCount.count} spectateur{viewerCount.count > 1 ? 's' : ''}
			</span>
		{/if}

		<div class="masthead__right">
			<NotificationCenter />
		</div>
	</div>

	<div class="archive__inner">
		{#if !live}
			<LiveError
				message="Ce live n'existe pas ou a été supprimé."
				onRetry={() => location.reload()}
			/>
		{:else}
			<div class="stage">
				<div class="stage__player">
					{#if isLive}
						<div class="player-frame">
							<LivePlayer playbackId={live.playback_id} title={live.title} />
						</div>
					{:else if isScheduled}
						<LiveUpcoming
							title={live.title}
							coverSrc={live.cover_url}
							scheduleAt={live.schedule_at}
						/>
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

			<header class="heading">
				<h1 class="title">
					<span class="title__mask">
						<span class="title__in">{live.title}</span>
					</span>
				</h1>
				{#if live.schedule_at}
					<p class="byline">{formattedDate(live.schedule_at)}</p>
				{/if}
			</header>

			{#if live.description || (live.stream_key && live.rtmp_url)}
				<div class="panels" class:panels--single={!(live.description && live.stream_key && live.rtmp_url)}>
					{#if live.description}
						<section class="panel">
							<h2 class="panel__title">Description</h2>
							<p class="description">{live.description}</p>
						</section>
					{/if}

					{#if live.stream_key && live.rtmp_url}
						<section class="panel">
							<h2 class="panel__title">Configuration OBS</h2>
							<p class="panel__hint">Utilise ces informations pour démarrer ton stream.</p>
							<div class="panel__fields">
								{@render credentialField('URL du serveur (RTMP)', live.rtmp_url, 'rtmp')}
								{@render credentialField('Clé de stream', live.stream_key, 'key')}
							</div>
						</section>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		min-height: 100%;
	}

	.archive a:focus-visible,
	.archive button:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}

	/* Masthead : même structure que la page liste */
	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
	}

	.masthead__right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
		color: var(--fg);
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	/* Badge carré, noir plein quand c'est en direct */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0.65rem;
		background: #fff;
		color: #000;
		border: 1px solid #000;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.2;
	}
	.badge--live {
		background: #000;
		color: #fff;
	}

	.pulse {
		position: relative;
		display: inline-flex;
		width: 0.45rem;
		height: 0.45rem;
	}
	.pulse__ring {
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		background: #fff;
		opacity: 0.75;
		animation: pulse-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	.pulse__dot {
		position: relative;
		display: block;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
		background: #fff;
	}
	@keyframes pulse-ping {
		75%,
		100% {
			transform: scale(2.2);
			opacity: 0;
		}
	}

	.viewers {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
	}

	.archive__inner {
		max-width: 1480px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	/* Player + chat, encadrés de filets noirs */
	.stage {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--rule);
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
		background: #100f0d;
	}

	.stage__chat {
		display: flex;
		width: 100%;
		flex-shrink: 0;
		background: var(--bg);
		border-top: 1px solid var(--rule);
	}
	@media (min-width: 1024px) {
		.stage__chat {
			width: 340px;
			border-top: none;
			border-left: 1px solid var(--rule);
		}
	}

	.player-frame {
		height: 100%;
		overflow: hidden;
	}

	/* Titre : révélé une seule fois au chargement */
	.heading {
		padding-top: 2.5rem;
	}

	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(2.5rem, 8vw, 6rem);
		line-height: 0.92;
		letter-spacing: -0.045em;
		padding-bottom: 1rem;
	}
	.title__mask {
		display: block;
		overflow: hidden;
		padding-bottom: 0.06em;
	}
	.title__in {
		display: inline-block;
		transform: translateY(105%);
		animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}
	@keyframes rise {
		to {
			transform: translateY(0);
		}
	}

	.byline {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--muted);
		text-transform: capitalize;
		padding-bottom: 1.5rem;
	}

	/* Quadrillage de filets : description + config OBS */
	.panels {
		display: grid;
		grid-template-columns: 1fr;
		margin-top: 1rem;
		border-top: 1px solid var(--rule);
		border-left: 1px solid var(--rule);
	}
	@media (min-width: 1024px) {
		.panels {
			grid-template-columns: 1fr 1fr;
		}
		.panels--single {
			grid-template-columns: 1fr;
		}
	}

	.panel {
		padding: 1.25rem 1.5rem 1.5rem;
		border-right: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}

	.panel__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.4rem;
		line-height: 1.08;
		letter-spacing: -0.03em;
	}

	.panel__hint {
		margin-top: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
	}

	.description {
		margin-top: 0.75rem;
		max-width: 65ch;
		font-size: 1rem;
		line-height: 1.6;
		white-space: pre-line;
	}

	.panel__fields {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		margin-top: 1.25rem;
	}

	.credential {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.credential__label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--muted);
	}
	.credential__row {
		display: flex;
		align-items: stretch;
		gap: 0;
	}
	.credential__value {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0.6rem 0.8rem;
		border: 1px solid var(--rule);
		background: var(--bg);
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.85rem;
	}
	.credential__copy {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.6rem;
		border: 1px solid var(--rule);
		border-left: none;
		background: var(--bg);
		color: var(--fg);
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.credential__copy:hover {
		background: var(--fg);
		color: var(--bg);
	}

	@media (prefers-reduced-motion: reduce) {
		.title__in {
			animation: none;
			transform: none;
		}
		.pulse__ring {
			animation: none;
		}
		.credential__copy {
			transition: none;
		}
	}
</style>