<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import PlusIcon from "@lucide/svelte/icons/plus";
	import XIcon from "@lucide/svelte/icons/x";
	import { getFeed } from '$lib/features/posts/api';
	import type { Post } from '$lib/features/posts/types';
	import PostCard from '$lib/features/posts/components/post-card.svelte';
	import PostForm from '$lib/features/posts/components/post-form.svelte';
	import NotificationPrompt from '$lib/components/NotificationPrompt.svelte';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';
	import UsersIcon from "@lucide/svelte/icons/users";

	let posts = $state<Post[]>([]);
	let nextCursor = $state<string | undefined>(undefined);
	let loading = $state(true);
	let loadingMore = $state(false);
	let loadError = $state<string | null>(null);

	type ModalKind = 'create' | 'edit' | null;
	let activeModal = $state<ModalKind>(null);
	let editingPost = $state<Post | null>(null);
	let modalRef: HTMLElement | undefined = $state();

	async function loadFeed() {
		loading = true;
		loadError = null;
		try {
			const res = await getFeed();
			posts = res.posts;
			nextCursor = res.next_cursor;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger le feed';
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const res = await getFeed(nextCursor);
			posts = [...posts, ...res.posts];
			nextCursor = res.next_cursor;
		} catch {
			// Échec silencieux sur le "charger plus" — le bouton reste cliquable,
			// l'utilisateur peut réessayer sans perdre les posts déjà chargés.
		} finally {
			loadingMore = false;
		}
	}

	$effect(() => {
		loadFeed();
	});

	function openCreate() {
		editingPost = null;
		activeModal = 'create';
	}
	function openEdit(post: Post) {
		editingPost = post;
		activeModal = 'edit';
	}
	function closeModal() {
		activeModal = null;
		editingPost = null;
	}

	function handleSaved(post: Post) {
		if (activeModal === 'create') {
			posts = [post, ...posts];
		} else {
			posts = posts.map((p) => (p.id === post.id ? post : p));
		}
		closeModal();
	}

	function handleDeleted(postId: string) {
		posts = posts.filter((p) => p.id !== postId);
	}

	$effect(() => {
		if (!activeModal) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		queueMicrotask(() => {
			modalRef?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
		});

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeModal();
		}
		window.addEventListener('keydown', handleKeydown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<title>Posts</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__brand">Communauté</span>

		<div class="masthead__actions">
			<a href="/community/members" class="icon-btn icon-btn--ghost" aria-label="Voir les membres">
				<UsersIcon size={15} strokeWidth={2} />
				<span class="icon-btn__label">Membres</span>
			</a>
			<button type="button" class="icon-btn icon-btn--solid" onclick={openCreate} aria-label="Créer un nouveau post">
				<PlusIcon size={15} strokeWidth={2} />
				<span class="icon-btn__label">Nouveau post</span>
			</button>
			<div class="masthead__notif">
				<NotificationCenter />
			</div>
		</div>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title"><span class="title__mask"><span class="title__in">Le fil</span></span></h1>
			<p class="subtitle">Ce que la communauté partage, en direct.</p>
		</header>
		<NotificationPrompt variant="banner" />

		{#if loading}
			<div class="feed-list">
				{#each Array(3) as _}
					<div class="skeleton-card">
						<div class="skeleton-line skeleton-line--author"></div>
						<div class="skeleton-line skeleton-line--title"></div>
						<div class="skeleton-line skeleton-line--body"></div>
						<div class="skeleton-line skeleton-line--body-short"></div>
					</div>
				{/each}
			</div>
		{:else if loadError}
			<div class="empty-state">
				<p class="empty-state__title">Impossible de charger le feed</p>
				<p class="empty-state__body">{loadError}</p>
			</div>
		{:else if posts.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucun post pour le moment</p>
				<p class="empty-state__body">Sois le premier à partager quelque chose.</p>
			</div>
		{:else}
			<div class="feed-list">
				{#each posts as post (post.id)}
					<PostCard {post} onEdit={openEdit} onDeleted={handleDeleted} />
				{/each}
			</div>

			{#if nextCursor}
				<div class="load-more">
					<button type="button" onclick={loadMore} disabled={loadingMore}>
						{loadingMore ? 'Chargement…' : 'Charger plus'}
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Modale création/édition -->
{#if activeModal}
	<div class="modal-overlay" onclick={closeModal} transition:fade={{ duration: 180 }}></div>
	<div class="modal-wrap" transition:fade={{ duration: 150 }}>
		<div
			bind:this={modalRef}
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-label={activeModal === 'create' ? 'Nouveau post' : 'Éditer le post'}
			transition:fly={{ y: 24, duration: 220, easing: cubicOut }}
		>
			<div class="modal__head">
				<span class="modal__title">{activeModal === 'create' ? 'Nouveau post' : 'Éditer le post'}</span>
				<button type="button" class="modal__close" onclick={closeModal} aria-label="Fermer">
					<XIcon size={18} strokeWidth={1.75} />
				</button>
			</div>
			<div class="modal__body">
				<PostForm post={editingPost} onSaved={handleSaved} />
			</div>
		</div>
	</div>
{/if}

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

	/* --- Barre du haut --- */
	.masthead {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
	}
	.masthead__brand {
		flex-shrink: 0;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}

	.masthead__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
	}
	.masthead__notif {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	/* Boutons d'action du header : icône + label, qui se réduisent en icône
	   seule sur mobile (le label reste dans le DOM pour l'accessibilité). */
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.55rem 0.95rem;
		font-family: 'Hanken Grotesk', sans-serif;
		font-size: 0.82rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
	}
	.icon-btn--ghost {
		background: none;
		color: var(--fg);
		border: 1px solid var(--rule);
	}
	.icon-btn--ghost:hover {
		background: var(--fg);
		color: #fff;
	}
	.icon-btn--solid {
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
	}
	.icon-btn--solid:hover { opacity: 0.8; }

	@media (max-width: 520px) {
		.masthead {
			gap: 0.5rem;
			padding-left: 1rem;
			padding-right: 1rem;
		}
		.masthead__actions {
			gap: 0.4rem;
		}
		.icon-btn {
			padding: 0.6rem;
			min-width: 2.4rem;
			min-height: 2.4rem;
		}
		.icon-btn__label {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}
	}

	.archive__inner {
		max-width: 760px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	/* Titre — l'élément mémorable, révélé une seule fois au chargement */
	.heading {
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--rule);
	}
	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(4rem, 18vw, 9rem);
		line-height: 0.88;
		letter-spacing: -0.045em;
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
		to { transform: translateY(0); }
	}
	.subtitle {
		margin-top: 0.9rem;
		font-size: 1.05rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--muted);
	}

	.feed-list {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		margin-top: 2rem;
		padding: 4rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.empty-state__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.4rem;
		letter-spacing: -0.02em;
	}
	.empty-state__body {
		margin-top: 0.4rem;
		font-size: 0.92rem;
		color: var(--muted);
	}

	.load-more {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}
	.load-more button {
		padding: 0.75rem 1.75rem;
		background: none;
		border: 1px solid var(--rule);
		color: var(--fg);
		font-family: 'Hanken Grotesk', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.load-more button:hover:not(:disabled) {
		background: var(--fg);
		color: #fff;
	}
	.load-more button:disabled { opacity: 0.5; cursor: not-allowed; }

	/* Skeleton */
	.skeleton-card {
		padding: 1.75rem 0;
		border-bottom: 1px solid var(--rule);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.skeleton-line {
		position: relative;
		background: #ececec;
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
	.skeleton-line--author { width: 30%; height: 0.8rem; }
	.skeleton-line--title { width: 55%; height: 1.5rem; margin-top: 0.4rem; }
	.skeleton-line--body { width: 100%; height: 0.75rem; margin-top: 0.4rem; }
	.skeleton-line--body-short { width: 70%; height: 0.75rem; }

	@media (prefers-reduced-motion: reduce) {
		.skeleton-line::after { animation: none; }
		.title__in { animation: none; transform: none; }
	}

	/* Modale — bottom sheet mobile, boîte centrée desktop */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 100;
	}
	.modal-wrap {
		position: fixed;
		inset: 0;
		z-index: 101;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0;
		pointer-events: none;
	}
	@media (min-width: 640px) {
		.modal-wrap { align-items: center; padding: 1.5rem; }
	}

	.modal {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		width: 100%;
		max-width: 100%;
		max-height: 88vh;
		background: var(--bg);
		color: var(--fg);
		border-top: 1px solid var(--rule);
		display: flex;
		flex-direction: column;
		pointer-events: auto;
		padding-bottom: env(safe-area-inset-bottom);
	}
	@media (min-width: 640px) {
		.modal {
			max-width: 560px;
			max-height: 85vh;
			border: 1px solid var(--rule);
			padding-bottom: 0;
		}
	}

	.modal__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--rule);
		flex-shrink: 0;
	}
	@media (min-width: 640px) {
		.modal__head { padding: 1.25rem 1.5rem; }
	}
	.modal__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.3rem;
		letter-spacing: -0.03em;
	}
	.modal__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--fg);
		margin: -0.4rem;
		transition: opacity 0.2s ease;
	}
	.modal__close:hover { opacity: 0.55; }

	.modal__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}
	@media (min-width: 640px) {
		.modal__body { padding: 1.5rem; }
	}
</style>