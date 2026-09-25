<!-- <script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import { listConversations } from '../api';
	import { messagingSocket } from '../ws';
	import type { ConversationSummaryResponse, WSEvent } from '../types';

	let { currentUserId, accessToken } = $props<{
		currentUserId: string;
		accessToken?: string | null;
	}>();

	let conversations = $state<ConversationSummaryResponse[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	async function load() {
		loading = true;
		loadError = null;
		try {
			const page = await listConversations();
			conversations = page.conversations;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger les conversations';
		} finally {
			loading = false;
		}
	}

	function handleEvent(event: WSEvent) {
		if (event.type !== 'message' || !event.conversation_id) return;

		const idx = conversations.findIndex((c) => c.id === event.conversation_id);
		if (idx === -1) return; // nouvelle conversation jamais listée : ignorée ici, un refresh la fera apparaître

		const conv = conversations[idx];
		const updated: ConversationSummaryResponse = {
			...conv,
			last_message: {
				id: event.id ?? crypto.randomUUID(),
				conversation_id: event.conversation_id,
				sender_id: event.sender_id ?? '',
				content: event.content ?? '',
				created_at: event.created_at ?? new Date().toISOString()
			},
			has_unread: true
		};

		conversations = [updated, ...conversations.filter((_, i) => i !== idx)];
	}

	$effect(() => {
		load();
		messagingSocket.connect(accessToken);
		const unsubscribe = messagingSocket.onEvent(handleEvent);
		return () => unsubscribe();
	});

	function openConversation(conv: ConversationSummaryResponse) {
		conversations = conversations.map((c) => (c.id === conv.id ? { ...c, has_unread: false } : c));
		goto(`/messages/${conv.id}`);
	}

	function initials(name: string) {
		return name.slice(0, 2).toUpperCase();
	}

	function relativeTime(iso: string) {
		const diffMs = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diffMs / 60000);
		if (mins < 1) return 'à l’instant';
		if (mins < 60) return `${mins} min`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours} h`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days} j`;
		return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
	}

	function preview(content: string) {
		return content.length > 60 ? content.slice(0, 60) + '…' : content;
	}
</script>

