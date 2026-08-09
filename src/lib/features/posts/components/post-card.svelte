<!-- src/lib/features/posts/components/post-card.svelte -->
<script lang="ts">
	import HeartIcon from "@lucide/svelte/icons/heart";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import { likePost, unlikePost, deletePost } from '$lib/features/posts/api';
	import type { Post } from '$lib/features/posts/types';

	let {
		post,
		onEdit,
		onDeleted
	}: {
		post: Post;
		onEdit: (post: Post) => void;
		onDeleted: (postId: string) => void;
	} = $props();

	// État local optimiste — évite d'attendre l'aller-retour réseau pour
	// le feedback visuel du like, comme suggéré par la doc API.
	let liked = $state(post.liked_by_me);
	let likesCount = $state(post.likes_count);
	let likeBusy = $state(false);
	let deleting = $state(false);
	let showConfirmDelete = $state(false);

	async function toggleLike() {
		if (likeBusy) return;
		likeBusy = true;

		const wasLiked = liked;
		// Bascule immédiate, on revient en arrière seulement si ça échoue.
		liked = !wasLiked;
		likesCount += wasLiked ? -1 : 1;

		try {
			if (wasLiked) {
				await unlikePost(post.id);
			} else {
				await likePost(post.id);
			}
		} catch {
			liked = wasLiked;
			likesCount += wasLiked ? 1 : -1;
		} finally {
			likeBusy = false;
		}
	}

	async function confirmDelete() {
		deleting = true;
		try {
			await deletePost(post.id);
			onDeleted(post.id);
		} catch {
			deleting = false;
			showConfirmDelete = false;
		}
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
	}
</script>

<article class="post-card">
	<header class="post-card__head">
		<div class="post-card__author">
			<div class="post-card__avatar">
				{#if post.author.avatar_url}
					<img src={post.author.avatar_url} alt={post.author.username} />
				{:else}
					<span>{post.author.username.slice(0, 2).toUpperCase()}</span>
				{/if}
			</div>
			<div>
				<span class="post-card__username">{post.author.username}</span>
				<span class="post-card__date">{formatDate(post.created_at)}</span>
			</div>
		</div>

		{#if post.can_edit}
			<div class="post-card__actions">
				<button type="button" onclick={() => onEdit(post)} aria-label="Éditer">
					<PencilIcon size={14} strokeWidth={1.75} />
				</button>
				<button type="button" onclick={() => (showConfirmDelete = true)} aria-label="Supprimer">
					<Trash2Icon size={14} strokeWidth={1.75} />
				</button>
			</div>
		{/if}
	</header>

	<a href={`/community/posts/${post.id}`} class="post-card__title">{post.title}</a>
	<p class="post-card__content">{post.content}</p>

	{#if post.cover_image_url}
		<a href={`/community/posts/${post.id}`} class="post-card__cover">
			<img src={post.cover_image_url} alt={post.title} loading="lazy" />
		</a>
	{/if}

	<footer class="post-card__footer">
		<button type="button" class="post-card__stat" class:post-card__stat--active={liked} onclick={toggleLike}>
			<HeartIcon size={15} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
			<span>{likesCount}</span>
		</button>
		<a href={`/community/posts/${post.id}`} class="post-card__stat">
			<MessageCircleIcon size={15} strokeWidth={1.75} />
			<span>{post.comments_count}</span>
		</a>
	</footer>

	{#if showConfirmDelete}
		<div class="confirm-bar">
			<span>Supprimer ce post ?</span>
			<div class="confirm-bar__actions">
				<button type="button" onclick={confirmDelete} disabled={deleting}>
					{deleting ? 'Suppression…' : 'Confirmer'}
				</button>
				<button type="button" onclick={() => (showConfirmDelete = false)} disabled={deleting}>
					Annuler
				</button>
			</div>
		</div>
	{/if}
</article>

<style>
	.post-card {
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		padding: 1.5rem;
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
	}

	.post-card__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.post-card__author {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.post-card__avatar {
		width: 2.1rem;
		height: 2.1rem;
		flex-shrink: 0;
		border: 1px solid var(--border);
		background: #f1efe9;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--muted);
	}
	.post-card__avatar img { width: 100%; height: 100%; object-fit: cover; }

	.post-card__username {
		display: block;
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--fg);
	}
	.post-card__date {
		display: block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		color: var(--muted);
		margin-top: 0.1rem;
	}

	.post-card__actions {
		display: flex;
		gap: 0.4rem;
		flex-shrink: 0;
	}
	.post-card__actions button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--muted);
		cursor: pointer;
		transition: border-color 0.2s ease, color 0.2s ease;
	}
	.post-card__actions button:hover { border-color: var(--fg); color: var(--fg); }

	.post-card__title {
		display: block;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.15rem;
		line-height: 1.3;
		color: var(--fg);
		text-decoration: none;
		margin-bottom: 0.5rem;
	}
	.post-card__title:hover { opacity: 0.7; }

	.post-card__content {
		font-size: 0.88rem;
		line-height: 1.6;
		color: #2b2a26;
		white-space: pre-line;
	}

	.post-card__cover {
		display: block;
		margin-top: 1rem;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: #f1efe9;
	}
	.post-card__cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.post-card__footer {
		display: flex;
		gap: 1.25rem;
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.post-card__stat {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: none;
		border: none;
		padding: 0;
		color: var(--muted);
		text-decoration: none;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.post-card__stat--active {
		color: var(--fg);
	}

	.confirm-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: #f8f7f3;
		border: 1px solid var(--border);
		font-size: 0.78rem;
		flex-wrap: wrap;
	}
	.confirm-bar__actions {
		display: flex;
		gap: 0.5rem;
	}
	.confirm-bar__actions button {
		padding: 0.35rem 0.75rem;
		font-size: 0.72rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--border);
		background: none;
		color: var(--fg);
	}
	.confirm-bar__actions button:first-child {
		background: var(--fg);
		color: #fff;
		border-color: var(--fg);
	}
	.confirm-bar__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>