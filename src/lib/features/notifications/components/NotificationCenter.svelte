<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import BellIcon from '@lucide/svelte/icons/bell';
	import XIcon from '@lucide/svelte/icons/x';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import VideoIcon from '@lucide/svelte/icons/video';
	import RadioIcon from '@lucide/svelte/icons/radio';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import CheckCheckIcon from '@lucide/svelte/icons/check-check';
	import { goto } from '$app/navigation';
	import {
		listNotifications,
		markNotificationRead,
		markAllNotificationsRead
	} from '$lib/features/notifications/api';
	import type { AppNotification, NotificationType } from '$lib/features/notifications/types';

	let open = $state(false);
	let isMobile = $state(false);
	let notifications = $state<AppNotification[]>([]);
	let nextCursor = $state<string | undefined>(undefined);
	let unreadCount = $state(0);
	let loading = $state(true);
	let loadingMore = $state(false);
	let markingAll = $state(false);
	let loadError = $state<string | null>(null);
	let hasLoadedOnce = $state(false);

	async function loadUnreadCount() {
		try {
			const res = await listNotifications(undefined, 1);
			unreadCount = res.unread_count;
		} catch {
			// Échec silencieux : simple compteur, pas critique.
		}
	}

	async function loadFull() {
		loading = true;
		loadError = null;
		try {
			const res = await listNotifications();
			notifications = res.notifications;
			nextCursor = res.next_cursor;
			unreadCount = res.unread_count;
			hasLoadedOnce = true;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger les notifications';
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const res = await listNotifications(nextCursor);
			notifications = [...notifications, ...res.notifications];
			nextCursor = res.next_cursor;
		} catch {
			// idem, échec silencieux, le bouton reste cliquable
		} finally {
			loadingMore = false;
		}
	}

	function toggle() {
		open = !open;
		if (open && !hasLoadedOnce) loadFull();
	}

	function close() {
		open = false;
	}

	async function handleClick(n: AppNotification) {
		if (!n.read) {
			n.read = true;
			unreadCount = Math.max(0, unreadCount - 1);
			try {
				await markNotificationRead(n.id);
			} catch {
				// pas de rollback visuel, pas assez grave pour perturber la nav
			}
		}
		close();
		if (n.link) goto(n.link);
	}

	async function handleMarkAllRead() {
		if (markingAll || unreadCount === 0) return;
		markingAll = true;
		const previous = notifications.map((n) => n.read);
		notifications = notifications.map((n) => ({ ...n, read: true }));
		unreadCount = 0;
		try {
			await markAllNotificationsRead();
		} catch {
			notifications = notifications.map((n, i) => ({ ...n, read: previous[i] }));
			unreadCount = notifications.filter((n) => !n.read).length;
		} finally {
			markingAll = false;
		}
	}

	function iconFor(type: NotificationType) {
		switch (type) {
			case 'new_article':
				return FileTextIcon;
			case 'new_video':
				return VideoIcon;
			case 'live_scheduled':
			case 'live_starting_soon':
				return RadioIcon;
			case 'post_liked':
				return HeartIcon;
			case 'post_commented':
				return MessageCircleIcon;
			default:
				return BellIcon;
		}
	}

	function formatRelative(iso: string): string {
		const diffMs = Date.now() - new Date(iso).getTime();
		const diffMin = Math.round(diffMs / 60000);
		if (diffMin < 1) return "À l'instant";
		if (diffMin < 60) return `${diffMin} min`;
		const diffH = Math.round(diffMin / 60);
		if (diffH < 24) return `${diffH} h`;
		const diffDays = Math.round(diffH / 24);
		return `${diffDays} j`;
	}

	$effect(() => {
		loadUnreadCount();
	});

	$effect(() => {
		const mq = window.matchMedia('(max-width: 639px)');
		function update() {
			isMobile = mq.matches;
		}
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	$effect(() => {
		if (!open) return;
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') close();
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<!-- <div class="notif-center">
	<button type="button" class="bell-btn" onclick={toggle} aria-label="Notifications">
		<BellIcon size={18} strokeWidth={1.75} />
		{#if unreadCount > 0}
			<span class="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
		{/if}
	</button>

	{#if open}
		<div class="notif-overlay" onclick={close} transition:fade={{ duration: 180 }}></div>

		<div class="notif-panel" transition:fly={{ y: isMobile ? 24 : -12, duration: 220, easing: cubicOut }}>
			<div class="notif-panel__head">
				<span class="notif-panel__title">Notifications</span>
				<div class="notif-panel__head-actions">
					{#if unreadCount > 0}
						<button
							type="button"
							class="mark-all-btn"
							onclick={handleMarkAllRead}
							disabled={markingAll}
						>
							<CheckCheckIcon size={12} strokeWidth={2} />
							Tout marquer comme lu
						</button>
					{/if}
					<button type="button" class="notif-panel__close" onclick={close} aria-label="Fermer">
						<XIcon size={16} strokeWidth={1.75} />
					</button>
				</div>
			</div>

			<div class="notif-panel__body">
				{#if loading}
					{#each Array(4) as _}
						<div class="skeleton-row">
							<div class="skeleton-line skeleton-line--title"></div>
							<div class="skeleton-line skeleton-line--body"></div>
						</div>
					{/each}
				{:else if loadError}
					<div class="empty-state">
						<p class="empty-state__title">Erreur de chargement</p>
						<p class="empty-state__body">{loadError}</p>
					</div>
				{:else if notifications.length === 0}
					<div class="empty-state">
						<p class="empty-state__title">Aucune notification</p>
						<p class="empty-state__body">Tu seras prévenu ici dès que quelque chose arrive.</p>
					</div>
				{:else}
					{#each notifications as n (n.id)}
						{@const Icon = iconFor(n.type)}
						<button
							type="button"
							class="notif-item"
							class:notif-item--unread={!n.read}
							onclick={() => handleClick(n)}
						>
							<span class="notif-item__icon">
								<Icon size={15} strokeWidth={1.75} />
							</span>
							<span class="notif-item__content">
								<span class="notif-item__title">{n.title}</span>
								{#if n.body}
									<span class="notif-item__body">{n.body}</span>
								{/if}
								<span class="notif-item__time">{formatRelative(n.created_at)}</span>
							</span>
							{#if !n.read}
								<span class="unread-dot" aria-hidden="true"></span>
							{/if}
						</button>
					{/each}

					{#if nextCursor}
						<button type="button" class="load-more-btn" onclick={loadMore} disabled={loadingMore}>
							{loadingMore ? 'Chargement…' : 'Charger plus'}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div> -->

<style>
	.notif-center {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		position: relative;
		font-family: 'Inter', sans-serif;
	}

	.bell-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		background: none;
		border: none;
		color: var(--fg);
		cursor: pointer;
		padding: 0;
	}
	.bell-btn:hover {
		opacity: 0.85;
	}

	@media (max-width: 639px) {
		.bell-btn {
			width: 2.75rem;
			height: 2.75rem;
		}
	}

	.bell-badge {
		position: absolute;
		top: 0.15rem;
		right: 0.15rem;
		min-width: 1rem;
		height: 1rem;
		padding: 0 0.2rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--accent);
		color: #fff;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		font-weight: 500;
		line-height: 1;
	}

	/* ===== Panneau flottant, calé sur le pattern de la modale Posts ===== */
	.notif-overlay {
		position: fixed;
		inset: 0;
		background: rgba(18, 18, 16, 0.4);
		z-index: 100;
	}

	.notif-panel {
		position: absolute;
		top: calc(100% + 0.75rem);
		right: 0;
		z-index: 101;
		width: 340px;
		max-width: calc(100vw - 2rem);
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		border: 1px solid var(--border);
		box-shadow: 0 24px 64px rgba(18, 18, 16, 0.18);
	}

	/* Sous 640px : bottom-sheet plein écran, comme .modal de la page Posts,
	   plutôt qu'un dropdown ancré qui déborderait ou serait trop étroit. */
	@media (max-width: 639px) {
		.notif-panel {
			position: fixed;
			top: auto;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			max-width: 100%;
			max-height: 80vh;
			border-left: none;
			border-right: none;
			border-bottom: none;
			box-shadow: 0 -8px 32px rgba(18, 18, 16, 0.14);
			padding-bottom: env(safe-area-inset-bottom);
		}
	}

	.notif-panel__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.notif-panel__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
		color: var(--fg);
	}

	.notif-panel__head-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.mark-all-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: none;
		border: none;
		color: var(--muted);
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0;
		white-space: nowrap;
	}
	.mark-all-btn:hover:not(:disabled) {
		color: var(--fg);
	}
	.mark-all-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.notif-panel__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		margin: -0.4rem;
		flex-shrink: 0;
	}
	.notif-panel__close:hover {
		color: var(--fg);
	}

	.notif-panel__body {
		overflow-y: auto;
		flex: 1;
	}

	.notif-item {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		width: 100%;
		padding: 0.85rem 1.25rem;
		background: none;
		border: none;
		border-bottom: 1px solid var(--border);
		text-align: left;
		cursor: pointer;
		font-family: 'Inter', sans-serif;
	}
	.notif-item:last-child {
		border-bottom: none;
	}
	.notif-item:hover {
		opacity: 0.7;
	}
	.notif-item--unread .notif-item__title {
		font-weight: 600;
	}

	.notif-item__icon {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		margin-top: 0.1rem;
	}

	.notif-item__content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.notif-item__title {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--fg);
		line-height: 1.35;
	}

	.notif-item__body {
		font-size: 0.74rem;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.notif-item__time {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		color: var(--muted);
		margin-top: 0.15rem;
	}

	.unread-dot {
		flex-shrink: 0;
		width: 0.4rem;
		height: 0.4rem;
		background: var(--accent);
		margin-top: 0.4rem;
	}

	/* Empty / error state, calé sur .empty-state de Posts */
	.empty-state {
		padding: 3rem 1.25rem;
		text-align: center;
	}
	.empty-state__title { font-size: 0.85rem; font-weight: 500; }
	.empty-state__body { margin-top: 0.3rem; font-size: 0.78rem; color: var(--muted); }

	/* Skeleton, calé sur celui de Posts */
	.skeleton-row {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.85rem 1.25rem;
		border-bottom: 1px solid var(--border);
	}
	.skeleton-line {
		position: relative;
		background: #eeece6;
		overflow: hidden;
	}
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
		.skeleton-line::after { animation: none; }
	}
	.skeleton-line--title { width: 45%; height: 0.75rem; }
	.skeleton-line--body { width: 75%; height: 0.7rem; margin-top: 0.2rem; }

	.load-more-btn {
		width: 100%;
		padding: 0.85rem;
		background: none;
		border: none;
		border-top: 1px solid var(--border);
		color: var(--muted);
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		flex-shrink: 0;
	}
	.load-more-btn:hover:not(:disabled) {
		color: var(--fg);
	}
	.load-more-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>