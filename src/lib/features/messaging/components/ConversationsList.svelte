<!-- <script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { listConversations } from '../api';
	import { messagingSocket } from '../ws';
	import type { ConversationSummaryResponse, WSEvent } from '../types';

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

	// Un message entrant fait remonter sa conversation en tête et marque
	// l'aperçu à jour, sans re-fetch complet de la liste.
	function handleIncoming(event: WSEvent) {
		if (event.type !== 'message' || !event.conversation_id) return;
		const idx = conversations.findIndex((c) => c.id === event.conversation_id);
		if (idx === -1) return;

		const updated: ConversationSummaryResponse = {
			...conversations[idx],
			has_unread: true,
			last_message: {
				id: event.id ?? '',
				conversation_id: event.conversation_id,
				sender_id: event.sender_id ?? '',
				content: event.content ?? '',
				created_at: event.created_at ?? new Date().toISOString()
			}
		};
		conversations = [updated, ...conversations.filter((_, i) => i !== idx)];
	}

	$effect(() => {
		load();
		messagingSocket.connect();
		const unsubscribe = messagingSocket.onEvent(handleIncoming);
		return () => unsubscribe();
	});

	function initial(name: string) {
		return name.charAt(0).toUpperCase();
	}

	function preview(text: string) {
		return text.length > 60 ? text.slice(0, 60) + '…' : text;
	}

	function formatTime(iso: string) {
		const date = new Date(iso);
		const now = new Date();
		if (date.toDateString() === now.toDateString()) {
			return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
		}
		return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
	}
</script>

