<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import SendIcon from '@lucide/svelte/icons/send';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import { getConversationHistory, markConversationAsRead, markConversationAsReadDebounced } from '../api';
	import { messagingSocket } from '../ws';
	import type { MessageResponse, WSEvent, ConnectionStatus, ParticipantResponse } from '../types';
	import { getWsToken } from '$lib/assets/api/ws-token';

	let {
		conversationId,
		currentUserId,
		participant,
	} = $props<{
		conversationId: string;
		currentUserId: string;
		participant?: ParticipantResponse | null;
		accessToken?: string | null;
	}>();

	const MAX_LENGTH = 5000;
	const WARN_THRESHOLD = 4800;

	type PendingMessage = MessageResponse & { pending?: boolean; failed?: boolean };

	let messages = $state<PendingMessage[]>([]);
	let readReceipts = $state<Record<string, string>>({});
	let draft = $state('');
	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let connectionStatus = $state<ConnectionStatus>('connecting');
	let isAtBottom = $state(true);
	let showNewMessagePill = $state(false);

	let scrollEl: HTMLDivElement;
	let textareaEl: HTMLTextAreaElement;

	const participantName = $derived(participant?.username ?? 'Conversation');

	// --- Groupement des messages : date + expéditeur consécutif ---
	interface DayGroup {
		dateLabel: string;
		clusters: PendingMessage[][];
	}

	function dateLabel(iso: string): string {
		const d = new Date(iso);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		const sameDay = (a: Date, b: Date) =>
			a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

		if (sameDay(d, today)) return "Aujourd'hui";
		if (sameDay(d, yesterday)) return 'Hier';
		return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
	}

	// Regroupe les messages consécutifs du même expéditeur envoyés à moins
	// de 3 minutes d'écart, façon WhatsApp/iMessage : un seul avatar/horaire
	// visible par cluster plutôt qu'une bulle isolée par message.
	const groupedMessages = $derived.by((): DayGroup[] => {
		const groups: DayGroup[] = [];
		let currentDay: DayGroup | null = null;
		let currentCluster: PendingMessage[] = [];
		let lastSender: string | null = null;
		let lastTime = 0;

		for (const msg of messages) {
			const label = dateLabel(msg.created_at);
			const msgTime = new Date(msg.created_at).getTime();

			if (!currentDay || currentDay.dateLabel !== label) {
				if (currentCluster.length) currentDay?.clusters.push(currentCluster);
				currentDay = { dateLabel: label, clusters: [] };
				groups.push(currentDay);
				currentCluster = [];
				lastSender = null;
			}

			const sameSender = msg.sender_id === lastSender;
			const closeInTime = msgTime - lastTime < 3 * 60 * 1000;

			if (sameSender && closeInTime && currentCluster.length) {
				currentCluster.push(msg);
			} else {
				if (currentCluster.length) currentDay.clusters.push(currentCluster);
				currentCluster = [msg];
			}

			lastSender = msg.sender_id;
			lastTime = msgTime;
		}
		if (currentDay && currentCluster.length) currentDay.clusters.push(currentCluster);

		return groups;
	});

	async function scrollToBottom(smooth = false) {
		await tick();
		scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
		showNewMessagePill = false;
	}

	function checkIsAtBottom() {
		if (!scrollEl) return;
		const threshold = 80;
		isAtBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < threshold;
		if (isAtBottom) showNewMessagePill = false;
	}

	async function load() {
		loading = true;
		loadError = null;
		try {
			const page = await getConversationHistory(conversationId);
			messages = [...page.messages].reverse();
			readReceipts = page.read_receipts ?? {};
			await scrollToBottom();
			await markConversationAsRead(conversationId);
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger la conversation';
		} finally {
			loading = false;
		}
	}

	function handleEvent(event: WSEvent) {
		if (event.type === 'error') {
			const idx = [...messages].reverse().findIndex((m) => m.pending);
			if (idx !== -1) {
				const realIdx = messages.length - 1 - idx;
				messages[realIdx] = { ...messages[realIdx], pending: false, failed: true };
			}
			return;
		}

		if (event.conversation_id !== conversationId) return;

		if (event.type === 'read' && event.user_id && event.read_at) {
			readReceipts = { ...readReceipts, [event.user_id]: event.read_at };
			return;
		}

		if (event.type === 'ack') {
			const idx = messages.findIndex((m) => m.pending);
			if (idx !== -1) {
				messages[idx] = {
					id: event.id ?? messages[idx].id,
					conversation_id: event.conversation_id ?? conversationId,
					sender_id: event.sender_id ?? currentUserId,
					content: event.content ?? messages[idx].content,
					created_at: event.created_at ?? new Date().toISOString()
				};
			}
			scrollToBottom(true);
			return;
		}

		if (event.type === 'message') {
			messages = [
				...messages,
				{
					id: event.id ?? crypto.randomUUID(),
					conversation_id: conversationId,
					sender_id: event.sender_id ?? '',
					content: event.content ?? '',
					created_at: event.created_at ?? new Date().toISOString()
				}
			];

			if (isAtBottom) {
				scrollToBottom(true);
				markConversationAsReadDebounced(conversationId);
			} else {
				showNewMessagePill = true;
			}
		}
	}

	$effect(() => {
		load();
		messagingSocket.connect(async () => (await getWsToken()).token);
		const unsubscribeEvents = messagingSocket.onEvent(handleEvent);
		const unsubscribeStatus = messagingSocket.onStatusChange((s) => (connectionStatus = s));
		return () => {
			unsubscribeEvents();
			unsubscribeStatus();
		};
	});

	function doSend(content: string, tempId: string) {
		try {
			messagingSocket.send({ conversation_id: conversationId, content });
		} catch {
			const idx = messages.findIndex((m) => m.id === tempId);
			if (idx !== -1) messages[idx] = { ...messages[idx], pending: false, failed: true };
		}
	}

	function send() {
		const content = draft.trim();
		if (!content || content.length > MAX_LENGTH) return;

		const tempId = `temp-${crypto.randomUUID()}`;
		messages = [
			...messages,
			{
				id: tempId,
				conversation_id: conversationId,
				sender_id: currentUserId,
				content,
				created_at: new Date().toISOString(),
				pending: true
			}
		];
		draft = '';
		resetTextareaHeight();
		scrollToBottom(true);
		doSend(content, tempId);
	}

	function retry(msg: PendingMessage) {
		const idx = messages.findIndex((m) => m.id === msg.id);
		if (idx === -1) return;
		messages[idx] = { ...messages[idx], pending: true, failed: false };
		doSend(msg.content, msg.id);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function autoResize() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, 140) + 'px';
	}

	function resetTextareaHeight() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
	}

	function isRead(msg: MessageResponse) {
		if (msg.sender_id !== currentUserId) return false;
		return Object.values(readReceipts).some((readAt) => new Date(readAt) >= new Date(msg.created_at));
	}

	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}

	function initials(name: string) {
		return name.slice(0, 2).toUpperCase();
	}

	const remainingChars = $derived(MAX_LENGTH - draft.length);
	const showCharCount = $derived(draft.length > WARN_THRESHOLD);
