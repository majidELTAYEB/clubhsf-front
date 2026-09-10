<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import PlusIcon from "@lucide/svelte/icons/plus";
	import XIcon from "@lucide/svelte/icons/x";
	import { getFeed } from '$lib/features/posts/api';
	import type { Post } from '$lib/features/posts/types';
	import PostCard from '$lib/features/posts/components/post-card.svelte';
	import PostForm from '$lib/features/posts/components/post-form.svelte';

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
		<span class="masthead__eyebrow">Communauté</span>
		<button type="button" class="new-post-btn" onclick={openCreate}>
			<PlusIcon size={13} strokeWidth={2} />
			<span>Nouveau post</span>
		</button>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Le fil</h1>
			<p class="subtitle">Ce que la communauté partage, en direct.</p>
		</header>

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
					<XIcon size={16} strokeWidth={1.75} />
				</button>
			</div>
			<div class="modal__body">
				<PostForm post={editingPost} onSaved={handleSaved} />
			</div>
		</div>
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

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
	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.new-post-btn {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.9rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
	}
	.new-post-btn:hover { opacity: 0.85; }

	.archive__inner {
		max-width: 640px;
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

	.feed-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-top: 2rem;
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title { font-size: 0.9rem; font-weight: 500; }
	.empty-state__body { margin-top: 0.3rem; font-size: 0.82rem; color: var(--muted); }

	.load-more {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}
	.load-more button {
		padding: 0.65rem 1.5rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--fg);
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	.load-more button:hover { border-color: var(--fg); }
	.load-more button:disabled { opacity: 0.5; cursor: not-allowed; }

	/* Skeleton */
	.skeleton-card {
		padding: 1.5rem;
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
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
	.skeleton-line--author { width: 30%; height: 0.8rem; }
	.skeleton-line--title { width: 55%; height: 1.1rem; margin-top: 0.4rem; }
	.skeleton-line--body { width: 100%; height: 0.75rem; margin-top: 0.4rem; }
	.skeleton-line--body-short { width: 70%; height: 0.75rem; }

	/* Modale — bottom sheet mobile, boîte centrée desktop */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(18, 18, 16, 0.4);
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
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		width: 100%;
		max-width: 100%;
		max-height: 88vh;
		background: var(--bg);
		border-top: 1px solid var(--border);
		box-shadow: 0 -8px 32px rgba(18, 18, 16, 0.14);
		display: flex;
		flex-direction: column;
		pointer-events: auto;
		padding-bottom: env(safe-area-inset-bottom);
	}
	@media (min-width: 640px) {
		.modal {
			max-width: 540px;
			max-height: 85vh;
			border: 1px solid var(--border);
			box-shadow: 0 24px 64px rgba(18, 18, 16, 0.18);
			padding-bottom: 0;
		}
	}

	.modal__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	@media (min-width: 640px) {
		.modal__head { padding: 1.25rem 1.5rem; }
	}
	.modal__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
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
		color: var(--muted);
		margin: -0.4rem;
	}
	.modal__close:hover { color: var(--fg); }

	.modal__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}
	@media (min-width: 640px) {
		.modal__body { padding: 1.5rem; }
	}
</style>