<svelte:head>
	<title>Messages</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<button type="button" class="back-btn" onclick={() => goto('/community/posts')} aria-label="Retour">
			<ArrowLeftIcon size={16} strokeWidth={2} />
		</button>
		<span class="masthead__eyebrow">Communauté</span>
		{#if !loading && conversations.length > 0}
			<span class="catalog-number">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</span>
		{/if}
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Messages</h1>
			<p class="subtitle">Tes échanges avec les autres membres.</p>
		</header>

		{#if loading}
			<ul class="convo-list">
				{#each Array(4) as _}
					<li class="skeleton-row">
						<div class="skeleton-avatar"></div>
						<div class="skeleton-lines">
							<div class="skeleton-line" style="width: 40%"></div>
							<div class="skeleton-line" style="width: 70%"></div>
						</div>
					</li>
				{/each}
			</ul>
		{:else if loadError}
			<div class="empty-state">
				<p class="empty-state__title">Une erreur est survenue</p>
				<p class="empty-state__body">{loadError}</p>
			</div>
		{:else if conversations.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucune conversation</p>
				<p class="empty-state__body">Tes échanges avec les autres membres apparaîtront ici.</p>
			</div>
		{:else}
			<ul class="convo-list">
				{#each conversations as conv (conv.id)}
					{@const name = conv.participant?.username ?? conv.title ?? 'Conversation'}
					<li>
						<button type="button" class="row" onclick={() => openConversation(conv)}>
							<div class="row__portrait">
								{#if conv.participant?.avatar_url}
									<img src={conv.participant.avatar_url} alt="" />
								{:else}
									<span class="row__initial">{initials(name)}</span>
								{/if}
							</div>

							<div class="row__content">
								<div class="row__top">
									<span class="row__name" class:row__name--unread={conv.has_unread}>{name}</span>
									{#if conv.last_message}
										<span class="row__time">{relativeTime(conv.last_message.created_at)}</span>
									{/if}
								</div>
								<div class="row__bottom">
									<span class="row__preview" class:row__preview--unread={conv.has_unread}>
										{#if conv.last_message}
											{conv.last_message.sender_id === currentUserId ? 'Toi : ' : ''}{preview(conv.last_message.content)}
										{:else}
											Nouvelle conversation
										{/if}
									</span>
									{#if conv.has_unread}
										<span class="row__dot"></span>
									{/if}
								</div>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #666666;
		--border: #e6e3db;
		--tint: #f0f0f0;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		min-height: 100%;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--border);
	}
	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		color: var(--fg);
		cursor: pointer;
		margin: -0.3rem;
	}
	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.catalog-number {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.archive__inner {
		max-width: 700px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	.heading {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}
	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.9rem, 4.5vw, 2.5rem);
		line-height: 1.1;
	}
	.subtitle {
		margin-top: 0.5rem;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.convo-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.1rem 1.5rem;
		background: none;
		border: none;
		border-bottom: 1px solid var(--border);
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: inherit;
		transition: background 0.15s ease;
	}
	.row:hover {
		background: var(--tint);
	}

	.row__portrait {
		position: relative;
		width: 3.1rem;
		height: 3.1rem;
		flex-shrink: 0;
		background: var(--tint);
		border: 1px solid var(--border);
		overflow: hidden;
	}
	.row__portrait img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.row__initial {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.1rem;
		color: var(--muted);
	}

	.row__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.row__top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.75rem;
	}
	.row__name {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 0.95rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row__name--unread {
		font-weight: 600;
	}
	.row__time {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.02em;
		color: var(--muted);
		flex-shrink: 0;
	}
	.row__bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.row__preview {
		font-size: 0.8rem;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row__preview--unread {
		color: var(--fg);
		font-weight: 500;
	}
	.row__dot {
		width: 0.4rem;
		height: 0.4rem;
		background: var(--fg);
		flex-shrink: 0;
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 1.1rem;
		font-weight: 500;
	}
	.empty-state__body {
		margin-top: 0.4rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}
	.skeleton-avatar {
		width: 3.1rem;
		height: 3.1rem;
		background: var(--tint);
		border: 1px solid var(--border);
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
	}
	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.skeleton-line {
		height: 0.6rem;
		background: var(--tint);
		position: relative;
		overflow: hidden;
	}
	.skeleton-avatar::after,
	.skeleton-line::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
		animation: skeleton-shimmer 1.6s ease-in-out infinite;
	}
	@keyframes skeleton-shimmer {
		to { transform: translateX(100%); }
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton-avatar::after,
		.skeleton-line::after { animation: none; }
	}
</style> -->

<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import {  listConversations } from '../api';
	import { messagingSocket } from '../ws';
	import type { ConversationSummaryResponse, WSEvent } from '../types';
	import { getWsToken } from '$lib/assets/api/ws-token';

	let { currentUserId } = $props<{
		currentUserId: string;
		accessToken?: string | null;
	}>();

	let conversations = $state<ConversationSummaryResponse[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	async function load() {
		loading = true;
		loadError = null;
		try {
			const page = await listConversations();
			conversations = page.conversations;
			console.log(currentUserId)
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger les conversations';
		} finally {
			loading = false;
		}
	}

	function handleEvent(event: WSEvent) {
		if (event.type !== 'message' || !event.conversation_id) return;

		const idx = conversations.findIndex((c) => c.id === event.conversation_id);
		if (idx === -1) return; // nouvelle conversation jamais listée : ignorée ici, un refresh la fera apparaître

		const conv = conversations[idx];
		const updated: ConversationSummaryResponse = {
			...conv,
			last_message: {
				id: event.id ?? crypto.randomUUID(),
				conversation_id: event.conversation_id,
				sender_id: event.sender_id ?? '',
				content: event.content ?? '',
				created_at: event.created_at ?? new Date().toISOString()
			},
			has_unread: true
		};

		conversations = [updated, ...conversations.filter((_, i) => i !== idx)];
	}

	$effect(() => {
		load();
		messagingSocket.connect(async () => (await getWsToken()).token);
		const unsubscribe = messagingSocket.onEvent(handleEvent);
		return () => unsubscribe();
	});

	function openConversation(conv: ConversationSummaryResponse) {
		conversations = conversations.map((c) => (c.id === conv.id ? { ...c, has_unread: false } : c));
		goto(`/messages/${conv.id}`);
	}

	function initials(name: string) {
		return name.slice(0, 2).toUpperCase();
	}

	function relativeTime(iso: string) {
		const diffMs = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diffMs / 60000);
		if (mins < 1) return 'à l’instant';
		if (mins < 60) return `${mins} min`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours} h`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days} j`;
		return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
	}

	function preview(content: string) {
		return content.length > 60 ? content.slice(0, 60) + '…' : content;
	}
</script>

<svelte:head>
	<title>Messages</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<button type="button" class="back-btn" onclick={() => goto('/community/posts')} aria-label="Retour">
			<ArrowLeftIcon size={16} strokeWidth={2} />
		</button>
		<span class="masthead__eyebrow">Communauté</span>
		{#if !loading && conversations.length > 0}
			<span class="catalog-number">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</span>
		{/if}
	</div>

	<div class="archive__inner">
		<header class="heading">
			<!-- <span class="title">Messages</span> -->
			<p class="subtitle">Tes échanges avec les autres membres.</p>
		</header>

		{#if loading}
			<ul class="convo-list">
				{#each Array(4) as _}
					<li class="skeleton-row">
						<div class="skeleton-avatar"></div>
						<div class="skeleton-lines">
							<div class="skeleton-line" style="width: 40%"></div>
							<div class="skeleton-line" style="width: 70%"></div>
						</div>
					</li>
				{/each}
			</ul>
		{:else if loadError}
			<div class="empty-state">
				<p class="empty-state__title">Une erreur est survenue</p>
				<p class="empty-state__body">{loadError}</p>
			</div>
		{:else if conversations.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucune conversation</p>
				<p class="empty-state__body">Tes échanges avec les autres membres apparaîtront ici.</p>
			</div>
		{:else}
			<ul class="convo-list">
				{#each conversations as conv (conv.id)}
					{@const name = conv.participant?.username ?? conv.title ?? 'Conversation'}
					<li>
						<button type="button" class="row" onclick={() => openConversation(conv)}>
							<div class="row__portrait">
								{#if conv.participant?.avatar_url}
									<img src={conv.participant.avatar_url} alt="" />
								{:else}
									<span class="row__initial">{initials(name)}</span>
								{/if}
							</div>

							<div class="row__content">
								<div class="row__top">
									<span class="row__name" class:row__name--unread={conv.has_unread}>{name}</span>
									{#if conv.last_message}
										<span class="row__time">{relativeTime(conv.last_message.created_at)}</span>
									{/if}
								</div>
								<div class="row__bottom">
									<span class="row__preview" class:row__preview--unread={conv.has_unread}>
										{#if conv.last_message}
											{conv.last_message.sender_id === currentUserId ? 'Toi : ' : ''}{preview(conv.last_message.content)}
										{:else}
											Nouvelle conversation
										{/if}
									</span>
									{#if conv.has_unread}
										<span class="row__dot"></span>
									{/if}
								</div>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #666666;
		--border: #e6e3db;
		--tint: #f0f0f0;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		height: 100%;           /* était: min-height: 100% */
		display: flex;          /* nouveau */
		flex-direction: column; /* nouveau */
		overflow: hidden;       /* nouveau */
	}

.masthead {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	height: 3.5rem;
	box-sizing: content-box;
	padding: 0 1.25rem;
	padding-top: env(safe-area-inset-top);
	border-bottom: 1px solid var(--border);
	flex-shrink: 0;  
}
.masthead__eyebrow {
	font-family: 'Fraunces', serif;
	font-style: italic;
	font-weight: 500;
	font-size: 0.95rem; /* aligné sur masthead__title du thread */
}
	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		color: var(--fg);
		cursor: pointer;
		margin: -0.3rem;
	}
	.catalog-number {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

		.archive__inner {
		max-width: 700px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
		flex: 1;           /* nouveau */
		min-height: 0;     /* nouveau, essentiel */
		overflow-y: auto;  /* nouveau : LE scroll se passe ici */
		width: 100%;       /* nouveau */
	}

	.heading {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}
	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.9rem, 4.5vw, 2.5rem);
		line-height: 1.1;
	}
	.subtitle {
		margin-top: 0.5rem;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.convo-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.1rem 1.5rem;
		background: none;
		border: none;
		border-bottom: 1px solid var(--border);
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: inherit;
		transition: background 0.15s ease;
	}
	.row:hover {
		background: var(--tint);
	}

	.row__portrait {
		position: relative;
		width: 3.1rem;
		height: 3.1rem;
		flex-shrink: 0;
		background: var(--tint);
		overflow: hidden;
	}
	.row__portrait img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.row__initial {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.1rem;
		color: var(--muted);
	}

	.row__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.row__top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.75rem;
	}
	.row__name {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 0.95rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row__name--unread {
		font-weight: 600;
	}
	.row__time {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.02em;
		color: var(--muted);
		flex-shrink: 0;
	}
	.row__bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.row__preview {
		font-size: 0.8rem;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row__preview--unread {
		color: var(--fg);
		font-weight: 500;
	}
	.row__dot {
		width: 0.4rem;
		height: 0.4rem;
		background: var(--fg);
		flex-shrink: 0;
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 1.1rem;
		font-weight: 500;
	}
	.empty-state__body {
		margin-top: 0.4rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}
	.skeleton-avatar {
		width: 3.1rem;
		height: 3.1rem;
		background: var(--tint);
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
	}
	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.skeleton-line {
		height: 0.6rem;
		background: var(--tint);
		position: relative;
		overflow: hidden;
	}
	.skeleton-avatar::after,
	.skeleton-line::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
		animation: skeleton-shimmer 1.6s ease-in-out infinite;
	}
	@keyframes skeleton-shimmer {
		to { transform: translateX(100%); }
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton-avatar::after,
		.skeleton-line::after { animation: none; }
	}
</style>