</script>

<div class="thread">
	<div class="masthead">
		<button type="button" class="back-btn" onclick={() => goto('/messages')} aria-label="Retour">
			<ArrowLeftIcon size={16} strokeWidth={2} />
		</button>

		<div class="masthead__identity">
			<div class="avatar avatar--sm">
				{#if participant?.avatar_url}
					<img src={participant.avatar_url} alt="" />
				{:else}
					<span>{initials(participantName)}</span>
				{/if}
			</div>
			<div class="masthead__text">
				<span class="masthead__title">{participantName}</span>
			</div>
		</div>

		{#if connectionStatus !== 'open'}
			<span class="masthead__status-badge">
				{connectionStatus === 'connecting' ? 'Connexion…' : 'Reconnexion…'}
			</span>
		{/if}
	</div>

	<div class="thread__body" bind:this={scrollEl} onscroll={checkIsAtBottom}>
		{#if loading}
			<div class="skeleton-group">
				{#each [1, 2, 3] as i}
					<div class="skeleton-bubble" class:skeleton-bubble--own={i % 2 === 0}></div>
				{/each}
			</div>
		{:else if loadError}
			<p class="status-text status-text--error">{loadError}</p>
		{:else if messages.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucun message pour l'instant</p>
				<p class="empty-state__subtitle">Écris le premier message pour lancer la conversation.</p>
			</div>
		{:else}
			{#each groupedMessages as day (day.dateLabel)}
				<div class="day-separator">
					<span>{day.dateLabel}</span>
				</div>

				{#each day.clusters as cluster (cluster[0].id)}
					{@const own = cluster[0].sender_id === currentUserId}
					<div class="cluster" class:cluster--own={own}>
						{#if !own}
							<div class="avatar avatar--xs cluster__avatar">
								{#if participant?.avatar_url}
									<img src={participant.avatar_url} alt="" />
								{:else}
									<span>{initials(participantName)}</span>
								{/if}
							</div>
						{/if}

						<div class="cluster__bubbles">
							{#each cluster as msg, i (msg.id)}
								<div class="bubble-row" class:bubble-row--own={own}>
									<button
										type="button"
										class="bubble"
										class:bubble--own={own}
										class:bubble--failed={msg.failed}
										class:bubble--clickable={msg.failed}
										onclick={() => msg.failed && retry(msg)}
									>
										<p class="bubble__content">{msg.content}</p>
										<span class="bubble__meta">
											{#if msg.failed}
												<RotateCcwIcon size={11} strokeWidth={2} />
												échec · renvoyer
											{:else if msg.pending}
												{formatTime(msg.created_at)} · envoi…
											{:else}
												{formatTime(msg.created_at)}
												{#if own && i === cluster.length - 1 && isRead(msg)}
													<span class="bubble__read">· lu</span>
												{/if}
											{/if}
										</span>
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			{/each}
		{/if}
	</div>

	{#if showNewMessagePill}
		<button type="button" class="new-message-pill" onclick={() => scrollToBottom(true)}>
			<ChevronDownIcon size={14} strokeWidth={2} />
			Nouveaux messages
		</button>
	{/if}

	<form class="composer" onsubmit={(e) => { e.preventDefault(); send(); }}>
		<div class="composer__field">
			<textarea
				bind:this={textareaEl}
				placeholder="Écris un message…"
				bind:value={draft}
				oninput={autoResize}
				onkeydown={onKeydown}
				rows="1"
				maxlength={MAX_LENGTH}
			></textarea>
			{#if showCharCount}
				<span class="composer__count" class:composer__count--danger={remainingChars < 50}>
					{remainingChars}
				</span>
			{/if}
		</div>
		<button type="submit" class="composer__send" disabled={!draft.trim()} aria-label="Envoyer">
			<SendIcon size={16} strokeWidth={2} />
		</button>
	</form>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.thread {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #666666;
		--border: #e6e3db;
		--tint: #f0f0f0;
		--own-bg: #000000;

		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
		height: 100%;
		min-height: 0;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		position: relative;
	}

	/* --- Header --- */
	.masthead {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		height: var(--header-height, 3.5rem);
		box-sizing: content-box;
		padding: 0 1.25rem;
		padding-top: env(safe-area-inset-top);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
		position: relative;
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
		flex-shrink: 0;
	}
	@media (min-width: 860px) {
		.back-btn { display: none; }
	}
	.masthead__identity {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
	}
	.masthead__text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.masthead__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 0.95rem;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.masthead__status-badge {
		margin-left: auto;
		flex-shrink: 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		color: var(--muted);
	}

	/* --- Avatars : carrés, sans bordure, initiale en Fraunces --- */
	.avatar {
		overflow: hidden;
		background: var(--tint);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		color: var(--muted);
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.avatar--sm {
		width: 2.1rem;
		height: 2.1rem;
		font-size: 0.8rem;
	}
	.avatar--xs {
		width: 1.6rem;
		height: 1.6rem;
		font-size: 0.65rem;
	}

	/* --- Body --- */
	.thread__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem 1.5rem;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		scroll-behavior: smooth;
	}

	.status-text {
		margin: auto;
		font-size: 0.85rem;
		color: var(--muted);
		text-align: center;
	}
	.status-text--error {
		color: var(--fg);
		font-weight: 600;
	}

	.empty-state {
		margin: auto;
		text-align: center;
		max-width: 20rem;
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

	/* --- Skeleton loading --- */
	.skeleton-group {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-top: 0.5rem;
	}
	.skeleton-bubble {
		width: 55%;
		height: 2.2rem;
		background: var(--tint);
		animation: pulse 1.4s ease-in-out infinite;
	}
	.skeleton-bubble--own {
		align-self: flex-end;
	}
	@keyframes pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	/* --- Date separator : label discret, pas de pilule --- */
	.day-separator {
		display: flex;
		justify-content: center;
		margin: 1.25rem 0 0.75rem;
	}
	.day-separator span {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	/* --- Clusters --- */
	.cluster {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.cluster--own {
		justify-content: flex-end;
	}
	.cluster__avatar {
		margin-bottom: 0.1rem;
	}
	.cluster__bubbles {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		max-width: 75%;
	}
	.cluster--own .cluster__bubbles {
		align-items: flex-end;
	}

	.bubble-row {
		display: flex;
		width: 100%;
	}
	.bubble-row--own {
		justify-content: flex-end;
	}

	/* --- Bulles : carrées, bordure fine, pas de radius --- */
	.bubble {
		max-width: 100%;
		padding: 0.55rem 0.8rem;
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		background: var(--bg);
		text-align: left;
		font-family: inherit;
		cursor: default;
	}
	.bubble--own {
		background: var(--own-bg);
		border-color: var(--own-bg);
		color: #fff;
	}
	.bubble--failed {
		border-style: dashed;
	}
	.bubble--clickable {
		cursor: pointer;
	}
	.bubble__content {
		font-size: 0.87rem;
		line-height: 1.4;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.bubble__meta {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		opacity: 0.65;
		align-self: flex-end;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.bubble--failed .bubble__meta {
		opacity: 1;
		font-weight: 600;
	}
	.bubble__read {
		font-weight: 600;
	}

	/* --- Nouveaux messages : carré, pas de pilule --- */
	.new-message-pill {
		position: absolute;
		bottom: 5.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: var(--fg);
		color: #fff;
		border: none;
		padding: 0.45rem 0.9rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		cursor: pointer;
		animation: fadeIn 0.2s ease-out;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translate(-50%, 6px); }
		to { opacity: 1; transform: translate(-50%, 0); }
	}

	/* --- Composer : carré, bordure fine, pas de radius --- */
	.composer {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.9rem 1.5rem;
		padding-bottom: calc(0.9rem + env(safe-area-inset-bottom));
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}
	.composer__field {
		position: relative;
		display: flex;
		flex: 1;
	}
	.composer textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: 2.4rem;
    resize: none;
    max-height: 8.75rem;
    border: 1px solid var(--border);
    padding: 0.5rem 2.6rem 0.5rem 0.8rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--fg);
    background: none;
    outline: none;
    transition: border-color 0.15s;
}
	.composer textarea:focus {
		border-color: var(--fg);
	}
	.composer textarea::placeholder {
		color: var(--muted);
	}
	.composer__count {
		position: absolute;
		right: 0.7rem;
		bottom: 0.6rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		color: var(--muted);
		pointer-events: none;
	}
	.composer__count--danger {
		font-weight: 700;
	}
	.composer__send {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.3rem;
		height: 2.3rem;
		flex-shrink: 0;
		background: var(--fg);
		border: none;
		color: #fff;
		cursor: pointer;
		transition: opacity 0.15s, transform 0.1s;
	}
	.composer__send:active:not(:disabled) {
		transform: scale(0.92);
	}
	.composer__send:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>