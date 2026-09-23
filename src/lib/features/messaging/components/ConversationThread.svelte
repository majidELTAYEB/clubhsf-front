<!-- <script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import SendIcon from '@lucide/svelte/icons/send';
	import { getConversationHistory, markConversationAsRead } from '../api';
	import { messagingSocket } from '../ws';
	import type { MessageResponse, WSEvent } from '../types';

	// currentUserId : à brancher sur votre store d'auth existant
	// (ex: import { currentUser } from '$lib/stores/auth').
	let { conversationId, currentUserId, participantName = 'Conversation', accessToken } = $props<{
		conversationId: string;
		currentUserId: string;
		participantName?: string;
        accessToken?: string | null;
	}>();

	type PendingMessage = MessageResponse & { pending?: boolean; failed?: boolean };

	let messages = $state<PendingMessage[]>([]);
	let readReceipts = $state<Record<string, string>>({});
	let draft = $state('');
	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let sending = $state(false);
	let scrollEl: HTMLDivElement;

	async function scrollToBottom() {
		await tick();
		scrollEl?.scrollTo({ top: scrollEl.scrollHeight });
	}

	async function load() {
		loading = true;
		loadError = null;
		try {
			const page = await getConversationHistory(conversationId);
			// L'API renvoie du plus récent au plus ancien ; on affiche
			// chronologiquement, donc on inverse pour l'affichage.
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
			scrollToBottom();
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
			scrollToBottom();
			markConversationAsRead(conversationId);
		}
	}

	$effect(() => {
		load();
		messagingSocket.connect(accessToken);
		const unsubscribe = messagingSocket.onEvent(handleEvent);
		return () => unsubscribe();
	});

	function send() {
		const content = draft.trim();
		if (!content || sending) return;

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
		scrollToBottom();

		try {
			messagingSocket.send({ conversation_id: conversationId, content });
		} catch {
			const idx = messages.findIndex((m) => m.id === tempId);
			if (idx !== -1) messages[idx] = { ...messages[idx], pending: false, failed: true };
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function isRead(msg: MessageResponse) {
		if (msg.sender_id !== currentUserId) return false;
		const receiptEntries = Object.values(readReceipts);
		return receiptEntries.some((readAt) => new Date(readAt) >= new Date(msg.created_at));
	}

	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="thread">
	<div class="masthead">
		<button type="button" class="back-btn" onclick={() => goto('/messages')} aria-label="Retour">
			<ArrowLeftIcon size={16} strokeWidth={2} />
		</button>
		<span class="masthead__title">{participantName}</span>
	</div>

	<div class="thread__body" bind:this={scrollEl}>
		{#if loading}
			<p class="status-text">Chargement…</p>
		{:else if loadError}
			<p class="status-text status-text--error">{loadError}</p>
		{:else if messages.length === 0}
			<p class="status-text">Aucun message pour l'instant. Lance la conversation !</p>
		{:else}
			{#each messages as msg (msg.id)}
				<div class="bubble-row" class:bubble-row--own={msg.sender_id === currentUserId}>
					<div class="bubble" class:bubble--own={msg.sender_id === currentUserId} class:bubble--failed={msg.failed}>
						<p class="bubble__content">{msg.content}</p>
						<span class="bubble__meta">
							{formatTime(msg.created_at)}
							{#if msg.pending}· envoi…{:else if msg.failed}· échec{:else if isRead(msg)}· lu{/if}
						</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<form class="composer" onsubmit={(e) => { e.preventDefault(); send(); }}>
		<textarea
			placeholder="Écris un message…"
			bind:value={draft}
			onkeydown={onKeydown}
			rows="1"
		></textarea>
		<button type="submit" class="composer__send" disabled={!draft.trim()} aria-label="Envoyer">
			<SendIcon size={16} strokeWidth={2} />
		</button>
	</form>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.thread {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #121210;

		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
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
	.masthead__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
	}

	.thread__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.status-text {
		margin: auto;
		font-size: 0.85rem;
		color: var(--muted);
		text-align: center;
	}
	.status-text--error {
		color: #b3402e;
	}

	.bubble-row {
		display: flex;
		justify-content: flex-start;
	}
	.bubble-row--own {
		justify-content: flex-end;
	}

	.bubble {
		max-width: 75%;
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.bubble--own {
		background: var(--fg);
		border-color: var(--fg);
		color: #fff;
	}
	.bubble--failed {
		border-color: #b3402e;
	}
	.bubble__content {
		font-size: 0.86rem;
		line-height: 1.4;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.bubble__meta {
		font-size: 0.65rem;
		opacity: 0.6;
		align-self: flex-end;
	}

	.composer {
		display: flex;
		align-items: flex-end;
		gap: 0.6rem;
		padding: 0.9rem 1.5rem;
		padding-bottom: calc(0.9rem + env(safe-area-inset-bottom));
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}
	.composer textarea {
		flex: 1;
		resize: none;
		max-height: 6rem;
		border: 1px solid var(--border);
		padding: 0.55rem 0.75rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		color: var(--fg);
		background: none;
		outline: none;
	}
	.composer textarea::placeholder {
		color: var(--muted);
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
	}
	.composer__send:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style> -->

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

	let {
		conversationId,
		currentUserId,
		participant,
		accessToken
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

    console.log(participant)

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
		messagingSocket.connect(accessToken);
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
				{#if connectionStatus !== 'open'}
					<span class="masthead__status">
						{connectionStatus === 'connecting' ? 'Connexion…' : 'Reconnexion…'}
					</span>
				{/if}
			</div>
		</div>
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
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.thread {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #121210;
		--own-bg: #121210;
		--other-bg: #f4f2ec;
		--read-color: #4fa8e8;

		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		position: relative;
	}

	/* --- Header --- */
	.masthead {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
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
		font-size: 1.05rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.masthead__status {
		font-size: 0.7rem;
		color: var(--muted);
	}

	/* --- Avatars --- */
	.avatar {
		border-radius: 50%;
		overflow: hidden;
		background: var(--other-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-family: 'Inter', sans-serif;
		font-weight: 600;
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
		font-size: 0.75rem;
	}
	.avatar--xs {
		width: 1.6rem;
		height: 1.6rem;
		font-size: 0.6rem;
	}

	/* --- Body --- */
	.thread__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem 1.5rem;
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
		color: #b3402e;
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
		background: var(--other-bg);
		border-radius: 0.4rem;
		animation: pulse 1.4s ease-in-out infinite;
	}
	.skeleton-bubble--own {
		align-self: flex-end;
	}
	@keyframes pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	/* --- Date separator --- */
	.day-separator {
		display: flex;
		justify-content: center;
		margin: 1rem 0 0.6rem;
	}
	.day-separator span {
		font-size: 0.7rem;
		color: var(--muted);
		background: var(--other-bg);
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
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

	.bubble {
		max-width: 100%;
		padding: 0.55rem 0.8rem;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		background: var(--other-bg);
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
		border-color: #b3402e;
		background: #fdf0ee;
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
		font-size: 0.65rem;
		opacity: 0.65;
		align-self: flex-end;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.bubble--failed .bubble__meta {
		color: #b3402e;
		opacity: 1;
	}
	.bubble__read {
		color: var(--read-color);
		font-weight: 600;
	}

	/* --- Nouveaux messages pill --- */
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
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		font-size: 0.75rem;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
		animation: fadeIn 0.2s ease-out;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translate(-50%, 6px); }
		to { opacity: 1; transform: translate(-50%, 0); }
	}

	/* --- Composer --- */
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 0.6rem;
		padding: 0.9rem 1.5rem;
		padding-bottom: calc(0.9rem + env(safe-area-inset-bottom));
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}
	.composer__field {
		position: relative;
		flex: 1;
	}
	.composer textarea {
		width: 100%;
		resize: none;
		max-height: 8.75rem;
		border: 1px solid var(--border);
		border-radius: 0.7rem;
		padding: 0.6rem 2.6rem 0.6rem 0.8rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
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
		font-size: 0.65rem;
		color: var(--muted);
		pointer-events: none;
	}
	.composer__count--danger {
		color: #b3402e;
		font-weight: 600;
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
		border-radius: 50%;
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