<!-- src/routes/posts/[id]/+page.svelte
<script lang="ts">
	import { page } from '$app/state';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import HeartIcon from "@lucide/svelte/icons/heart";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import { getPost, getComments, likePost, unlikePost } from '$lib/features/posts/api';
	import type { Post, Comment } from '$lib/features/posts/types';
	import CommentForm from '$lib/features/posts/components/comment-form.svelte';
	import CommentItem from '$lib/features/posts/components/comment-item.svelte';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';

	let postId = $derived(page.params.id);

	let post = $state<Post | null>(null);
	let comments = $state<Comment[]>([]);
	let nextCursor = $state<string | undefined>(undefined);
	let loading = $state(true);
	let loadingMore = $state(false);
	let loadError = $state<string | null>(null);

	let liked = $state(false);
	let likesCount = $state(0);
	let likeBusy = $state(false);

	async function load() {
		loading = true;
		loadError = null;
		try {
			const [postRes, commentsRes] = await Promise.all([
				getPost(postId),
				getComments(postId)
			]);
			post = postRes;
			liked = postRes.liked_by_me;
			likesCount = postRes.likes_count;
			comments = commentsRes.comments;
			nextCursor = commentsRes.next_cursor;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger ce post';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});

	async function loadMoreComments() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const res = await getComments(postId, nextCursor);
			comments = [...comments, ...res.comments];
			nextCursor = res.next_cursor;
		} finally {
			loadingMore = false;
		}
	}

	async function toggleLike() {
		if (likeBusy) return;
		likeBusy = true;
		const wasLiked = liked;
		liked = !wasLiked;
		likesCount += wasLiked ? -1 : 1;
		try {
			if (wasLiked) await unlikePost(postId);
			else await likePost(postId);
		} catch {
			liked = wasLiked;
			likesCount += wasLiked ? 1 : -1;
		} finally {
			likeBusy = false;
		}
	}

	function handleNewComment(comment: Comment) {
		comments = [comment, ...comments];
		if (post) post.comments_count += 1;
	}

	function handleCommentDeleted(commentId: string) {
		comments = comments.filter((c) => c.id !== commentId);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{post?.title ?? 'Post'}</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/community/posts" class="back-link">
			<ArrowLeftIcon size={13} strokeWidth={1.75} />
			<span>Fil</span>
		</a>
			<div class="masthead__right">
		<NotificationCenter />

	</div>
	</div>

	<div class="archive__inner">
		{#if loading}
			<p class="loading-text">Chargement…</p>
		{:else if loadError || !post}
			<div class="empty-state">
				<p class="empty-state__title">Impossible de charger ce post</p>
				{#if loadError}<p class="empty-state__body">{loadError}</p>{/if}
			</div>
		{:else}
			<article class="post">
				<div class="post__author">
					<div class="post__avatar">
						{#if post.author.avatar_url}
							<img src={post.author.avatar_url} alt={post.author.username} />
						{:else}
							<span>{post.author.username.slice(0, 2).toUpperCase()}</span>
						{/if}
					</div>
					<div>
						<span class="post__username">{post.author.username}</span>
						<span class="post__date">{formatDate(post.created_at)}</span>
					</div>
				</div>

				<h1 class="post__title">{post.title}</h1>
				<p class="post__content">{post.content}</p>

				{#if post.cover_image_url}
					<div class="post__cover">
						<img src={post.cover_image_url} alt={post.title} />
					</div>
				{/if}

				<div class="post__stats">
					<button type="button" class="post__stat" class:post__stat--active={liked} onclick={toggleLike}>
						<HeartIcon size={16} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
						<span>{likesCount}</span>
					</button>
					<span class="post__stat">
						<MessageCircleIcon size={16} strokeWidth={1.75} />
						<span>{post.comments_count}</span>
					</span>
				</div>
			</article>

			<section class="comments">
				<span class="comments__eyebrow">Commentaires</span>

				<div class="comments__new">
					<CommentForm postId={postId} onSubmitted={handleNewComment} />
				</div>

				{#if comments.length === 0}
					<p class="comments__empty">Aucun commentaire pour le moment.</p>
				{:else}
					<div class="comments__list">
						{#each comments as comment (comment.id)}
							<CommentItem
								{postId}
								{comment}
								onDeleted={() => handleCommentDeleted(comment.id)}
							/>
						{/each}
					</div>
				{/if}

				{#if nextCursor}
					<div class="comments__load-more">
						<button type="button" onclick={loadMoreComments} disabled={loadingMore}>
							{loadingMore ? 'Chargement…' : 'Charger plus de commentaires'}
						</button>
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>

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
  justify-content: space-between;
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
	}
	.back-link:hover { opacity: 0.55; }

	.archive__inner {
		max-width: 640px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	.loading-text {
		margin-top: 2.5rem;
		text-align: center;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title { font-size: 0.9rem; font-weight: 500; }
	.empty-state__body { margin-top: 0.3rem; font-size: 0.82rem; color: var(--muted); }

	.post__author {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}
	.post__avatar {
		width: 2.4rem;
		height: 2.4rem;
		flex-shrink: 0;
		border: 1px solid var(--border);
		background: #f1efe9;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: var(--muted);
	}
	.post__avatar img { width: 100%; height: 100%; object-fit: cover; }
	.post__username { display: block; font-size: 0.85rem; font-weight: 500; }
	.post__date { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: var(--muted); }

	.post__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.5rem, 4vw, 2rem);
		line-height: 1.25;
		margin-top: 1.25rem;
	}
	.post__content {
		margin-top: 0.75rem;
		font-size: 0.95rem;
		line-height: 1.7;
		color: #2b2a26;
		white-space: pre-line;
	}
	.post__cover {
		margin-top: 1.25rem;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: #f1efe9;
	}
	.post__cover img { width: 100%; height: 100%; object-fit: cover; display: block; }

	.post__stats {
		display: flex;
		gap: 1.25rem;
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		padding-bottom: 1.75rem;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.post__stat {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: none;
		border: none;
		padding: 0;
		color: var(--muted);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.post__stat--active { color: var(--fg); }

	.comments {
		margin-top: 2rem;
	}
	.comments__eyebrow {
		display: block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 1.25rem;
	}
	.comments__new {
		margin-bottom: 1.5rem;
	}
	.comments__empty {
		padding: 2rem 0;
		text-align: center;
		font-size: 0.82rem;
		color: var(--muted);
		border-top: 1px solid var(--border);
	}

	.comments__load-more {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
	}
	.comments__load-more button {
		padding: 0.55rem 1.25rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--fg);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
	}
	.comments__load-more button:disabled { opacity: 0.5; cursor: not-allowed; }
</style> -->


<!-- src/routes/posts/[id]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import HeartIcon from "@lucide/svelte/icons/heart";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import { getPost, getComments, likePost, unlikePost } from '$lib/features/posts/api';
	import type { Post, Comment } from '$lib/features/posts/types';
	import CommentForm from '$lib/features/posts/components/comment-form.svelte';
	import CommentItem from '$lib/features/posts/components/comment-item.svelte';
	import NotificationCenter from '$lib/features/notifications/components/NotificationCenter.svelte';

	let postId = $derived(page.params.id);

	let post = $state<Post | null>(null);
	let comments = $state<Comment[]>([]);
	let nextCursor = $state<string | undefined>(undefined);
	let loading = $state(true);
	let loadingMore = $state(false);
	let loadError = $state<string | null>(null);

	let liked = $state(false);
	let likesCount = $state(0);
	let likeBusy = $state(false);

	async function load() {
		loading = true;
		loadError = null;
		try {
			const [postRes, commentsRes] = await Promise.all([
				getPost(postId),
				getComments(postId)
			]);
			post = postRes;
			liked = postRes.liked_by_me;
			likesCount = postRes.likes_count;
			comments = commentsRes.comments;
			nextCursor = commentsRes.next_cursor;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger ce post';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});

	async function loadMoreComments() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const res = await getComments(postId, nextCursor);
			comments = [...comments, ...res.comments];
			nextCursor = res.next_cursor;
		} finally {
			loadingMore = false;
		}
	}

	async function toggleLike() {
		if (likeBusy) return;
		likeBusy = true;
		const wasLiked = liked;
		liked = !wasLiked;
		likesCount += wasLiked ? -1 : 1;
		try {
			if (wasLiked) await unlikePost(postId);
			else await likePost(postId);
		} catch {
			liked = wasLiked;
			likesCount += wasLiked ? 1 : -1;
		} finally {
			likeBusy = false;
		}
	}

	function handleNewComment(comment: Comment) {
		comments = [comment, ...comments];
		if (post) post.comments_count += 1;
	}

	function handleCommentDeleted(commentId: string) {
		comments = comments.filter((c) => c.id !== commentId);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{post?.title ?? 'Post'}</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/community/posts" class="back-link">
			<ArrowLeftIcon size={16} strokeWidth={2} />
			<span>Le fil</span>
		</a>
		<div class="masthead__right">
			<NotificationCenter />
		</div>
	</div>

	<div class="archive__inner">
		{#if loading}
			<p class="loading-text">Chargement…</p>
		{:else if loadError || !post}
			<div class="empty-state">
				<p class="empty-state__title">Impossible de charger ce post</p>
				{#if loadError}<p class="empty-state__body">{loadError}</p>{/if}
			</div>
		{:else}
			<article class="post">
				<h1 class="post__title">{post.title}</h1>

				<div class="post__author">
					<div class="post__avatar">
						{#if post.author.avatar_url}
							<img src={post.author.avatar_url} alt={post.author.username} />
						{:else}
							<span>{post.author.username.slice(0, 2).toUpperCase()}</span>
						{/if}
					</div>
					<div class="post__meta">
						<span class="post__username">{post.author.username}</span>
						<span class="post__date">{formatDate(post.created_at)}</span>
					</div>
				</div>

				<p class="post__content">{post.content}</p>

				{#if post.cover_image_url}
					<div class="post__cover">
						<img src={post.cover_image_url} alt={post.title} />
					</div>
				{/if}

				<div class="post__stats">
					<button type="button" class="post__stat" class:post__stat--active={liked} onclick={toggleLike}>
						<HeartIcon size={17} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
						<span>{likesCount}</span>
					</button>
					<span class="post__stat">
						<MessageCircleIcon size={17} strokeWidth={1.75} />
						<span>{post.comments_count}</span>
					</span>
				</div>
			</article>

			<section class="comments">
				<h2 class="comments__title">Commentaires</h2>

				<div class="comments__new">
					<CommentForm postId={postId} onSubmitted={handleNewComment} />
				</div>

				{#if comments.length === 0}
					<p class="comments__empty">Aucun commentaire pour le moment.</p>
				{:else}
					<div class="comments__list">
						{#each comments as comment (comment.id)}
							<CommentItem
								{postId}
								{comment}
								onDeleted={() => handleCommentDeleted(comment.id)}
							/>
						{/each}
					</div>
				{/if}

				{#if nextCursor}
					<div class="comments__load-more">
						<button type="button" onclick={loadMoreComments} disabled={loadingMore}>
							{loadingMore ? 'Chargement…' : 'Charger plus de commentaires'}
						</button>
					</div>
				{/if}
			</section>
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

	.masthead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
	}
	.masthead__right {
		display: flex;
		align-items: center;
	}
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--fg);
		text-decoration: none;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}
	.back-link:hover { opacity: 0.55; }

	.archive__inner {
		max-width: 720px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	.loading-text {
		margin-top: 2.5rem;
		font-size: 0.92rem;
		color: var(--muted);
	}

	.empty-state {
		margin-top: 1rem;
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

	/* Titre en tête, gros et serré — l'auteur passe dessous */
	.post__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(2.4rem, 8vw, 4.5rem);
		line-height: 0.95;
		letter-spacing: -0.04em;
	}

	.post__author {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-top: 1.5rem;
		padding: 1rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.post__avatar {
		width: 2.5rem;
		height: 2.5rem;
		flex-shrink: 0;
		border: 1px solid var(--rule);
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
	}
	.post__avatar img { width: 100%; height: 100%; object-fit: cover; }
	.post__meta {
		display: flex;
		flex-direction: column;
	}
	.post__username { font-size: 0.92rem; font-weight: 600; }
	.post__date { font-size: 0.8rem; color: var(--muted); }

	.post__content {
		margin-top: 1.75rem;
		max-width: 65ch;
		font-size: 1.05rem;
		line-height: 1.7;
		color: #222;
		white-space: pre-line;
	}
	.post__cover {
		margin-top: 1.75rem;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: #eee;
	}
	.post__cover img { width: 100%; height: 100%; object-fit: cover; display: block; }

	.post__stats {
		display: flex;
		gap: 1.5rem;
		margin-top: 2rem;
		padding: 1rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.post__stat {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: none;
		border: none;
		padding: 0;
		color: var(--muted);
		font-family: 'Hanken Grotesk', sans-serif;
		font-size: 0.92rem;
		font-weight: 600;
		cursor: pointer;
		transition: color 0.2s ease;
	}
	button.post__stat:hover,
	.post__stat--active { color: var(--fg); }

	.comments {
		margin-top: 3rem;
	}
	.comments__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.75rem, 4vw, 2.4rem);
		line-height: 1;
		letter-spacing: -0.035em;
		margin-bottom: 1.5rem;
	}
	.comments__new {
		margin-bottom: 1.5rem;
	}
	.comments__empty {
		padding: 2rem 0;
		font-size: 0.92rem;
		color: var(--muted);
		border-top: 1px solid var(--rule);
	}

	.comments__load-more {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
	}
	.comments__load-more button {
		padding: 0.7rem 1.5rem;
		background: none;
		border: 1px solid var(--rule);
		color: var(--fg);
		font-family: 'Hanken Grotesk', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.comments__load-more button:hover:not(:disabled) {
		background: var(--fg);
		color: #fff;
	}
	.comments__load-more button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>