<div class="archive">
	<div class="masthead">
		<button type="button" class="back-btn" onclick={() => goto('/community')} aria-label="Retour">
			<ArrowLeftIcon size={16} strokeWidth={2} />
		</button>
		<span class="masthead__eyebrow">Messagerie</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Tes messages</h1>
			<p class="subtitle">Retrouve toutes tes conversations avec les autres membres.</p>
		</header>

		{#if loading}
			<div class="conv-list">
				{#each Array(4) as _}
					<div class="skeleton-row">
						<div class="skeleton-avatar"></div>
						<div class="skeleton-lines">
							<div class="skeleton-line" style="width: 40%"></div>
							<div class="skeleton-line" style="width: 65%"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if loadError}
			<div class="empty-state">
				<p class="empty-state__title">Une erreur est survenue</p>
				<p class="empty-state__body">{loadError}</p>
			</div>
		{:else if conversations.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucune conversation</p>
				<p class="empty-state__body">Va sur le profil d'un membre pour lui écrire.</p>
			</div>
		{:else}
			<div class="conv-list">
				{#each conversations as conv (conv.id)}
					<a href="/messages/{conv.id}" class="conv-row" class:conv-row--unread={conv.has_unread}>
						<div class="conv-row__avatar">
							{#if conv.participant?.avatar_url}
								<img src={conv.participant.avatar_url} alt={conv.participant.username} loading="lazy" />
							{:else}
								<span>{initial(conv.title ?? conv.participant?.username ?? '?')}</span>
							{/if}
						</div>
						<div class="conv-row__body">
							<div class="conv-row__top">
								<span class="conv-row__name">{conv.title ?? conv.participant?.username ?? 'Conversation'}</span>
								{#if conv.last_message}
									<span class="conv-row__time">{formatTime(conv.last_message.created_at)}</span>
								{/if}
							</div>
							{#if conv.last_message}
								<span class="conv-row__preview">{preview(conv.last_message.content)}</span>
							{:else}
								<span class="conv-row__preview conv-row__preview--empty">Aucun message pour l'instant</span>
							{/if}
						</div>
						{#if conv.has_unread}
							<span class="conv-row__dot" aria-label="Non lu"></span>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b3402e;

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

	.archive__inner {
		max-width: 720px;
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

	.conv-list {
		display: flex;
		flex-direction: column;
		margin-top: 0.5rem;
	}

	.conv-row {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
		text-decoration: none;
		color: inherit;
	}

	.conv-row__avatar {
		flex-shrink: 0;
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 50%;
		background: #eeece6;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		color: var(--muted);
	}
	.conv-row__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.conv-row__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.conv-row__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.conv-row__name {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 0.95rem;
	}
	.conv-row--unread .conv-row__name {
		font-weight: 600;
		font-style: normal;
	}
	.conv-row__time {
		flex-shrink: 0;
		font-size: 0.7rem;
		color: var(--muted);
	}
	.conv-row__preview {
		font-size: 0.8rem;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.conv-row--unread .conv-row__preview {
		color: var(--fg);
	}
	.conv-row__preview--empty {
		font-style: italic;
	}

	.conv-row__dot {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--accent);
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title {
		font-size: 0.9rem;
		font-weight: 500;
	}
	.empty-state__body {
		margin-top: 0.3rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
	}
	.skeleton-avatar {
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 50%;
		background: #eeece6;
	}
	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.skeleton-line {
		height: 0.55rem;
		background: #eeece6;
	}
</style> -->

<script lang="ts">
	import { goto } from '$app/navigation';
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

<div class="list">
	<div class="list__header">
		<h1>Messages</h1>
	</div>

	<div class="list__body">
		{#if loading}
			<div class="skeleton-rows">
				{#each [1, 2, 3, 4] as i}
					<div class="skeleton-row">
						<div class="skeleton-avatar"></div>
						<div class="skeleton-lines">
							<div class="skeleton-line" style="width: 40%"></div>
							<div class="skeleton-line" style="width: 70%"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if loadError}
			<p class="status-text status-text--error">{loadError}</p>
		{:else if conversations.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucune conversation</p>
				<p class="empty-state__subtitle">Tes échanges avec les autres membres apparaîtront ici.</p>
			</div>
		{:else}
			<ul>
				{#each conversations as conv (conv.id)}
					{@const name = conv.participant?.username ?? conv.title ?? 'Conversation'}
					<li>
						<button type="button" class="row" onclick={() => openConversation(conv)}>
							<div class="avatar">
								{#if conv.participant?.avatar_url}
									<img src={conv.participant.avatar_url} alt="" />
								{:else}
									<span>{initials(name)}</span>
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
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.list {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--unread-bg: #f4f2ec;

		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
	}

	.list__header {
		padding: 1.25rem 1.5rem 0.75rem;
		padding-top: calc(1.25rem + env(safe-area-inset-top));
		flex-shrink: 0;
	}
	.list__header h1 {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.4rem;
		margin: 0;
	}

	.list__body {
		flex: 1;
		overflow-y: auto;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.5rem;
		background: none;
		border: none;
		border-bottom: 1px solid var(--border);
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		transition: background 0.1s;
	}
	.row:hover {
		background: var(--unread-bg);
	}

	.avatar {
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 50%;
		background: var(--unread-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
		font-weight: 600;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.row__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.row__top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}
	.row__name {
		font-size: 0.9rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.row__name--unread {
		font-weight: 700;
	}
	.row__time {
		font-size: 0.7rem;
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
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--fg);
		flex-shrink: 0;
	}

	.status-text {
		text-align: center;
		font-size: 0.85rem;
		color: var(--muted);
		padding: 2rem 1.5rem;
	}
	.status-text--error {
		color: #b3402e;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1.5rem;
	}
	.empty-state__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 1.1rem;
		margin-bottom: 0.3rem;
	}
	.empty-state__subtitle {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.skeleton-rows {
		padding: 0.5rem 1.5rem;
	}
	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 0;
	}
	.skeleton-avatar {
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 50%;
		background: var(--unread-bg);
		animation: pulse 1.4s ease-in-out infinite;
		flex-shrink: 0;
	}
	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.skeleton-line {
		height: 0.7rem;
		background: var(--unread-bg);
		border-radius: 0.2rem;
		animation: pulse 1.4s ease-in-out infinite;
	}
	@keyframes pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}
</style>